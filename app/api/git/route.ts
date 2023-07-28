import { NextResponse } from 'next/server';

import Post from '../../types/posts';

import { processPost } from '../../lib/github'

export async function POST(request: Request) {

  try {

    console.log('git POST route hit...')

    const newPost: Post = await request.json()

    console.log(`newPost data submitted /api/git: %o`, newPost)

    // Intentionally fire and forget the post processing routine
    processPost(newPost)

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {

    console.log(`error: ${error}`);

    return NextResponse.json({ error }, { status: 500 });

  }
}
