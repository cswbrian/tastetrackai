import { supabase } from '@/lib/supabase';
import { Discovery, DiscoveryImage, DiscoveryInput } from '@/types/discovery';
import { ImageService } from './imageService';

export class DiscoveryService {
  static async createDiscovery(data: DiscoveryInput): Promise<Discovery> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start a transaction
    const { data: discovery, error: discoveryError } = await supabase
      .from('discoveries')
      .insert({
        user_id: user.id,
        text_content: data.text_content,
        category: data.category,
        discovery_type: data.discovery_type,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        location_name: data.location_name,
        location_source: data.location_source || 'none',
      })
      .select()
      .single();

    if (discoveryError) throw discoveryError;

    // Handle images if provided
    let images: DiscoveryImage[] = [];
    if (data.images && data.images.length > 0) {
      // Upload images to R2
      const objectKeys = await ImageService.uploadImages(data.images, user.id, discovery.id);
      
      // Generate signed URLs for immediate display
      const signedUrls = await ImageService.generateSignedUrls(objectKeys);

      // Save image records to database
      const imagePromises = objectKeys.map(async (objectKey, index) => {
        const { data: imageData, error: imageError } = await supabase
          .from('discovery_images')
          .insert({
            discovery_id: discovery.id,
            image_key: objectKey,
            image_url: signedUrls[index], // Cache the signed URL
            image_order: index,
          })
          .select()
          .single();

        if (imageError) throw imageError;
        return imageData;
      });

      images = await Promise.all(imagePromises);
    }

    return {
      ...discovery,
      images,
    };
  }

  static async getDiscoveries(): Promise<Discovery[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: discoveries, error } = await supabase
      .from('discoveries')
      .select(`
        *,
        discovery_images (
          id,
          discovery_id,
          image_key,
          image_url,
          image_order,
          exif_data,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process images and generate fresh signed URLs if needed
    const processedDiscoveries = await Promise.all(
      discoveries.map(async (discovery) => {
        const images = discovery.discovery_images || [];
        
        // Check if signed URLs are expired (older than 1 hour)
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        const processedImages = await Promise.all(
          images.map(async (image) => {
            // If no URL or URL is expired, generate a new one
            if (!image.image_url || (now - new Date(image.created_at).getTime()) > oneHour) {
              try {
                const newSignedUrl = await ImageService.generateSignedUrl(image.image_key);
                
                // Update the cached URL in database
                await supabase
                  .from('discovery_images')
                  .update({ image_url: newSignedUrl })
                  .eq('id', image.id);
                
                return { ...image, image_url: newSignedUrl };
              } catch (error) {
                console.error('Error generating signed URL:', error);
                return image;
              }
            }
            return image;
          })
        );

        return {
          ...discovery,
          images: processedImages.sort((a, b) => a.image_order - b.image_order),
        };
      })
    );

    return processedDiscoveries;
  }

  static async getDiscoveryById(id: string): Promise<Discovery | null> {
    const { data: discovery, error } = await supabase
      .from('discoveries')
      .select(`
        *,
        discovery_images (
          id,
          discovery_id,
          image_key,
          image_url,
          image_order,
          exif_data,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!discovery) return null;

    // Process images similar to getDiscoveries
    const images = discovery.discovery_images || [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const processedImages = await Promise.all(
      images.map(async (image) => {
        if (!image.image_url || (now - new Date(image.created_at).getTime()) > oneHour) {
          try {
            const newSignedUrl = await ImageService.generateSignedUrl(image.image_key);
            
            await supabase
              .from('discovery_images')
              .update({ image_url: newSignedUrl })
              .eq('id', image.id);
            
            return { ...image, image_url: newSignedUrl };
          } catch (error) {
            console.error('Error generating signed URL:', error);
            return image;
          }
        }
        return image;
      })
    );

    return {
      ...discovery,
      images: processedImages.sort((a, b) => a.image_order - b.image_order),
    };
  }

  static async updateDiscovery(id: string, data: Partial<Discovery>): Promise<Discovery> {
    const { data: discovery, error } = await supabase
      .from('discoveries')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return discovery;
  }

  static async deleteDiscovery(id: string): Promise<void> {
    // Get image keys before deletion
    const { data: images } = await supabase
      .from('discovery_images')
      .select('image_key')
      .eq('discovery_id', id);

    if (images && images.length > 0) {
      // Delete images from R2
      const deletePromises = images.map(img => ImageService.deleteImage(img.image_key));
      await Promise.all(deletePromises);
    }

    // Delete discovery (cascade will delete images from database)
    const { error } = await supabase
      .from('discoveries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async addImagesToDiscovery(discoveryId: string, images: File[]): Promise<DiscoveryImage[]> {
    // Get current max order
    const { data: existingImages } = await supabase
      .from('discovery_images')
      .select('image_order')
      .eq('discovery_id', discoveryId)
      .order('image_order', { ascending: false })
      .limit(1);

    const nextOrder = existingImages && existingImages.length > 0 
      ? existingImages[0].image_order + 1 
      : 0;

    // Get user ID for R2 upload
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload images to R2
    const objectKeys = await ImageService.uploadImages(images, user.id, discoveryId);
    
    // Generate signed URLs
    const signedUrls = await ImageService.generateSignedUrls(objectKeys);
    
    // Save image records to database
    const imagePromises = objectKeys.map(async (objectKey, index) => {
      const { data: imageData, error: imageError } = await supabase
        .from('discovery_images')
        .insert({
          discovery_id: discoveryId,
          image_key: objectKey,
          image_url: signedUrls[index],
          image_order: nextOrder + index,
        })
        .select()
        .single();

      if (imageError) throw imageError;
      return imageData;
    });

    return Promise.all(imagePromises);
  }

  static async removeImageFromDiscovery(imageId: string): Promise<void> {
    // Get image key before deletion
    const { data: image } = await supabase
      .from('discovery_images')
      .select('image_key')
      .eq('id', imageId)
      .single();

    if (image) {
      // Delete from R2
      await ImageService.deleteImage(image.image_key);
    }

    // Delete from database
    const { error } = await supabase
      .from('discovery_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  }

  static async reorderImages(discoveryId: string, imageOrder: {id: string, order: number}[]): Promise<void> {
    const updatePromises = imageOrder.map(({ id, order }) =>
      supabase
        .from('discovery_images')
        .update({ image_order: order })
        .eq('id', id)
    );

    await Promise.all(updatePromises);
  }
}
