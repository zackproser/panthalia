import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { uploadImageToS3 } from '../../lib/s3';
import { QueryResultRow, sql } from '@vercel/postgres';
import { imagePrompt, PanthaliaImage } from '../../types/images';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export async function POST(request: Request) {
  console.log(`generate-images POST route hit...`);

  const prompt: imagePrompt = await request.json() as imagePrompt;
  console.log(`generate-images prompt: %o`, prompt);

  const panthaliaImg = new PanthaliaImage({ promptText: prompt.text });

  try {
    const response = await openai.images.generate({
      prompt: panthaliaImg.getPromptText(),
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const imageData = response.data[0].b64_json;
    const s3UploadPath = panthaliaImg.getBucketObjectKey();

    console.log(`slugified s3UploadPath: ${s3UploadPath}`);

    const uploadedImageS3Path = await uploadImageToS3(imageData, s3UploadPath);

    let result: QueryResultRow;

    if (prompt.regen) {
      result = await sql`
        INSERT INTO images (image_url, prompt_text, post_id)
        VALUES (${uploadedImageS3Path}, ${prompt.text}, ${prompt.postId})
      `;
    } else {
      result = await sql`
        UPDATE images
        SET image_url = ${uploadedImageS3Path}, post_id = ${prompt.postId}
        WHERE id = ${prompt.imageId}
      `;
    }

    console.log(`Result of saving S3 image URL to images table: %o for post_id: ${prompt.postId}`, result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error generating image via prompt: ${prompt.text}`, error);

    const errorText = `Error generating image via prompt: ${prompt.text}`;

    const errorResult = await sql`
      UPDATE posts
      SET error = ${errorText}
      WHERE id = ${prompt.postId}
    `;

    console.log(`Result of updating error text for post_id: ${prompt.postId}`, errorResult);

    return NextResponse.json({ success: false, error: errorText }, { status: 500 });
  }
}
