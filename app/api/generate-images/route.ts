import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres'
import { types } from 'pg';

import Post from '../../types/posts';

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

types.setTypeParser(17, function(val) {
  return Buffer.from(val, 'hex');
});

export async function POST(request: Request) {
  console.log(`generate-images POST route hit...`)

  const newPost: Post = await request.json() as Post

  console.log(`generate-images newPost: %o`, newPost)

  const output = await replicate.run(
    "stability-ai/sdxl:2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
    {
      input: {
        prompt: newPost.leaderImagePrompt
      }
    }
  );

  console.log(`Got output from calling replicate API: %o`, output)
  const stableDiffusionImageURL = output[0];

  // Fetch the image from the URL as a Buffer
  const response = await fetch(stableDiffusionImageURL);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  console.log(`arrayBuffer :%o`, arrayBuffer)

  const result = await sql`
    INSERT INTO images 
       (post_id, image) 
    VALUES (${newPost.id}, ${imageBuffer.toString('hex')})
  `
  console.log(`result of storing image binary data to database: %o`, result)

  return NextResponse.json({
    success: true
  })
}
