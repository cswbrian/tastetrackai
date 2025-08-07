import { z } from 'zod';

// Base schema without refinement
const baseDiscoverySchema = z.object({
  text_content: z.string().optional(),
  category: z.enum(['liked_it', 'didnt_like_it', 'want_to_try']),
  discovery_type: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  location_name: z.string().optional(),
  location_source: z.enum(['gps', 'exif', 'manual', 'none']).optional(),
});

// Add refinement for content validation
export const discoverySchema = baseDiscoverySchema.refine((data) => {
  // Must have either text content or at least one image
  const hasText = data.text_content && data.text_content.trim().length > 0;
  const hasImages = data.images && data.images.length > 0;
  return hasText || hasImages;
}, {
  message: "Discovery must have either text content or at least one image",
  path: ["text_content", "images"]
});

export const imageValidationSchema = z.object({
  file: z.instanceof(File),
}).refine((data) => {
  const file = data.file;
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  
  return file.size <= maxSize && allowedTypes.includes(file.type);
}, {
  message: "Image must be JPEG, PNG, or HEIC format and under 10MB",
  path: ["file"]
});

// Create input schema by extending the base schema
export const discoveryInputSchema = baseDiscoverySchema.extend({
  images: z.array(imageValidationSchema).optional(),
}).refine((data) => {
  // Must have either text content or at least one image
  const hasText = data.text_content && data.text_content.trim().length > 0;
  const hasImages = data.images && data.images.length > 0;
  return hasText || hasImages;
}, {
  message: "Discovery must have either text content or at least one image",
  path: ["text_content", "images"]
});

export type DiscoveryFormData = z.infer<typeof discoverySchema>;
export type DiscoveryInputData = z.infer<typeof discoveryInputSchema>;
