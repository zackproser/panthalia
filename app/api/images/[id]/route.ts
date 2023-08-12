import { NextRequest, NextResponse } from "next/server"
import { sql } from '@vercel/postgres';

import { deleteImageFromS3 } from '../../../lib/s3';
import { S3Image } from '../../../types/images';

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../lib/auth/options';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const postId = params.id

  console.log(`/api/images/ GET route hit with postId: ${postId}`)

  try {
    const result = await sql`SELECT id, image_url FROM images WHERE post_id = ${postId}`;
    console.log(`result of querying image_urls from images associated with post_id: ${postId}: %o`, result)

    let images = []


    images = result.rows.map((row => {

      const s3Image = new S3Image({ url: row.image_url.toString() })

      return {
        id: row.id,
        image_url: s3Image.getPublicUrl(),
        slug: s3Image.getBucketObjectKey(),
        alt: s3Image.getImageAltText(),
        rendered: s3Image.getReactRenderedImage()
      }
    }));

    console.log(`image.image_url re-mapped as strings before before being returned to frontend: %o`, images)

    return NextResponse.json({ images }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const imageId = params.id
  console.log(`images DELETE route hit with imageId: ${imageId}`)

  // Delete the image row from the images table 
  const result = await sql`DELETE FROM images WHERE id = ${imageId}`;
  console.log(`result of deleting image with id: ${imageId}: %o`, result)

  const body = await req.json();
  console.log(`body of DELETE request: %o`, body)

  const s3Image = new S3Image({ url: body.imageUrl })
  const s3PathToDelete = s3Image.getBucketObjectKey()

  const deleteResult = await deleteImageFromS3(s3PathToDelete)
  console.log(`result of deleting S3 image at path: ${s3PathToDelete}: %o`, deleteResult)

  return NextResponse.json({ success: deleteResult }, { status: 200 })
}

