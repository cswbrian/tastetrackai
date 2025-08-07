import { supabase } from '@/lib/supabase';
import { Discovery, DiscoveryImage, DiscoveryInput } from '@/types/discovery';

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
      const imagePromises = data.images.map(async (file, index) => {
        // Upload image to storage
        const fileName = `${discovery.id}/${Date.now()}_${index}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('discovery-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('discovery-images')
          .getPublicUrl(fileName);

        // Save image record
        const { data: imageData, error: imageError } = await supabase
          .from('discovery_images')
          .insert({
            discovery_id: discovery.id,
            image_url: publicUrl,
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
          image_url,
          image_order,
          exif_data,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return discoveries.map(discovery => ({
      ...discovery,
      images: discovery.discovery_images || [],
    }));
  }

  static async updateDiscovery(id: string, data: Partial<Discovery>): Promise<Discovery> {
    const { data: discovery, error } = await supabase
      .from('discoveries')
      .update({
        text_content: data.text_content,
        category: data.category,
        discovery_type: data.discovery_type,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        location_name: data.location_name,
        location_source: data.location_source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Get images for the discovery
    const { data: images } = await supabase
      .from('discovery_images')
      .select('*')
      .eq('discovery_id', id)
      .order('image_order');

    return {
      ...discovery,
      images: images || [],
    };
  }

  static async deleteDiscovery(id: string): Promise<void> {
    // Delete images from storage first
    const { data: images } = await supabase
      .from('discovery_images')
      .select('image_url')
      .eq('discovery_id', id);

    if (images && images.length > 0) {
      const imageUrls = images.map(img => img.image_url);
      // Extract file paths from URLs and delete from storage
      const filePaths = imageUrls.map(url => {
        const pathMatch = url.match(/discovery-images\/(.+)$/);
        return pathMatch ? pathMatch[1] : null;
      }).filter(Boolean);

      if (filePaths.length > 0) {
        await supabase.storage
          .from('discovery-images')
          .remove(filePaths);
      }
    }

    // Delete discovery (cascade will delete images)
    const { error } = await supabase
      .from('discoveries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getDiscoveryById(id: string): Promise<Discovery | null> {
    const { data: discovery, error } = await supabase
      .from('discoveries')
      .select(`
        *,
        discovery_images (
          id,
          image_url,
          image_order,
          exif_data,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      ...discovery,
      images: discovery.discovery_images || [],
    };
  }

  static async addImagesToDiscovery(discoveryId: string, images: File[]): Promise<DiscoveryImage[]> {
    const imagePromises = images.map(async (file, index) => {
      // Get current max order
      const { data: existingImages } = await supabase
        .from('discovery_images')
        .select('image_order')
        .eq('discovery_id', discoveryId)
        .order('image_order', { ascending: false })
        .limit(1);

      const nextOrder = existingImages && existingImages.length > 0 
        ? existingImages[0].image_order + 1 + index 
        : index;

      // Upload image to storage
      const fileName = `${discoveryId}/${Date.now()}_${index}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('discovery-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('discovery-images')
        .getPublicUrl(fileName);

      // Save image record
      const { data: imageData, error: imageError } = await supabase
        .from('discovery_images')
        .insert({
          discovery_id: discoveryId,
          image_url: publicUrl,
          image_order: nextOrder,
        })
        .select()
        .single();

      if (imageError) throw imageError;
      return imageData;
    });

    return Promise.all(imagePromises);
  }

  static async removeImageFromDiscovery(imageId: string): Promise<void> {
    // Get image URL before deletion
    const { data: image } = await supabase
      .from('discovery_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (image) {
      // Delete from storage
      const pathMatch = image.image_url.match(/discovery-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('discovery-images')
          .remove([pathMatch[1]]);
      }
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

    const results = await Promise.all(updatePromises);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw errors[0].error;
    }
  }
}
