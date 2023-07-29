import fs from 'fs';
import { rmdir } from 'fs/promises';
import { waitForBranch } from './github';

const slugify = require('slugify');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

export function slugifyTitle(title: string): string {
  return slugify(title, { remove: /[*+~.()'"!:@?]/g }).toLowerCase();
}

export async function cloneRepoAndCheckoutBranch(clonePath: string, branchName: string) {

  console.log(`Cloning portfolio repo...`);

  // Blow away any previous clones
  await wipeClone(clonePath);

  await git.clone({
    fs,
    http,
    dir: clonePath,
    url: 'https://github.com/zackproser/portfolio.git'
  }).then(() => {
    console.log('Repo successfully cloned.')
  }).catch((err: Error) => {
    console.log(`error during git clone operations: ${err}`);
  })

  // Create a new branch
  await git.branch({
    fs,
    dir: clonePath,
    ref: branchName,
    checkout: true,
  }).then(() => {
    console.log(`Successfully created new branch: ${branchName}`);
    return clonePath
  }).catch((err: Error) => {
    console.log(`error creating new branch: ${err}`);
    return ''
  })

  return clonePath
}

export async function commitAndPush(dirPath: string, filepath: string, branchName: string, title: string, update: boolean) {

  console.log(`commitAndPush: dirPath: ${dirPath} filepath: ${filepath}`);

  const gitAuthor = {
    name: 'Zachary Proser',
    email: 'zackproser@gmail.com'
  }

  // Add a file to the staging area
  await git.add({ fs, dir: dirPath, filepath });

  // Commit the changes
  await git.commit({
    fs,
    dir: dirPath,
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
    dir: dirPath,
    remote: 'origin',
    ref: branchName,
    force: true,
    onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
  }).then(() => {
    console.log(`Successfully git pushed changes.`);
  }).catch((err: Error) => {
    console.log(`error during git push operation: ${err}`);
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
  if (fs.existsSync(clonePath)) {
    console.log('Removing existing clone directory...');
    await rmdir(clonePath, { recursive: true });
  }
}
