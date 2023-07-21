import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';


const createTableStatement = `
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  blurb TEXT,
  content TEXT,
  status VARCHAR(50) CHECK (status IN ('drafting', 'review', 'published')),
  githubPR VARCHAR(255),
  vercelPreviewURL VARCHAR(255),
  imageURL VARCHAR(255),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`

export async function GET() {

  console.log('pets route hit')

  try {
    const result = await sql`DROP TABLE Pets`;

    console.dir(result)

    return NextResponse.json({ result }, { status: 200 });

  } catch (error) {

    console.dir(error)

    return NextResponse.json({ error }, { status: 500 });
  }
}
