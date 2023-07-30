import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import { startGitPostUpdates } from '../../../lib/github';

import Post from '../../../types/posts';

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../lib/auth/options';

export async function GET(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  try {

    if (id) {
      // Get single post if id provided  
      const result = await sql`
        SELECT * 
        FROM posts
        WHERE id = ${id}
      `;

      console.log(`fetched post from DB: %o`, result.rows[0]);

      return new Response(JSON.stringify(result.rows[0]), {
        status: 200
      });

    } else {
      // Get all posts if no id
      const result = await sql`
        SELECT * 
        FROM posts
      `;

      return new Response(JSON.stringify({ posts: result.rows }), {
        status: 200
      });
    }
  } catch (error) {

    console.log(`error: ${error}`);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log(`Posts PUT route hit...`)

  const id = params.id
  const body = await request.json();

  const updatedPost: Post = {
    ...body
  }

  console.log(`Posts PUT updatedPost: %o`, updatedPost);

  try {
    const result = await sql`
      UPDATE posts 
      SET 
        title = ${updatedPost.title},
        summary = ${updatedPost.summary},
        content = ${updatedPost.content},
        leaderImagePrompt = ${updatedPost.leaderImagePrompt},
        imagePrompts = ${JSON.stringify(updatedPost.imagePrompts)}
      WHERE id = ${id}
      RETURNING *
  `;

    console.log(`result: % o`, result.rows[0]);

    // We want the latest post record from the database because it will include the unchanging slug that was chosen on creation
    // And which we treat as a const - we don't want it to change, so that multiple functions can always resolve the same filepaths, etc
    const fullPostRecord: Post = result.rows[0] as Post;

    // Intentionally fire and forget the background job to update the post content via git 
    // and push the changes to the same branch associated with the open pull request 
    startGitPostUpdates(fullPostRecord)

    return NextResponse.json({ post: result.rows[0] }, { status: 200 });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  console.log(`id: ${id} `);

  try {
    const result = await sql`
      DELETE FROM posts
      WHERE id = ${id}
      RETURNING *
    `;

    console.log(`result: % o`, result);

    return NextResponse.json({ post: result.rows[0] }, { status: 200 });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }

}

