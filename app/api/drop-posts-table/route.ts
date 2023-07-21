import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// TODO - put some kind of confirmation flow in front of this route!

export async function GET() {
  try {
    console.log('drop-table-route running...')

    const result = await sql`DROP TABLE posts;`

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {

    console.dir(error)

    return NextResponse.json({ error }, { status: 500 });
  }
}

