import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { uploadImageToS3 } from '../../lib/s3';
import { sql } from '@vercel/postgres'

import { imagePrompt, PanthaliaImage } from '../../types/images';

// Set up Replicate API client with API token env var
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  console.log(`generate-images POST route hit...`)

  const prompt: imagePrompt = await request.json() as imagePrompt

  console.log(`generate-images prompt: %o`, prompt)

  const panthaliaImg = new PanthaliaImage({ promptText: prompt.text })

  const output = await replicate.run(
    "stability-ai/sdxl:2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
    {
      input: {
        prompt: panthaliaImg.getPromptText(),
      }
    }
  );

  console.log(`Got output from calling replicate API: %o`, output)
  const stableDiffusionImageURL = (Array.isArray(output) && output.length > 0) ? output[0] : undefined

  if (typeof stableDiffusionImageURL !== undefined) {
    const s3UploadPath = panthaliaImg.getBucketObjectKey()
    console.log(`slugified s3UploadPath: %o`, s3UploadPath)

    const uploadedImageS3Path = await uploadImageToS3(stableDiffusionImageURL, s3UploadPath);

    // Update the image in the images table with the latest image_url value  
    const result = await sql`
      UPDATE images 
      SET image_url = ${uploadedImageS3Path},
          post_id = ${prompt.postId}
      WHERE id = ${prompt.imageId}
    `
    console.log(`Result of saving S3 image URL to images table: %o for post_id: ${prompt.postId}`, result)
  } else {
    // Otherwise, the image generation failed for some reason - so we don't save anything to S3 and we don't have 
    // anything new to save to the images table - we also want to update the image as having had an error 
    // so that we can render the failed image generation prompt on the edit post page 
    const errorText = `Error generating image via prompt: ${prompt.text}`

    const errorResult = await sql`
      UPDATE posts
      SET error = ${errorText}
      WHERE id = ${prompt.postId}
    `

    console.log(`Result of updating error text for post_id: ${prompt.postId}`, errorResult)
  }

  return NextResponse.json({
    success: true
  })
}


