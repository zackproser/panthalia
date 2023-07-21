import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

/**
 * This route creates the posts table, if it doesn't already exist
 **/
const createTableStatement = `
CREATE TABLE IF NOT EXISTS posts (
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

export async function GET(request: Request) {
  try {
    console.log('create-table-route running...')

    const result = await sql[createTableStatement]

    console.log(`Result of createTableStatement: %o`, result)

    // Optionally seed the db with some test posts, if the query string param seed_db=true was passed
    const { searchParams } = new URL(request.url)

    const seedDb = searchParams.get('seed_db')

    if (seedDb === 'true') {
      console.log('seeding database with test posts because query param seed_db=true was passed...')
      //      const seedDbResult = await sql`seedPostsTableStatement`
      const seedDbResult = await sql`
INSERT INTO posts (title, blurb, content, status, githubPR, vercelPreviewURL, imageURL)
VALUES 
('AI in the Modern World', 'A deep dive into the impacts of AI in our daily lives.', 'Content for the blog post goes here...', 'drafting', 'https://github.com/user/repo/pull/1', 'https://vercel.app/preview/1', 'https://myimages.com/img1.png'),
('Introduction to Quantum Computing', 'A beginner-friendly introduction to the concepts of quantum computing.', 'Content for the blog post goes here...', 'review', 'https://github.com/user/repo/pull/2', 'https://vercel.app/preview/2', 'https://myimages.com/img2.png'),
('Understanding Machine Learning', 'Breaking down the basics of Machine Learning and its applications.', 'Content for the blog post goes here...', 'published', 'https://github.com/user/repo/pull/3', 'https://vercel.app/preview/3', 'https://myimages.com/img3.png');

`
      console.log(`Result of seedPostsTableStatement: %o`, seedDbResult)
    }

    return NextResponse.json({ result, seedDb }, { status: 200 });
  } catch (error) {

    console.dir(error)

    return NextResponse.json({ error }, { status: 500 });
  }
}

