import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../lib/auth/options'

/**
 * This route creates the posts table, if it doesn't already exist
 **/

export async function GET(request: Request) {
    try {
        console.log('/api/create-table-route hit...')

        // Bounce the request if the user is not authenticated
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await sql`
          CREATE TABLE IF NOT EXISTS POSTS (
              id SERIAL PRIMARY KEY, 
              title TEXT, 
              slug TEXT,
              summary TEXT, 
              content TEXT, 
              status VARCHAR(50) CHECK (status IN ('drafting', 'review', 'published')), 
              githubpr TEXT, 
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
                    githubpr
                ) 
                VALUES 
                (
                    'AI in the Modern World', 
                    'ai-in-the-modern-world',
                    'A deep dive into the impacts of AI in our daily lives.', 
                    'Content for the blog post goes here...', 
                    'drafting', 
                    'https://github.com/user/repo/pull/1'
                ), 
                (
                    'Introduction to Quantum Computing', 
                    'introduction-to-quantum-computing',
                    'A beginner-friendly introduction to the concepts of quantum computing.', 
                    'Content for the blog post goes here...', 
                    'drafting', 
                    'https://github.com/user/repo/pull/2'
                ), 
                (
                    'Understanding Machine Learning', 
                    'understanding-machine-learning',
                    'Breaking down the basics of Machine Learning and its applications.', 
                    'Content for the blog post goes here...', 
                    'published', 
                    'https://github.com/user/repo/pull/3'
                );
              `
            console.log(`Result of seedPostsTableStatement: % o`, seedDbResult)
        }

        // Create the images table 
        const imageTableResult = await sql`
            CREATE TABLE images (
              id SERIAL PRIMARY KEY,
              post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,  
              prompt_text TEXT,
              error TEXT,
              image_url TEXT 
            );
        `

        console.log(`create images table result: %o`, imageTableResult)

        return NextResponse.json({ result, seedDb }, { status: 200 });

    } catch (error) {

        console.log(`Error creating tables: %o`, error)
        console.dir(error)

        return NextResponse.json({ error }, { status: 500 });
    }
}

