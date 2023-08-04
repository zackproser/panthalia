import { getSession } from 'next-auth/react';
import { sql } from '@vercel/postgres';
import { downloadImagesFromS3 } from '../../lib/s3'
import { commitAndPush } from '../../lib/git';

// This route is a get because of the way that image downloading logic works: 
// The user can see all the images generated for a given post on its edit page 
// They have the opportunity to delete whichever images they want
// When this route is hit, it means the user pressed the commit images button, which means they're content with all the 
// images currently associated with the current post - which means that this route can simply be hit and the sql query it 
// performs can just select all the images still associated with the current post
export async function GET(req, res) {
  // Ensure user is authenticated
  const session = await getSession({ req });
  if (!session) {
    return res.status(403).send('Unauthorized');
  }

  // Get post id from query
  const { postId } = req.query;

  try {
    // Fetch images for post
    // // 
    const result = await sql`
      SELECT * FROM images WHERE post_id = ${postId}
    `;

    const imageUrls = result.rows.map((image => image.image_url))

    await downloadImagesFromS3(imageUrls)

    // Commit and push
    await commitAndPush(filePaths, 'Add new images');

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing images.' });
  }
}

export default { GET };

