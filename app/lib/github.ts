import { Octokit } from "octokit";

import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type GetResponseType = RestEndpointMethodTypes["pulls"]["create"]["response"];

import { sql } from '@vercel/postgres';

const simpleGit = require('simple-git');

const slugify = require('slugify');

const git = simpleGit();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

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
  const postFilePath = `${cloneUrl}/src/pages/blog/${slugifiedTitle}.mdx`;

  console.log(`postFilePath: ${postFilePath}`);

  fs.writeFileSync(postFilePath, postContent);

  const gitUsername = "Zachary Proser"
  const gitUserEmail = "zackproser@gmail.com"

  // Configure git so that author and email are set properly
  configureGit(gitUsername, gitUserEmail);

  // Add new blog post and make an initial commit
  commitAndPushPost(postFilePath, branchName, newPost.title);

  // Try sleeping to see if GitHub can find the new branch
  // Bummer, this works :(
  // TODO: add a check via GitHub API to see if the branch exists, and if it does not, 
  // only then sleep 
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




