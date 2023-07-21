import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {

  console.dir(params)

  const id = params.id

  try {

    if (id) {
      // Get single post if id provided  
      const result = await sql`
        SELECT * 
        FROM posts
        WHERE id = ${id}
      `;

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

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {

    console.log(`error: ${error}`);

    return NextResponse.json({ error }, { status: 500 });

  }
}

