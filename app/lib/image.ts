import Post from '../types/posts'

import { imagePrompt } from '../types/images'

export async function startImageGeneration(post: Post) {

  console.log(`startImageGeneration: %o`, post);

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  // Set up the structured image requests for the image generation backend
  let imagePrompts: imagePrompt[] = []

  if (post.leaderImagePrompt.text.trim() !== "") {
    imagePrompts.push({
      postId: post.id,
      text: post.leaderImagePrompt.text,
      type: "leader"
    })
  }

  for (const prompt of post.imagePrompts) {
    if (prompt.text.trim() !== "") {
      imagePrompts.push({
        postId: post.id,
        text: prompt.text,
        type: "image"
      })
    }
  }

  console.log(`startImageGeneration processed the following image prompts to request from StableDiffusion: %o`, imagePrompts);

  // For each image prompt, generate an image via the image generation endpoint 
  // There are two image types: leaderimage and image - leaderimage gets associated with the post
  // metadata and rendered on the blog post index page, whereas images are just generated, stored in the images 
  // table and associated with the post via post id
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


