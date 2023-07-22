import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import fs from 'fs';

import slugify from 'slugify'

import { createPullRequest, cloneRepo } from "../../lib/github";
import { generatePostContent } from "../../utils/posts";

import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

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

    // Clone my portfolio repository from GitHub so we can add the post to 
    const cloneUrl = await cloneRepo("portfolio");

    console.log(`cloneUrl: ${cloneUrl}`);

    // Generate post content
    const postContent = generatePostContent(title, summary, content);

    console.log(`postContent: ${postContent}`);

    // Write post file
    const postFilePath = `${cloneUrl}/src/pages/blog/${slugify(title)}.mdx`;

    console.log(`postFilePath: ${postFilePath}`);

    fs.writeFileSync(postFilePath, postContent);

    const owner = "zackproser"
    const repo = "portfolio"

    const branchName = `panthalia-${title}-${Date.now()}`

    console.log(`branchName: ${branchName}`);

    // Get latest commit 
    const latestCommit = await octokit.rest.repos.getCommit({ owner, repo, ref: 'main' })

    console.log(`latestCommit: %o`, latestCommit);

    // Get tree from latest commit
    const latestTree = await octokit.rest.git.getTree({ owner, repo, tree_sha: latestCommit.data.sha })

    // Create new tree with updated file
    const newTree = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: [
        {
          path: postFilePath,
          mode: '100644',
          type: 'blob',
          content: postContent
        }
      ],
      base_tree: latestTree.data.sha
    })

    // New tree object to reference in commit
    const commitTree = newTree.data

    // Stage changes
    await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Add new post: ${title}`,
      tree: commitTree.sha,
      parents: [latestCommit.data.sha]
    });

    // Generate commit
    const commit = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommit.data.sha
    });

    // Push commit
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: commit.data.sha
    });


    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {

    console.log(`error: ${error}`);

    return NextResponse.json({ error }, { status: 500 });

  }
}

