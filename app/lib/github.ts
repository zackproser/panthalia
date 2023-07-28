import { Octokit } from "octokit";

import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type GetResponseType = RestEndpointMethodTypes["pulls"]["create"]["response"];

import { sql } from '@vercel/postgres';

const slugify = require('slugify');

const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

import path from 'path';

import fs from 'fs';

import { rmdir } from 'fs/promises';

import { generatePostContent } from '../utils/posts';

const clonePath = '/tmp/repo';

import Post from '../types/posts'

export async function startGitProcessing(post: Post) {

  console.log(`startGitProcessing: %o`, post);

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  try {
    fetch(`${baseUrl}/api/git`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(post),
    });
  } catch (error) {
    console.log(`error: ${error}`);
  }
}

export async function processPost(newPost: Post) {

  console.log(`newPost data submitted to processPost function: %o`, newPost)

  const slugifiedTitle = slugify(newPost.title, { remove: /[*+~.()'"!:@?]/g }).toLowerCase();

  const branchName = `panthalia-${slugifiedTitle}-${Date.now()}`

  // Update the post record with the generated branch name
  const addBranchResult = await sql`
      UPDATE posts
      SET gitbranch = ${branchName}
      WHERE id = ${newPost.id}
    `
  console.log(`Result of updating post with gitbranch: %o`, addBranchResult);

  // Clone my portfolio repository from GitHub so we can add the post to it
  const cloneUrl = await cloneRepoAndCheckoutBranch(branchName);

  console.log(`cloneUrl: ${cloneUrl}`);

  // Generate post content
  const postContent = await generatePostContent(newPost.title, newPost.summary, newPost.content);

  console.log(`postContent: ${postContent}`);

  // Write post file
  const postFilePath = `src/pages/blog/${slugifiedTitle}.mdx`;

  console.log(`postFilePath: ${postFilePath}`);

  fs.writeFileSync(path.join(cloneUrl, postFilePath), postContent)

  // Add new blog post and make an initial commit
  commitAndPush(cloneUrl, postFilePath, branchName, newPost.title);

  // Wait for GitHub to finish processing the pushed branch so it doesn't result in a 404 the 
  // next time we try to look it up while opening a pull request
  await new Promise(resolve => setTimeout(resolve, 7000));

  const prTitle = `Add blog post: ${newPost.title}`;
  const baseBranch = 'main'
  const body = `
      This pull request was programmatically opened by Panthalia (github.com/zackproser/panthalia)
    `
  const pullRequestURL = await createPullRequest(prTitle, branchName, baseBranch, body);

  // Associate the pull request URL with the post 
  const addPrResult = await sql`
      UPDATE posts
      SET githubpr = ${pullRequestURL}
      WHERE id = ${newPost.id}
    `

  console.log(`Result of updating post with githuburl: %o`, addPrResult);

  return
}

async function wipeClone() {
  if (fs.existsSync(clonePath)) {
    console.log('Removing existing clone directory...');
    await rmdir(clonePath, { recursive: true });
  }
}

export async function createPullRequest(title: string, head: string, base: string, body: string) {

  console.log(`createPullRequest running...`)

  try {
    const response: GetResponseType = await octokit.rest.pulls.create({
      owner: "zackproser",
      repo: "portfolio",
      title,
      head,
      base,
      body
    });

    console.log(`Pull request URL: %s`, response.data.html_url);

    return response.data.html_url

  } catch (error) {

    console.log(`createPullRequest error: %o`, error);
  }

}

export async function cloneRepoAndCheckoutBranch(branchName: string) {

  console.log(`Cloning portfolio repo...`);

  // Blow away any previous clones
  await wipeClone();

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

export async function commitAndPush(dirPath: string, filepath: string, branchName: string, title: string) {

  console.log(`commitAndPush: dirPath: ${dirPath} filepath: ${filepath}`);

  // Add a file to the staging area
  await git.add({ fs, dir: dirPath, filepath });

  // Commit the changes
  await git.commit({
    fs,
    dir: dirPath,
    author: {
      name: 'Zachary Proser',
      email: 'zackproser@gmail.com'
    },
    message: `Add post ${title}`
  }).then(() => {

    console.log
  })

  // Push the commit
  await git.push({
    fs,
    http,
    dir: dirPath,
    remote: 'origin',
    ref: branchName,
    onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
  });
}


