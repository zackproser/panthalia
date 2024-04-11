import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../../lib/auth/options';

export async function PUT(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log(`Posts PUT route hit...`)

  const id = params.id
  const body = await request.json();

  const updatedContent = body.content;

  console.log(`Posts PUT updatedContent: %o`, updatedContent);

  try {
    const result = await sql`
      UPDATE posts 
      SET 
        content = ${updatedContent}
      WHERE id = ${id}
      RETURNING *
  `;

    console.log(`result: % o`, result.rows[0]);

    return NextResponse.json({ post: result.rows[0] }, { status: 200 });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }
}
