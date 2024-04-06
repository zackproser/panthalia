import Post from '../types/posts';

export async function startBackgroundJobs(post: Post) {
  console.log(`startGitPostUpdates: %o`, post);

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  try {
    await fetch(`${baseUrl}/api/jobs`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(post),
    }).then(() => {
      console.log(`Finished updating existing post via git`)
    }).catch((err) => {
      console.log(`Error updatingf existing post via git: ${err}`)
    })
  } catch (error) {
    console.log(`error: ${error}`);
  }
}

