import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Hardcoded R2 Configuration
const R2_ENDPOINT = 'https://c1ffe2a047324de22a97326f1090305c.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = 'c41b0bdd8a0e81b4cef90ca47a459ef6';
const R2_SECRET_ACCESS_KEY = '5797d45eac30cbd53ca9ff8e40b77a4e3eea862c86183ad760ce1aadcc4c3059';
const R2_BUCKET_NAME = 'tastetrackai-images-staging';

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export class R2Service {
  /**
   * Upload a file to R2 and return the object key
   */
  static async uploadFile(
    file: File,
    userId: string,
    discoveryId: string,
    fileName?: string
  ): Promise<string> {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 10);
    
    const objectKey = `users/${userId}/discoveries/${discoveryId}/${timestamp}_${randomHash}.${fileExtension}`;

    // Convert File to Uint8Array for AWS SDK compatibility
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Body: uint8Array,
      ContentType: file.type,
      Metadata: {
        userId,
        discoveryId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await r2Client.send(command);
      return objectKey;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a signed URL for accessing an image
   * @param objectKey - The R2 object key
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   */
  static async generateSignedUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });

    try {
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Generate a signed URL for GET operations (viewing images)
   */
  static async generateGetSignedUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });

    try {
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating GET signed URL:', error);
      throw new Error('Failed to generate signed URL for viewing');
    }
  }

  /**
   * Delete a file from R2
   */
  static async deleteFile(objectKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });

    try {
      await r2Client.send(command);
    } catch (error) {
      console.error('Error deleting from R2:', error);
      throw new Error('Failed to delete image from R2');
    }
  }

  /**
   * Upload multiple files and return their object keys
   */
  static async uploadMultipleFiles(
    files: File[],
    userId: string,
    discoveryId: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(file, userId, discoveryId, `image_${index}`)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Generate signed URLs for multiple images
   */
  static async generateMultipleSignedUrls(
    objectKeys: string[],
    expiresIn: number = 3600
  ): Promise<string[]> {
    const urlPromises = objectKeys.map(key => this.generateGetSignedUrl(key, expiresIn));
    return Promise.all(urlPromises);
  }
}
