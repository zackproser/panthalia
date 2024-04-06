import { NextResponse } from 'next/server'
import { processPost } from '../../lib/github';
import { startImageGeneration } from '../../lib/image';
import Post from "../../types/posts";

export const maxDuration = 300; // Allow this route to run for up to 5 minutes

export async function POST(request: Request) {

  const newPost = await request.json() as Post;

  await startImageGeneration(newPost.id)

  await processPost(newPost)
    .then(() => console.log('Post processing complete'))
    .catch(error => {
      console.error('Post processing error:', error);
    });

  return NextResponse.json({ success: true }, { status: 200 })
}
