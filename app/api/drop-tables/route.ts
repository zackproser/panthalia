import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../lib/auth/options'

// TODO - put some kind of confirmation flow in front of this route!

export async function GET() {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log('drop-tables-route hit...')

    const result = await sql`DROP TABLE POSTS CASCADE;`
    const resultImages = await sql`DROP TABLE images`;

    return NextResponse.json({ result, resultImages }, { status: 200 });
  } catch (error) {

    console.dir(error)

    return NextResponse.json({ error }, { status: 500 });
  }
}

