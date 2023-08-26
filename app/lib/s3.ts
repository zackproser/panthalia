import { S3 } from 'aws-sdk';

import { join } from 'path';
import fs from 'fs'

import { clonePath } from '../lib/git'

// Initialize the Amazon S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function downloadImageFromS3(imageKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const imageFilepath = join(clonePath, 'src', 'images', `${imageKey}.png`).toLowerCase()

    console.log(`downloadImageFromS3 - Downloading image from S3: ${imageKey}`)

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageKey
    };

    // Touch the target filepath if it doesn't exist
    fs.closeSync(fs.openSync(imageFilepath, 'w'));

    const file = fs.createWriteStream(imageFilepath, { flags: 'w' });
    const stream = s3.getObject(params).createReadStream();

    stream.on('error', reject);

    stream.on('data', (chunk) => {
      file.write(chunk);
    });

    stream.on('end', () => {
      file.end();
    });

    file.on('finish', function() {
      console.log(`S3 imageKey: ${imageKey} downloaded successfully to filepath: ${imageFilepath}`);
      resolve();
    });

    file.on('error', reject);
  });
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

// Returns a Promise which returns a string
export async function uploadImageToS3(url: string, key: string): Promise<string> {
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


