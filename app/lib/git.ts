import fs from 'fs';
import { rmdir } from 'fs/promises';

import slugify from 'slugify';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export const clonePath = '/tmp/repo';

export function slugifyTitle(title: string): string {
  return slugify(title, { remove: /[*+~.()'"!:@?]/g }).toLowerCase();
}

// Convenience method to clone my portfolio repo and checkout the supplied branch
export async function cloneRepoAndCheckoutBranch(branchName: string) {
  try {
    // Wipe away previous clones and re-clone
    await freshClone();
    // Check if the branch already exists locally, if not, fetch it
    const localBranches = await git.listBranches({ fs, dir: clonePath });
    if (!localBranches.includes(branchName)) {
      console.log(`Branch ${branchName} not found locally. Fetching...`);
      await git.fetch({
        fs,
        http,
        dir: clonePath,
        ref: branchName,
        depth: 1,
        singleBranch: true,
        onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
      });
    }

    // Checkout the existing branch
    await git.checkout({
      fs,
      dir: clonePath,
      ref: branchName,
    });

    console.log(`Successfully checked out branch: ${branchName}`);

  } catch (err) {
    console.log(`cloneRepoAndCheckoutBranch: Error during git operations: ${err}`);
    return null;
  }
}

// Commit and push the changes on the supplied git branch
export async function commitAndPush(branchName: string, title: string) {

  console.log(`commitAndPush: clonePath: ${process.env.CLONE_PATH}, branchName: ${branchName}, title: ${title}`);

  try {

    const gitAuthor = {
      name: 'Zachary Proser',
      email: 'zackproser@gmail.com'
    }

    // Add a file to the staging area
    await git.add({
      fs,
      dir: process.env.CLONE_PATH,
      // Commit all the files in the path
      filepath: '.'
    });

    // Commit the changes
    await git.commit({
      fs,
      dir: process.env.CLONE_PATH,
      author: gitAuthor,
      message: `Add post ${title}`
    }).then(() => {
      console.log(`Successfully committed changes.`);
    }).catch((err: Error) => {
      console.log(`error during git commit operation: ${err}`);
    })

    // Push the commit
    await git.push({
      fs,
      http,
      dir: process.env.CLONE_PATH,
      remote: 'origin',
      ref: branchName,
      force: true,
      onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
    }).then(() => {
      console.log(`Successfully git pushed changes.`);
    })

  } catch (err) {
    console.log(`Error during git operations: ${err}`);
  }
}

// Convenience method to wipe previous repo and re-clone it fresh
export async function freshClone() {
  // Blow away any previous clones 
  await wipeClone();

  // Clone the repo
  await cloneRepo();
}

// Convenience method to clone my portfolio repo and checkout the main branch
export async function cloneRepo() {
  console.log('cloneRepo running...');
  // Clone the repo
  console.log(`Cloning portfolio repo branch: main'}`);

  await git.clone({
    fs,
    http,
    dir: clonePath,
    url: 'https://github.com/zackproser/portfolio.git',
    singleBranch: true,
    depth: 1,
    ref: 'main',
  });

  console.log('Repo successfully cloned.');
}

// Wipe the clone directory
export async function wipeClone() {
  const clonePath = process.env.CLONE_PATH;
  console.log('wipeClone running...')
  if (fs.existsSync(clonePath)) {
    console.log('Removing existing clone directory...');
    await rmdir(clonePath, { recursive: true });
    console.log('Previously existing clone directory removed.');
  } else {
    console.log('No clone directory to remove...');
  }
}
