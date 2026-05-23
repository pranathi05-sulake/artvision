import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucket = process.env.AWS_S3_BUCKET || 'wall-art-assets';
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    // In development without AWS credentials, return a local URL
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.NODE_ENV === 'development') {
      return this.uploadLocal(buffer, key, contentType);
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.headObject({ Bucket: this.bucket, Key: key }).promise();
      return true;
    } catch {
      return false;
    }
  }

  private async uploadLocal(_buffer: Buffer, key: string, _contentType: string): Promise<string> {
    // For local development, return a placeholder URL
    // In production, files would be stored in S3
    const localUrl = `http://localhost:4000/uploads/${key}`;
    console.log(`[Dev] File would be uploaded to: ${localUrl}`);
    return localUrl;
  }
}

export const storageService = new StorageService();
