import { Octokit } from "octokit";

const simpleGit = require('simple-git');

const git = simpleGit();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

import fs from 'fs';

import { rmdir } from 'fs/promises';

const clonePath = '/tmp/repo';

async function wipeClone() {
  if (fs.existsSync(clonePath)) {
    console.log('Removing existing clone directory...');
    await rmdir(clonePath, { recursive: true });
  }
}

export async function createPullRequest(title, head, base, body) {

  console.log(`createPullRequest running...`)

  const response = await octokit.rest.pulls.create({
    owner: "zackproser",
    repo: "portfolio",
    title,
    head,
    base,
    body
  }).catch((err) => {
    console.log(`error during createPullRequest operation: ${err}`);
  })

  console.log(`Pull request URL: %s`, response.data.html_url);

  return response.data.html_url;
}

export async function cloneRepoAndCheckoutBranch(branchName) {

  console.log(`Cloning portfolio repo...`);

  // Blow away any previous clones
  await wipeClone();

  await git.clone('https://github.com/zackproser/portfolio.git', clonePath).then(() => {
    console.log('Successfully cloned portfolio repo');
    console.log(`Checking out branch ${branchName}...`);
  })

  await git.cwd({ path: clonePath, root: true });

  await git.raw(['checkout', '-b', branchName]).then(() => {
    console.log('Successfully checked out branch');
  }).catch((err) => {
    console.log(`error during git clone and branch checkout operations: ${err}`);
  })

  return clonePath;
}

export function configureGit(userName, userEmail) {
  git.addConfig('user.name', userName, false, 'global');
  git.addConfig('user.email', userEmail, false, 'global');
}

export async function commitAndPushPost(filePath, branchName, title) {

  await git.cwd({ path: clonePath, root: true });

  console.log(`Adding and committing ${filePath}...`);

  await git.add(filePath).then(() => {
    console.log(`Added ${filePath} to git`)
  }).catch((err) => {
    console.log(`error during git add and commit operations: ${err}`);
  })

  await git.commit(`Add post: ${title}`).then(() => {
    console.log(`Successfully committed ${filePath}`);
  }).catch((err) => {
    console.log(`error during git commit operations: ${err}`);
  })

  await git.push('origin', branchName).then(() => {
    console.log(`Successfully pushed ${branchName}`);
  }).catch((err) => {
    console.log(`error during git push operations: ${err}`);
  })
}




