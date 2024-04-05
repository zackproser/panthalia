import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

import { join } from 'path';
import fs from 'fs'

import { Readable } from 'stream'

import { clonePath } from '../lib/git'

const client = new S3Client({});

async function downloadImageFromS3(imageKey: string): Promise<void> {

  console.log(`downloadImageFromS3 - Downloading image from S3: ${imageKey}`);

  // Build the full filepath to the image within my portfolio site's repository
  const imageFilepath = join(clonePath, 'src', 'images', `${imageKey}.png`).toLowerCase()

  // Touch the target filepath if it doesn't exist to avoid errors when deployed on Vercel
  // and using the /tmp directory
  fs.closeSync(fs.openSync(imageFilepath, 'w'));

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: imageKey
  }

  const command = new GetObjectCommand(params);

  try {
    const response = await client.send(command);

    if (!response.Body) {
      throw new Error(`S3 download image error: ${imageKey} not found`);
    }

    return new Promise((resolve, reject) => {

      // Convert the response to a readable stream
      const readableStream = response.Body as Readable;
      const stream = readableStream.pipe(fs.createWriteStream(imageFilepath));
      // Reject the promise on stream error
      stream.on('error', (err) => {
        console.error(`S3 download image error: %o`, err);
        reject();
      })
      // Resolve the promise on stream finish, which allows for writing the entire file locally 
      // so that it can be committed
      stream.on('finish', () => {
        console.log(`downloadImageFromS3 - Downloaded image from S3: ${imageKey}`);
        resolve();
      })

    })

  } catch (err) {
    console.error(`S3 download image error: %o`, err);
  }
}

export async function downloadImagesFromS3(urls: string[]) {
  // Download each image, commit and push
  for (const url of urls) {

    const s3Url = new URL(url);
    const imageKey = s3Url.pathname.substring(1);

    try {
      await downloadImageFromS3(imageKey);
    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  }
}

export async function uploadImageToS3(imageData: string, key: string): Promise<string> {
  try {
    console.log(`uploadImageToS3 - Uploading image to S3: key: ${key}`);

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png', // Consider dynamically determining this based on the image data
    };

    const command = new PutObjectCommand(params);
    const putResponse = await client.send(command);

    console.log(`putResponse HTTP status code: ${putResponse.$metadata.httpStatusCode}`);

    if (putResponse.$metadata.httpStatusCode !== 200) {
      throw new Error(`Failed to upload image to S3. HTTP status code: ${putResponse.$metadata.httpStatusCode}`);
    }

    return `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
  } catch (error) {
    console.error(`Error uploading image to S3: ${error}`);
    throw error; // Rethrow to allow the caller to handle the error appropriately
  }
}

export async function deleteImageFromS3(key: string) {

  console.log(`deleteImageFromS3 - Deleting image from S3: ${key} `);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  }

  const command = new DeleteObjectCommand(params);

  try {
    const response = await client.send(command);
    console.log(`S3 delete response: % o$`, response);
  } catch (err) {
    console.error(`S3 delete item error: % o`, err);
  }
}
