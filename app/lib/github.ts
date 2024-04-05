import path from 'path';
import fs from 'fs';

import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

import {
  cloneRepo,
  wipeClone
} from './git';

import { sql } from '@vercel/postgres';
import { Octokit } from "octokit";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { PanthaliaImage } from '../types/images';

import Post from '../types/posts'
import { generatePostContent } from '../utils/posts';
import {
  slugifyTitle,
  cloneRepoAndCheckoutBranch,
  commitAndPush
} from './git';

type GetResponseType = RestEndpointMethodTypes["pulls"]["create"]["response"];

// Octokit is the GitHub API client (used for opening pull requests)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const maxRetries = 10;

export async function waitForBranch(owner: string, repo: string, branch: string) {
  console.log(`waitForBranch: waiting for branch: ${branch} on ${owner}/${repo}`);
  for (let i = 1; i <= maxRetries; i++) {
    console.log(`waitForBranch on try number ${i}...`);
    try {
      // Attempt to get branch
      await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch
      }).then(() => {
        // Branch found
        console.log(`Branch found via GitHub API: ${branch}`);
      })
      // Success
      return;
    } catch (error) {
      // Branch not found yet
      // Exponential backoff
      const waitTime = i * 1000;
      console.log(`waitForBranch sleeping for ${waitTime} milliseconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Timeout waiting for branch')
}

export async function startGitPostUpdates(post: Post) {
  console.log(`startGitPostUpdates: %o`, post);

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  try {
    await fetch(`${baseUrl}/api/git`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(post),
    }).then(() => {
      console.log(`Finished updating existing post via git`)
    }).catch((err) => {
      console.log(`Error updatingf existing post via git: ${err}`)
    })
  } catch (error) {
    console.log(`error: ${error}`);
  }
}

export async function updatePostWithOpenPR(updatedPost: Post) {
  try {
    console.log(`updatedPost data submitted to updatePostWithOpenPR function: %o`, updatedPost);

    // Ensure the post has an associated branchName
    if (updatedPost.gitbranch === '') {
      console.log('updatedPost missing git branch information - cannot update existing PR');
      return { success: false, reason: "Missing git branch information" };
    }

    // Clone the repo and checkout the same branch associated with the open PR
    const cloneUrl = await cloneRepoAndCheckoutBranch(updatedPost.gitbranch);
    if (!cloneUrl) {
      console.log('Failed to clone repo and checkout branch');
      return { success: false, reason: "Failed to clone repo" };
    }
    console.log(`cloneUrl: ${cloneUrl}`);

    // Fetch images related to the post
    const imagesResult = await sql`
      select * from images
      where post_id = ${updatedPost.id}
      and error IS NULL
    `;

    let images: PanthaliaImage[] = [];

    if (imagesResult.rows.length > 0) {
      for (const imageRow of imagesResult.rows) {
        const promptText = imageRow.prompt_text;
        const panthaliaImage = new PanthaliaImage({ promptText });
        images.push(panthaliaImage);
      }
    }

    // Generate post content
    const postContent = await generatePostContent(
      updatedPost.title,
      updatedPost.summary,
      updatedPost.content,
      images
    );

    // Define the post file path
    // For my blog posts the path is src/pages/blog/[slug]/[slug].mdx where [slug] is the slugified title
    const postFilePath = `src/pages/blog/${updatedPost.slug}/${updatedPost.slug}.mdx`;

    // Update post file in repo with new content
    fs.writeFileSync(path.join(cloneUrl, postFilePath), postContent);

    // Commit the update and push it on the existing branch
    await commitAndPush(updatedPost.gitbranch, updatedPost.title);

    return { success: true };

  } catch (error) {
    console.log(`updatePostWithOpenPR error: %o`, error);
    return { success: false, error };
  }
}

async function createNewBranchForPost(newPost: Post): Promise<string | null> {
  try {

    // Blow away any pre-existing clones of the repository
    await wipeClone();

    // We have to start out by cloning the repository
    await cloneRepo();

    const slugifiedTitle = slugifyTitle(newPost.title);
    // The branch name for a given post is determined one time and then stored in the database for future reference
    // All subsequent times the branch name is needed it can be fetched from the database
    const branchName = `panthalia-${slugifiedTitle}-${Date.now()}`

    await git.branch({
      fs,
      dir: process.env.CLONE_PATH,
      ref: branchName,
      checkout: true
    });

    console.log(`Created new branch: ${branchName}`);

    // Push the branch to the remote repo
    await git.push({
      fs,
      http,
      dir: process.env.CLONE_PATH,
      remote: 'origin',
      ref: branchName,
      force: true,
      onAuth: () => ({ username: 'git', password: process.env.GITHUB_TOKEN }),
    }).then(() => {
      console.log(`Successfully pushed new git branch: ${branchName}.`);
    }).catch((err: Error) => {
      console.log(`createNewBranchForPost: error during git push operation: ${err}`);
      console.log(`error: %o`, err);
    })

    // Because we're dealing with GitHub, we also need to handle propagation delays
    // waitForBranch implements exponential backoff to repeatedly request the branch from GitHub's API
    // Until the branch is available in GitHub, the subsequent open pull request operation will fail
    await waitForBranch('zackproser', 'portfolio', branchName)

    // If pushing the branch succeeded, update Panthalia's database to associate the branch with
    // the new post
    const addBranchResult = await sql`
      UPDATE posts
      SET 
        gitbranch = ${branchName},
        slug = ${slugifiedTitle}
      WHERE id = ${newPost.id}
    `
    console.log(`Result of updating post with gitbranch: %o`, addBranchResult);

    return branchName;
  } catch (error) {
    console.log(`error creating new branch: ${error}`);
    return null;
  }
}

export async function processPost(newPost: Post): Promise<boolean> {

  console.log(`newPost data submitted to processPost function: %o`, newPost)

  const slugifiedTitle = slugifyTitle(newPost.title);

  const branchName = await createNewBranchForPost(newPost);
  if (!branchName) {
    console.log(`createNewBranchForPost failed`);
    return false;
  }

  // If the post has at least one image, use the image as the leader image which will render on the blog index page
  const imagesResult = await sql`
    select * from images 
    where post_id = ${newPost.id}
    and error IS NULL 
  `

  let images: PanthaliaImage[] = [];

  if (imagesResult.rows.length > 0) {
    // Gather up the current images and convert them to PanthaliaImages, as expected by the generatePostContent
    for (const imageRow of imagesResult.rows) {
      const promptText = imageRow.prompt_text
      const panthaliaImage = new PanthaliaImage({ promptText });
      images.push(panthaliaImage);
    }
  }

  // Generate post content
  const postContent = await generatePostContent(
    newPost.title,
    newPost.summary,
    newPost.content,
    images
  );

  // Create containing folder 
  fs.mkdirSync(path.join(process.env.CLONE_PATH, 'src/app/blog', slugifiedTitle), { recursive: true });

  // Write post file - for my blog posts, the format is src/app/blog/[slug]/[slug].mdx where slug is the slugified title
  const postFilePath = `src/app/blog/${slugifiedTitle}/${slugifiedTitle}.mdx`;
  console.log(`postFilePath: ${postFilePath}`);

  // Write the post content to the expected path to add it as a blog post in my portfolio project
  fs.writeFileSync(path.join(process.env.CLONE_PATH, postFilePath), postContent)

  // Add new blog post and make an initial commit
  await commitAndPush(branchName, newPost.title);

  await createPullRequest(branchName, newPost);

  return false;
}

export async function createPullRequest(branchName: string, newPost: Post) {
  const prTitle = `Add blog post: ${newPost.title}`;
  const baseBranch = 'main'
  const body = `
      This pull request was programmatically opened by Panthalia (github.com/zackproser/panthalia)
    `
  console.log(`createPullRequest running...`)

  try {
    const response: GetResponseType = await octokit.rest.pulls.create({
      owner: "zackproser",
      repo: "portfolio",
      title: prTitle,
      head: branchName,
      base: baseBranch,
      body
    });

    console.log(`Pull request URL: %s`, response.data.html_url);

    // Associate the pull request URL with the post 
    const addPrResult = await sql`
      UPDATE posts
      SET githubpr = ${response.data.html_url}
      WHERE id = ${newPost.id}
    `
    console.log(`Result of updating post with githuburl: %o`, addPrResult);

  } catch (error) {

    console.log(`createPullRequest error: %o`, error);
  }
}

