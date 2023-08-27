import { NextResponse } from 'next/server';

import Post from '../../types/posts';

import {
  processPost,
  updatePostWithOpenPR
} from '../../lib/github'

export async function POST(request: Request) {

  try {

    console.log('git POST route hit...')

    const newPost: Post = await request.json()

    console.log(`newPost data submitted /api/git: %o`, newPost)

    // Intentionally fire and forget the post processing routine
    await processPost(newPost).then(() => {
      console.log('post processing complete')
    }).catch((error) => {
      console.log(`post processing error: ${error}`)
    })

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {

    console.log(`error: ${error}`);
    return NextResponse.json({ error }, { status: 500 });

  }
}

export async function PUT(request: Request) {

  try {

    console.log('git PUT route hit...')

    const updatedPost: Post = await request.json()
    console.log(`updatedPost data submitted /api/git: %o`, updatedPost)

    await updatePostWithOpenPR(updatedPost).then(() => {

      console.log('post updating complete')
      return NextResponse.json({ success: true }, { status: 200 });

    }).catch((error) => {

      console.log(`post updating error: ${error}`)
      return NextResponse.json({ success: false }, { status: 500 });

    })

  } catch (error) {

    console.log(`error: ${error}`);
    return NextResponse.json({ error }, { status: 500 });
  }
}
