import { ImageMetadata, LocationData } from '@/types/discovery';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export class ImageService {
  static async uploadImages(files: File[]): Promise<string[]> {
    // This would typically upload to a cloud storage service
    // For now, we'll return placeholder URLs
    // In a real implementation, this would upload to Supabase Storage
    return files.map((_, index) => `https://example.com/image-${index}.jpg`);
  }

  static async uploadImage(file: File): Promise<string> {
    // This would typically upload to a cloud storage service
    // For now, we'll return a placeholder URL
    return `https://example.com/image-${Date.now()}.jpg`;
  }

  static async compressImage(image: any): Promise<File> {
    const result = await manipulateAsync(
      image,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    // Convert to File object
    const response = await fetch(result.uri);
    const blob = await response.blob();
    return new File([blob], 'compressed-image.jpg', { type: 'image/jpeg' });
  }

  static async compressImages(images: any[]): Promise<File[]> {
    const compressedImages = await Promise.all(
      images.map(image => this.compressImage(image))
    );
    return compressedImages;
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
