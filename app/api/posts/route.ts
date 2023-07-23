import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import fs from 'fs';

import slugify from 'slugify'

import {
  createPullRequest,
  cloneRepoAndCheckoutBranch,
  commitAndPushPost,
  configureGit,
} from "../../lib/github";

import { generatePostContent } from "../../utils/posts";

export async function GET() {

  try {

    // Get all posts 
    const result = await sql`
        SELECT * 
        FROM posts
      `;

    return new Response(JSON.stringify({ posts: result.rows }), {
      status: 200
    });
  } catch (error) {

    console.log(`error: ${error}`);
  }
}

export async function POST(request: Request) {
  try {

    console.log('posts POST route hit...')

    const formData = await request.json()

    console.log(`formData submitted: %o`, formData)

    const { title, summary, content, leaderImagePrompt, imagePrompts } = formData

    // Query to insert new blog post into the database
    const result = await sql`
      INSERT INTO posts (
        title,
        summary,
        content,
        leaderimageprompt,
        imageprompts,
        status
      )
      VALUES (
        ${title},
        ${summary},
        ${content},
        ${leaderImagePrompt},
        ${JSON.stringify(imagePrompts)},
        'drafting'
      )
      RETURNING *;
    `;

    // Save the postId so we can use it to update the record with the pull request URL once it's available
    const postId = result.rows[0].id

    const slugifiedTitle = slugify(title, { remove: /[*+~.()'"!:@?]/g }).toLowerCase();

    const branchName = `panthalia-${slugifiedTitle}-${Date.now()}`

    // Clone my portfolio repository from GitHub so we can add the post to it
    const cloneUrl = await cloneRepoAndCheckoutBranch(branchName);

    console.log(`cloneUrl: ${cloneUrl}`);

    // Generate post content
    const postContent = await generatePostContent(title, summary, content);

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
    commitAndPushPost(postFilePath, branchName, title);

    // Try sleeping to see if GitHub can find the new branch
    // Bummer, this works :(
    // TODO: add a check via GitHub API to see if the branch exists, and if it does not, 
    // only then sleep 
    await new Promise(resolve => setTimeout(resolve, 7000));

    const prTitle = `Add blog post: ${title}`;
    const baseBranch = 'main'
    const body = `
      This pull request was programmatically opened by Panthalia (github.com/zackproser/panthalia)
    `
    const pullRequestURL = await createPullRequest(prTitle, branchName, baseBranch, body);

    // Associate the pull request URL with the post 
    const addPrResult = await sql`
      UPDATE posts
      SET githubpr = ${pullRequestURL}
      WHERE id = ${postId}
    `

    console.log(`Result of updating post with githuburl: %o`, addPrResult);

    return NextResponse.json({ pullRequestURL }, { status: 200 });

  } catch (error) {

    console.log(`error: ${error}`);

    return NextResponse.json({ error }, { status: 500 });

  }
}

