import { S3 } from 'aws-sdk';

import { join } from 'path';
import fs from 'fs'

// Initialize the Amazon S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function downloadImagesFromS3(urls: string[]) {
  // Download each image, commit and push
  for (const url of urls) {
    const s3Url = new URL(url);
    const imageKey = s3Url.pathname.substring(1); // remove leading "/"
    const fileName = join('src', 'images', imageKey);

    // Download from S3 to local directory
    const params = { Bucket: process.env.S3_BUCKET_NAME, Key: imageKey };
    const fileStream = fs.createWriteStream(fileName);
    s3.getObject(params).createReadStream().pipe(fileStream);

    fileStream.on('error', (err) => {
      console.log(`Error writing S3 image to local filesystem err;`, err);
    });
  }
}

export async function uploadImageToS3(url: string, key: string) {
  // Fetch the image from the URL
  const response = await fetch(url);

  // Convert the image data to a Buffer
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer);

  // Set up the parameters for the upload
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key, // key also means filename storage path
    Body: buffer,
    ContentType: response.headers.get('content-type'),
  };

  // Upload the file to S3
  return new Promise((resolve, reject) => {
    s3.upload(params, function(err: Error, data: S3.ManagedUpload.SendData) {
      if (err) {
        reject(err);
      }
      console.log(`File uploaded successfully at ${data.Location}`);
      resolve(data.Location);
    });
  });
}

export async function deleteImageFromS3(key: string) {

  console.log(`deleteImageFromS3 - Deleting image from S3: ${key}`);

  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }, function(err: Error, data: S3.DeleteObjectOutput) {
      if (err) {
        console.log(`Error deleting image from S3: ${err}`);
        reject(err);
      }
      resolve(data);
    });
  });
}


