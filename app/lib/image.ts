import Post from '../types/posts'

export async function startImageGeneration(post: Post) {

  console.log(`startImageGeneration: %o`, post);

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  try {
    fetch(`${baseUrl}/api/generate-images`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(post),
    });
  } catch (error) {
    console.log(`error: ${error}`);
  }
}


