import { NextResponse } from 'next/server'
import { processPost } from '../../lib/github';
import { startImageGeneration } from '../../lib/image';
import Post from "../../types/posts";

export async function POST(request: Request) {

  const newPost = await request.json() as Post;

  startImageGeneration(newPost.id)

  await processPost(newPost)
    .then(() => console.log('Post processing complete'))
    .catch(error => {
      console.error('Post processing error:', error);
    });

  return NextResponse.json({ success: true }, { status: 200 })
}
