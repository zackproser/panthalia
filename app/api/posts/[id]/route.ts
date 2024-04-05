import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

import { updatePostWithOpenPR } from '../../../lib/github';

import Post from '../../../types/posts';
import { PanthaliaImage } from '../../../types/images';

import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../lib/auth/options';

export async function GET(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  try {

    if (id) {
      // Get single post if id provided  
      const result = await sql`
        SELECT * 
        FROM posts
        WHERE id = ${id}
      `;

      let postResult

      if (result.rows && result.rows[0]) {
        postResult = result.rows[0] as any
        console.log(`postResult: %o`, postResult);
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      console.log(`fetched post from DB: %o`, result.rows[0]);

      // Get all images for the given post
      const imagesResult = await sql`
        SELECT *
        FROM images
        WHERE post_id = ${id}
      `;

      console.log(`imagesResult: %o`, imagesResult);

      postResult.images = []

      imagesResult.rows.forEach((imageRow) => {
        if (!imageRow) {
          return;
        }

        const panthaliaImg = new PanthaliaImage({ promptText: imageRow.prompt_text ?? '' });

        console.log(`panthaliaImg: %o`, panthaliaImg);

        if (!panthaliaImg.isValid()) {
          return
        }

        console.log(`panthaliaImg: %o`, panthaliaImg.getImportStatement());

        postResult.images.push({
          id: imageRow.id,
          text: panthaliaImg.getPromptText(),
          alt: panthaliaImg.getImageAltText(),
          image_url: panthaliaImg.getPublicUrl(),
          image_var_name: panthaliaImg.getImageVariableName(),
          import_statement: panthaliaImg.getImportStatement(),
          rendered: panthaliaImg.getReactRenderedImage()
        })

      })

      return NextResponse.json(postResult, { status: 200 });

    } else {
      // Get all posts if no id
      const result = await sql`
        SELECT * 
        FROM posts
      `;

      return NextResponse.json({ posts: result.rows }, { status: 200 });
    }
  } catch (error) {
    console.log(`error: ${error}`);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log(`Posts PUT route hit...`)

  const id = params.id
  const body = await request.json();

  const updatedPost: Post = {
    ...body
  }

  console.log(`Posts PUT updatedPost: %o`, updatedPost);

  try {
    const result = await sql`
      UPDATE posts 
      SET 
        title = ${updatedPost.title},
        summary = ${updatedPost.summary},
        content = ${updatedPost.content}
      WHERE id = ${id}
      RETURNING *
  `;

    console.log(`result: % o`, result.rows[0]);

    // We want the latest post record from the database because it will include the unchanging slug that was chosen on creation
    // And which we treat as a const - we don't want it to change, so that multiple functions can always resolve the same filepaths, etc
    const fullPostRecord: Post = result.rows[0] as Post;

    await updatePostWithOpenPR(fullPostRecord)

    return NextResponse.json({ post: result.rows[0] }, { status: 200 });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {

  // Bounce the request if the user is not authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  console.log(`id: ${id} `);

  try {

    // First, clear out all associated images from the database
    const ImgResult = await sql`
      DELETE FROM images
      WHERE post_id = ${id}
    `;
    console.log(`ImgResult: % o`, ImgResult);

    const result = await sql`
      DELETE FROM posts
      WHERE id = ${id}
      RETURNING *
    `;
    console.log(`result: % o`, result);

    return NextResponse.json({ post: result.rows[0] }, { status: 200 });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }

}

