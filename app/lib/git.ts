import fs from 'fs';
import { rmdir } from 'fs/promises';
import { waitForBranch } from './github';

const slugify = require('slugify');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

export const clonePath = '/tmp/repo';

export function slugifyTitle(title: string): string {
  return slugify(title, { remove: /[*+~.()'"!:@?]/g }).toLowerCase();
}

export async function cloneRepoAndCheckoutBranch(branchName: string, update: boolean = false) {
  try {

    // Blow away any previous clones 
    await wipeClone(clonePath);

    // Clone the repo
    console.log(`Cloning portfolio repo...`);

    await git.clone({
      fs,
      http,
      dir: clonePath,
      url: 'https://github.com/zackproser/portfolio.git',
      // Only clone the main branch
      singleBranch: true,
      // Only get the latest commit - not the fully git history which takes forever
      depth: 1,
    });

    console.log('Repo successfully cloned.');

    if (update) {
      // Checkout the existing branch
      await git.checkout({
        fs,
        dir: clonePath,
        ref: branchName,
      });

      console.log(`Successfully checked out branch: ${branchName}`);
    } else {
      // Create a new branch
      await git.branch({
        fs,
        dir: clonePath,
        ref: branchName,
        checkout: true,
      });

      console.log(`Successfully created new branch: ${branchName}`);
    }

    return clonePath;
  } catch (err) {
    console.log(`Error during git operations: ${err}`);
    return null;
  }
}

export async function commitAndPush(branchName: string, title: string, update: boolean) {

  console.log(`commitAndPush: clonePath: ${clonePath}, branchName: ${branchName}, title: ${title}, update: ${update}`);

  const gitAuthor = {
    name: 'Zachary Proser',
    email: 'zackproser@gmail.com'
  }

  // Add a file to the staging area
  await git.add({
    fs,
    dir: clonePath,
    // Commit all the files in the path
    filepath: '.'
  });

  // Commit the changes
  await git.commit({
    fs,
    dir: clonePath,
    author: gitAuthor,
    message: update ? `Update post: ${title}` : `Add post ${title}`
  }).then(() => {
    console.log(`Successfully committed changes.`);
  }).catch((err: Error) => {
    console.log(`error during git commit operation: ${err}`);
  })

  // Push the commit
  await git.push({
    fs,
    http,
    dir: clonePath,
    remote: 'origin',
    ref: branchName,
    force: true,
    onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
  }).then(() => {
    console.log(`Successfully git pushed changes.`);
  }).catch((err: Error) => {
    console.log(`commitAndPush: error during git push operation: ${err}`);
  })

  // If this is the first time we're pushing the branch, we need to wait for GitHub 
  // propagation delays - otherwise the GitHub API may not find the branch by the time we 
  // attempt to open a pull request - which will result in a 404
  if (!update) {
    await waitForBranch('zackproser', 'portfolio', branchName)
  }

  return
}

export async function wipeClone(clonePath: string) {
  console.log('wipeClone running...')
  if (fs.existsSync(clonePath)) {
    console.log('Removing existing clone directory...');
    await rmdir(clonePath, { recursive: true });
  } else {
    console.log('No clone directory to remove...');
  }
}
