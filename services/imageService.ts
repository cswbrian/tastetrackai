import { R2Service } from '@/lib/r2';
import { ImageMetadata, LocationData } from '@/types/discovery';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export class ImageService {
  /**
   * Upload multiple images to R2 and return object keys
   */
  static async uploadImages(files: File[], userId: string, discoveryId: string): Promise<string[]> {
    try {
      // Upload to R2 directly without compression for now
      // TODO: Implement proper compression for File objects
      const objectKeys = await R2Service.uploadMultipleFiles(files, userId, discoveryId);
      
      return objectKeys;
    } catch (error) {
      console.error('Error uploading images to R2:', error);
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload a single image to R2
   */
  static async uploadImage(file: File, userId: string, discoveryId: string): Promise<string> {
    try {
      // Upload to R2 directly without compression for now
      // TODO: Implement proper compression for File objects
      const objectKey = await R2Service.uploadFile(file, userId, discoveryId);
      
      return objectKey;
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate signed URLs for multiple images
   */
  static async generateSignedUrls(objectKeys: string[], expiresIn: number = 3600): Promise<string[]> {
    try {
      return await R2Service.generateMultipleSignedUrls(objectKeys, expiresIn);
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      throw new Error('Failed to generate signed URLs');
    }
  }

  /**
   * Generate a signed URL for a single image
   */
  static async generateSignedUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await R2Service.generateGetSignedUrl(objectKey, expiresIn);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete an image from R2
   */
  static async deleteImage(objectKey: string): Promise<void> {
    try {
      await R2Service.deleteFile(objectKey);
    } catch (error) {
      console.error('Error deleting image from R2:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Compress image using expo-image-manipulator (for URI-based images)
   */
  static async compressImage(uri: string): Promise<string> {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    return result.uri;
  }

  /**
   * Compress multiple images (for URI-based images)
   */
  static async compressImages(uris: string[]): Promise<string[]> {
    const compressedImages = await Promise.all(
      uris.map(uri => this.compressImage(uri))
    );
    return compressedImages;
  }

  /**
   * Convert File object to URI for compression
   */
  static async fileToUri(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }

  /**
   * Compress File object by converting to URI first
   */
  static async compressFile(file: File): Promise<File> {
    try {
      // Convert File to URI
      const uri = await this.fileToUri(file);
      
      // Compress the image
      const compressedUri = await this.compressImage(uri);
      
      // Convert back to File
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      
      // Clean up the object URL
      URL.revokeObjectURL(uri);
      
      return new File([blob], file.name, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error compressing file:', error);
      // Return original file if compression fails
      return file;
    }
  }

  static async extractEXIFLocation(image: File): Promise<LocationData | null> {
    try {
      // In a real implementation, you would use a library like exif-reader
      // to extract EXIF data from the image file
      // For now, we'll return null as this is complex to implement in React Native
      return null;
    } catch (error) {
      console.error('Error extracting EXIF location:', error);
      return null;
    }
  }

  static async extractEXIFFromImages(images: File[]): Promise<Record<string, LocationData>> {
    const results: Record<string, LocationData> = {};
    
    for (const image of images) {
      const location = await this.extractEXIFLocation(image);
      if (location) {
        results[image.name] = location;
      }
    }
    
    return results;
  }

  static async getImageMetadata(image: File): Promise<ImageMetadata> {
    // In React Native, we can't use the DOM Image object
    // For now, return basic metadata
    return {
      width: 0, // Would need to be extracted from image data
      height: 0, // Would need to be extracted from image data
      size: image.size,
      type: image.type,
    };
  }

  static validateImageFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    
    return file.size <= maxSize && allowedTypes.includes(file.type);
  }

  static async pickImages(): Promise<File[]> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      // Convert to File objects
      const files: File[] = [];
      for (const asset of result.assets) {
        if (asset.uri) {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
          files.push(file);
        }
      }
      return files;
    }

    return [];
  }

  static async takePhoto(): Promise<File | null> {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        return new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      }
    }

    return null;
  }
}
