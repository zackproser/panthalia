import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { startGitProcessing } from '../../lib/github'
import { startImageGeneration } from '../../lib/image'
import Post from "../../types/posts";

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../lib/auth/options'

export async function GET(req: NextRequest, res: NextResponse) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {

    // Get all posts 
    const result = await sql`
        SELECT * 
        FROM posts
      `;

    return NextResponse.json({ posts: result.rows }, {
      status: 200
    });

  } catch (error) {

    console.log(`error getting all posts from database: ${error}`);
  }
}


export async function POST(request: Request) {
  try {

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Fire and forget the stable diffusion image generation routine
    startImageGeneration(newPost)

    // Fire and forget the post processing routine, while returning a response to the posts form quickly
    startGitProcessing(newPost)

    return NextResponse.json({ result, success: true }, { status: 200 });

  } catch (error) {

    console.log(`error: ${error} `);

    return NextResponse.json({ error }, { status: 500 });

  }
}

