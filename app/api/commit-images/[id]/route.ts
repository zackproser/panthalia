export const maxDuration = 240; // This function can run for a maximum of 240 seconds

import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../lib/auth/options'

import { sql } from '@vercel/postgres';

import { downloadImagesFromS3 } from '../../../lib/s3'
import { cloneRepoAndCheckoutBranch, commitAndPush } from '../../../lib/git';

// This route is a get because of the way that image downloading logic works: 
// The user can see all the images generated for a given post on its edit page 
// They have the opportunity to delete whichever images they want
// When this route is hit, it means the user pressed the commit images button, which means they're content with all the 
// images currently associated with the current post - which means that this route can simply be hit and the sql query it 
// performs can just select all the images still associated with the current post
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get post id from query
  const postId = params.id

  console.log(`commit-images route hit with post id: ${postId}`)

  try {
    // Fetch images for post
    // // 
    const result = await sql`
      SELECT image_url 
      FROM images 
      WHERE post_id = ${postId}
      AND image_url IS NOT NULL 
    `;

    console.log(`result: %o`, result)
    console.log(`result.rows: %o`, result.rows)

    let imageUrls: string[] = [];

    result.rows.map((row) => {
      imageUrls.push(row.image_url ?? '');
    })

    // Get the branch of the post 
    const postResult = await sql`
      SELECT gitbranch, title
        FROM posts
      WHERE id = ${postId}
    `
    const branchName = postResult.rows[0].gitbranch
    const postTitle = postResult.rows[0].title
    const update = true

    // Before we can download the images we need a fresh clone of the repo 
    await cloneRepoAndCheckoutBranch(branchName, update)

    console.log(`imageUrls prior to downloading from S3: ${imageUrls}`)

    await downloadImagesFromS3(imageUrls)

    // Commit and push
    await commitAndPush(branchName, postTitle, update);

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: err }, { status: 500 })
  }
}

