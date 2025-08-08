export interface Discovery {
  id: string;
  user_id: string;
  text_content?: string;
  category: 'liked_it' | 'didnt_like_it' | 'want_to_try';
  discovery_type?: string;
  images: DiscoveryImage[];
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  location_source?: 'gps' | 'exif' | 'manual' | 'none';
  // Future LLM support
  extracted_data?: any; // ExtractedData type will be defined in future
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DiscoveryImage {
  id: string;
  discovery_id: string;
  image_key: string; // R2 object key (e.g., "users/123/discoveries/456/image1.jpg")
  image_url?: string; // Optional signed URL for display (generated on-demand)
  image_order: number;
  exif_data?: Record<string, any>;
  created_at: string;
}

export interface DiscoveryInput {
  text_content?: string;
  category: 'liked_it' | 'didnt_like_it' | 'want_to_try';
  discovery_type?: string;
  images?: File[];
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  location_source?: 'gps' | 'exif' | 'manual' | 'none';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
  source: 'gps' | 'exif' | 'manual' | 'none';
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  exif?: Record<string, any>;
}

// R2 specific types
export interface R2UploadResult {
  objectKey: string;
  signedUrl?: string;
}

export interface R2ImageData {
  objectKey: string;
  signedUrl: string;
  expiresAt: number;
}

// Future LLM types (commented for MVP)
/*
export interface ExtractedData {
  keywords: string[];
  entities: Record<string, string>;
  sub_types: string[];
  confidence_scores: Record<string, number>;
}
*/
