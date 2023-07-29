import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

/**
 * This route creates the posts table, if it doesn't already exist
 **/

export async function GET(request: Request) {
    try {
        console.log('create-table-route running...')

        const result = await sql`
      CREATE TABLE posts (
          id SERIAL PRIMARY KEY, 
          title TEXT, 
          slug TEXT,
          summary TEXT, 
          content TEXT, 
          status VARCHAR(50) CHECK (status IN ('drafting', 'review', 'published')), 
          githubpr TEXT, 
          vercelpreviewurl TEXT, 
          leaderimageurl TEXT,
          leaderimageprompt TEXT, 
          imageprompts TEXT, 
          gitbranch TEXT,
          createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
          updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

        console.log(`Result of createTableStatement: %o`, result)

        // Optionally seed the db with some test posts, if the query string param seed_db=true was passed
        const { searchParams } = new URL(request.url)

        const seedDb = searchParams.get('seed_db')

        if (seedDb === 'true') {
            console.log('seeding database with test posts because query param seed_db=true was passed...')
            const seedDbResult = await sql`
        INSERT INTO posts (
            title, 
            slug,
            summary, 
            content, 
            status, 
            githubpr, 
            vercelpreviewurl, 
            leaderimageurl,
            leaderimageprompt, 
            imageprompts
        ) 
        VALUES 
        (
            'AI in the Modern World', 
            'ai-in-the-modern-world',
            'A deep dive into the impacts of AI in our daily lives.', 
            'Content for the blog post goes here...', 
            'drafting', 
            'https://github.com/user/repo/pull/1', 
            'https://vercel.app/preview/1', 
            'https://picsum.photos/500',
            'a leader image that is good', 
            '["image prompt 1", "image prompt 2", "image prompt 3"]'
        ), 
        (
            'Introduction to Quantum Computing', 
            'introduction-to-quantum-computing',
            'A beginner-friendly introduction to the concepts of quantum computing.', 
            'Content for the blog post goes here...', 
            'review', 
            'https://github.com/user/repo/pull/2', 
            'https://vercel.app/preview/2', 
            'https://picsum.photos/500',
            'a robot leader image', 
            '["image prompt 4", "image prompt 5", "image prompt 6"]'
        ), 
        (
            'Understanding Machine Learning', 
            'understanding-machine-learning',
            'Breaking down the basics of Machine Learning and its applications.', 
            'Content for the blog post goes here...', 
            'published', 
            'https://github.com/user/repo/pull/3', 
            'https://vercel.app/preview/3', 
            'https://picsum.photos/500',
            'a fluffy dog leader image', 
            '["image prompt 7", "image prompt 8", "image prompt 9"]'
        );
      `
            console.log(`Result of seedPostsTableStatement: % o`, seedDbResult)
        }

        return NextResponse.json({ result, seedDb }, { status: 200 });

    } catch (error) {

        console.dir(error)

        return NextResponse.json({ error }, { status: 500 });
    }
}

