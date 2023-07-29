import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { startGitProcessing } from '../../lib/github'
import Post from "../../types/posts";

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

    console.log(`error getting all posts from database: ${error}`);
  }
}


export async function POST(request: Request) {
  try {

    console.log('posts POST route hit...')

    const formData = await request.json()
    console.log(`formData submitted: % o`, formData)

    const { title, slug, summary, content, leaderImagePrompt, imagePrompts } = formData

    // Query to insert new blog post into the database
    const result = await sql`
      INSERT INTO posts(
      title,
      slug,
      summary,
      content,
      leaderimageprompt,
      imageprompts,
      status
    )
      VALUES(
      ${title},
      ${slug},
      ${summary},
      ${content},
      ${leaderImagePrompt},
      ${JSON.stringify(imagePrompts)},
      'drafting'
    )
      RETURNING *;
    `;

    // Save the postId so we can use it to update the record with the pull request URL once it's available
    const newPost: Post = {
      id: result.rows[0].id,
      title,
      slug,
      summary,
      content,
      // gitbranch and githubpr will be set within processPost 
      gitbranch: null,
      githubpr: null,
      leaderimageurl: null,
      leaderImagePrompt,
      imagePrompts,
    }

    // Fire and forget the post processing routine, while returning a response to the posts form quickly
    startGitProcessing(newPost)

    return NextResponse.json({ result, success: true }, { status: 200 });

  } catch (error) {

    console.log(`error: ${error} `);

    return NextResponse.json({ error }, { status: 500 });

  }
}

