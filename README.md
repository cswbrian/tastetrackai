# TasteTrackAI

A React Native app for tracking and discovering new experiences with AI-powered insights.

## Feature 0001: Basic Discovery Creation (MVP)

This feature implements the core discovery creation functionality that allows users to:

### ✅ Implemented Features

- **Multiple Image Support**: Users can add, remove, and reorder multiple photos for each discovery
- **Text Content**: Optional text notes for each discovery
- **Content Validation**: Each discovery must have either text content or at least one photo
- **Category Selection**: Three categories: "Liked It", "Didn't Like It", "Want to Try"
- **Discovery Types**: Optional categorization by type (Book, Music, Movie, Food, Drink, Place, Product)
- **Location Capture**: Automatic GPS location capture with fallback to EXIF data
- **Timeline View**: Chronological display of discoveries with image galleries
- **Form Validation**: Client-side validation using Zod schemas
- **State Management**: Zustand store for discovery state management
- **Database Schema**: Supabase tables with proper relationships and constraints
- **Cloudflare R2 Integration**: Secure, cost-effective image storage with signed URLs

### 🏗️ Architecture

#### Database Schema
- `discoveries` table with location data and content constraints
- `discovery_images` table with R2 object keys and signed URL caching
- Proper indexes for performance
- Future-ready for LLM processing and queue management

#### Core Services
- `DiscoveryService`: CRUD operations with multiple image support
- `ImageService`: Image handling, compression, and R2 integration
- `LocationService`: GPS location and reverse geocoding
- `R2Service`: Cloudflare R2 operations with signed URL generation

#### UI Components
- `DiscoveryCard`: Rich card component with image carousel
- `CreateDiscoveryScreen`: Comprehensive creation form
- `DiscoveriesScreen`: Timeline view with pull-to-refresh

#### State Management
- Zustand store with async actions
- Error handling and loading states
- Optimistic updates

### 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/001_create_discoveries_table.sql`
   - Configure environment variables

3. Set up Cloudflare R2 (Image Storage):
   - Follow the complete setup guide: [docs/setup/cloudflare-r2-setup.md](docs/setup/cloudflare-r2-setup.md)
   - Configure environment variables for R2
   - Test the setup with: `npm run test:r2`

4. Start the development server:
   ```bash
   npm start
   ```

### 📱 App Structure

```
app/
├── (tabs)/
│   ├── discoveries.tsx    # Timeline view of discoveries
│   ├── create.tsx         # Discovery creation screen
│   ├── explore.tsx        # Future: AI-powered exploration
│   └── profile.tsx        # User profile
├── (auth)/                # Authentication screens
└── _layout.tsx           # Root layout

components/
├── discovery/
│   └── DiscoveryCard.tsx  # Discovery display component
└── ui/                    # Reusable UI components

services/
├── discoveryService.ts    # Discovery CRUD operations
├── imageService.ts        # Image handling and R2 integration
└── locationService.ts     # Location services

lib/
└── r2.ts                 # Cloudflare R2 service

stores/
└── discoveryStore.ts      # Zustand state management

types/
└── discovery.ts          # TypeScript interfaces

schemas/
└── discoverySchema.ts    # Zod validation schemas

docs/
└── setup/
    └── cloudflare-r2-setup.md  # R2 setup guide
```

### 🔧 Technical Details

#### Image Processing & Storage
- **Cloudflare R2**: Cost-effective storage with zero egress fees
- **Signed URLs**: Secure, time-limited access to images
- **Multiple Formats**: Support for JPEG, PNG, HEIC formats
- **Automatic Compression**: Image optimization before upload
- **EXIF Extraction**: Location data from photo metadata
- **User Isolation**: Separate storage paths per user

#### Location Services
- GPS location capture with permission handling
- EXIF location extraction from photos
- Reverse geocoding for readable location names
- Fallback mechanisms for location failures

#### Form Validation
- Zod schemas for type safety
- Content requirement validation (text OR images)
- Image file validation (size, type, count)
- Real-time validation feedback

#### Database Design
- UUID primary keys for scalability
- Proper foreign key relationships
- Check constraints for data integrity
- Indexes for query performance
- R2 object key storage with signed URL caching
- Future-ready for LLM integration

### 💰 Cost Benefits of R2

- **Storage**: $0.015/GB/month (vs $0.023/GB for Supabase)
- **Bandwidth**: $0.00 (vs $0.09/GB for Supabase)
- **Estimated Savings**: 99%+ reduction in image serving costs
- **Privacy**: Signed URLs prevent unauthorized access

### 🎯 Success Criteria Met

- ✅ Users can create discoveries with text (optional) and multiple photos
- ✅ Each discovery must have either text content or at least one photo
- ✅ Users can add, remove, and reorder images in discovery creation
- ✅ Users can categorize discoveries (Liked It, Didn't Like It, Want to Try)
- ✅ Users can select discovery types
- ✅ Location is automatically captured (GPS or EXIF from any image)
- ✅ Users can manually edit location if needed
- ✅ Location data is stored with source tracking
- ✅ Discoveries appear in chronological timeline view with image galleries
- ✅ Users can refresh discoveries to see new items
- ✅ Multiple image upload works correctly with proper ordering
- ✅ Form validation prevents invalid submissions (requires text OR images)
- ✅ Database schema supports multiple images with proper relationships
- ✅ Type definitions support multiple images and future enhancements
- ✅ Secure image storage with signed URLs and privacy controls
- ✅ Cost-effective storage solution with minimal bandwidth charges

### 🔮 Future Enhancements

The implementation is designed to be future-ready for:

- **LLM Integration**: Extracted data field for AI-powered insights
- **Processing Queue**: Status tracking for background processing
- **Advanced Search**: Full-text search and filtering
- **Map View**: Geographic discovery visualization
- **Social Features**: Sharing and collaboration
- **Analytics**: Discovery patterns and insights
- **Image Transformations**: On-demand image resizing and optimization
- **CDN Optimization**: Advanced caching strategies

### 🛠️ Development

#### Adding New Discovery Types
1. Update `discoveryTypes` array in `create.tsx`
2. Add corresponding icon mapping
3. Update database schema if needed

#### Extending Image Processing
1. Modify `ImageService` for new formats
2. Update validation schemas
3. Add new EXIF extraction capabilities
4. Configure R2 lifecycle policies

#### Database Migrations
1. Create new migration files in `supabase/migrations/`
2. Update TypeScript types accordingly
3. Test with existing data

#### R2 Configuration
1. Update CORS settings in R2 bucket
2. Configure lifecycle policies for cost optimization
3. Set up monitoring and alerts
4. Implement backup strategies

### 📚 Additional Resources

- [Cloudflare R2 Setup Guide](docs/setup/cloudflare-r2-setup.md)
- [R2 API Documentation](https://developers.cloudflare.com/r2/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Note**: This is the MVP implementation of Feature 0001 with Cloudflare R2 integration for cost-effective and secure image storage. The architecture is designed to support future enhancements including AI-powered insights, advanced search, and social features.
