import { NextResponse } from 'next/server';

import Replicate from "replicate";

import Post from '../../types/posts';

import { uploadImageToS3 } from '../../lib/s3';

import slugify from 'slugify'

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

  // Note: may need to convert this to fire a new request to the S3 image uploading endpoint
  const s3UploadPath = slugify(newPost.leaderImagePrompt.substring(0, 30))

  console.log(`s3UploadPath: %o`, s3UploadPath)

  await uploadImageToS3(stableDiffusionImageURL, s3UploadPath);


  return NextResponse.json({
    success: true
  })
}


