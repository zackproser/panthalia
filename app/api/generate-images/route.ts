import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { uploadImageToS3 } from '../../lib/s3';
import slugify from 'slugify'
import { sql } from '@vercel/postgres'

import Post from '../../types/posts';


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
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

  const s3UploadPath = slugify(newPost.leaderImagePrompt.substring(0, 30))
  console.log(`slugified s3UploadPath: %o`, s3UploadPath)

  const uploadedImageS3Path = await uploadImageToS3(stableDiffusionImageURL, s3UploadPath);

  // Save the S3 image to the posts table to associate it with the current Post
  const result = await sql`
    INSERT INTO images 
      (image_url, post_id) 
    VALUES (${uploadedImageS3Path}, ${newPost.id}) 
  `

  console.log(`Result of storing new image in posts table: %o`, result)

  // Save the leader image in the posts table
  const postUpdateResult = await sql`
    UPDATE posts
    SET leaderimageurl = ${uploadedImageS3Path}
    WHERE id = ${newPost.id}
  `

  console.log(`Result of updating posts table: %o`, postUpdateResult)

  return NextResponse.json({
    success: true
  })
}


