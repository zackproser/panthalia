import { Octokit } from "octokit";

const simpleGit = require('simple-git');

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

  const response = await octokit.rest.pulls.create({
    owner: "zackproser",
    repo: "portfolio",
    title,
    head,
    base,
    body
  });

  return response.data.html_url;
}

export async function cloneRepo() {

  console.log(`Cloning portfolio repo...`);

  // Blow away any previous clones
  await wipeClone();

  const repo = simpleGit();

  await repo.clone('https://github.com/zackproser/portfolio.git', clonePath);

  return clonePath;
}


