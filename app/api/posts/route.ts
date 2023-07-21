import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const result = await sql`
        SELECT * 
        FROM posts
      `;

    return NextResponse.json({ posts: result.rows }, { status: 200 });

  } catch (error) {
    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }
}

