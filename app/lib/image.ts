import { sql } from '@vercel/postgres';
import { imagePrompt } from '../types/images'

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export async function startImageGeneration(postId: number) {

  console.log(`startImageGeneration function hit with postId: %o`, postId);
  // Get post ID and use it to look up all of the images associated with the post that don't have: 
  // 1. an S3 URL associated with them
  // 2. an error associated with them which means they may have already been rejected as a prompt by the 
  // Replicate endpoint
  const imagesResult = await sql`
    SELECT *
    FROM images
    WHERE post_id = ${postId}
    AND image_url IS NULL
    AND error IS NULL
  `

  console.log(`startImageGeneration: select images result %o`, imagesResult);

  // Set up the structured image requests for the image generation backend
  let imagePrompts: imagePrompt[] = []

  for (const image of imagesResult.rows) {
    if (image.prompt_text.trim() !== "") {
      imagePrompts.push({
        imageId: image.id,
        postId: postId,
        text: image.prompt_text,
      })
    }
  }

  console.log(`startImageGeneration processed the following image prompts to request from StableDiffusion: %o`, imagePrompts);

  // For each image prompt, generate an image via the image generation endpoint 
  for (const prompt of imagePrompts) {
    console.log(`startImageGeneration requesting image prompt: %o`, prompt);

    try {
      fetch(`${baseUrl}/api/generate-images`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(prompt),
      }).catch((error: Error) => {
        console.log(`error requesting image generation for prompt %o ${error}`, prompt);
      }).finally(() => {
        console.log(`startImageGeneration done processing image prompt: %o`, prompt);
      })
    } catch (error) {
      console.log(`startImageGeneration: error calling /api/generate-images: ${error}`);
    }
  }
}


