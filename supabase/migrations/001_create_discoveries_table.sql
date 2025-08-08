CREATE TABLE discoveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text_content TEXT,
  category TEXT NOT NULL CHECK (category IN ('liked_it', 'didnt_like_it', 'want_to_try')),
  discovery_type TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  location_source TEXT CHECK (location_source IN ('gps', 'exif', 'manual', 'none')),
  -- Future LLM support (MVP: NULL, Future: JSONB)
  extracted_data JSONB,
  -- Future queue support (MVP: NULL, Future: status tracking)
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- Note: Content validation (text OR images) is handled at application level
);

CREATE TABLE discovery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_id UUID REFERENCES discoveries(id) ON DELETE CASCADE,
  image_key TEXT NOT NULL, -- R2 object key (e.g., "users/123/discoveries/456/image1.jpg")
  image_url TEXT, -- Optional signed URL for caching (generated on-demand)
  image_order INTEGER NOT NULL DEFAULT 0,
  exif_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_discoveries_user_id ON discoveries(user_id);
CREATE INDEX idx_discoveries_created_at ON discoveries(created_at DESC);
CREATE INDEX idx_discoveries_location ON discoveries(location_lat, location_lng);
CREATE INDEX idx_discoveries_location_source ON discoveries(location_source);
CREATE INDEX idx_discovery_images_discovery_id ON discovery_images(discovery_id);
CREATE INDEX idx_discovery_images_order ON discovery_images(discovery_id, image_order);
CREATE INDEX idx_discovery_images_key ON discovery_images(image_key);
-- Future indexes (commented for MVP)
-- CREATE INDEX idx_discoveries_processing_status ON discoveries(processing_status);
-- CREATE INDEX idx_discoveries_extracted_data ON discoveries USING GIN (extracted_data);
