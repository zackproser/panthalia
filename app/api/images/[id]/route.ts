import { NextRequest, NextResponse } from "next/server"
import { sql } from '@vercel/postgres';

import { deleteImageFromS3 } from '../../../lib/s3';
import { PanthaliaImage } from '../../../types/images';

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
    const result = await sql`
      SELECT *
      FROM images 
      WHERE post_id = ${postId}
    `;
    console.log(`result of querying image_urls from images associated with post_id: ${postId}: %o`, result)

    let images = []
    images = result.rows.map((row => {

      console.log(`DEBUG: /api/images GET %o`, row)

      const opts = {
        promptText: row.prompt_text
      }

      const panthaliaImg = new PanthaliaImage(opts)

      return {
        id: row.id,
        text: panthaliaImg.getPromptText(),
        alt: panthaliaImg.getImageAltText(),
        image_url: panthaliaImg.getPublicUrl(),
        image_var_name: panthaliaImg.getImageVariableName(),
        import_statement: panthaliaImg.getImportStatement(),
        slug: panthaliaImg.getBucketObjectKey(),
        rendered: panthaliaImg.getReactRenderedImage()
      }
    }));

    console.log(`image.image_url re-mapped as strings before before being returned to frontend: %o`, images)

    return NextResponse.json({ images }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const imageId = params.id
  console.log(`images PUT route hit with imageId: ${imageId}`)

  const body = await req.json();
  console.log(`body of PUT request: %o`, body)

  // Update the image row in the images table 
  const updateResult = await sql`
    UPDATE images 
    SET image_url = ${body.imageUrl}
    SET prompt_text = ${body.promptText} 
    WHERE id = ${imageId}
  `;
  console.log(`result of updating image with id: ${imageId}: %o`, updateResult)

  return NextResponse.json({ success: true, updateResult: updateResult }, { status: 200 })
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

  const s3Image = new PanthaliaImage({ url: body.imageUrl })
  const s3PathToDelete = s3Image.getBucketObjectKey()

  const deleteResult = await deleteImageFromS3(s3PathToDelete)
  console.log(`result of deleting S3 image at path: ${s3PathToDelete}: %o`, deleteResult)

  return NextResponse.json({ success: deleteResult }, { status: 200 })
}

