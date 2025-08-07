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

### 🏗️ Architecture

#### Database Schema
- `discoveries` table with location data and content constraints
- `discovery_images` table with image ordering and EXIF data
- Proper indexes for performance
- Future-ready for LLM processing and queue management

#### Core Services
- `DiscoveryService`: CRUD operations with multiple image support
- `ImageService`: Image handling, compression, and EXIF extraction
- `LocationService`: GPS location and reverse geocoding

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

3. Start the development server:
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
├── imageService.ts        # Image handling and processing
└── locationService.ts     # Location services

stores/
└── discoveryStore.ts      # Zustand state management

types/
└── discovery.ts          # TypeScript interfaces

schemas/
└── discoverySchema.ts    # Zod validation schemas
```

### 🔧 Technical Details

#### Image Processing
- Support for JPEG, PNG, HEIC formats
- Automatic compression and resizing
- EXIF data extraction for location
- Multiple image upload with ordering

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
- Future-ready for LLM integration

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

### 🔮 Future Enhancements

The implementation is designed to be future-ready for:

- **LLM Integration**: Extracted data field for AI-powered insights
- **Processing Queue**: Status tracking for background processing
- **Advanced Search**: Full-text search and filtering
- **Map View**: Geographic discovery visualization
- **Social Features**: Sharing and collaboration
- **Analytics**: Discovery patterns and insights

### 🛠️ Development

#### Adding New Discovery Types
1. Update `discoveryTypes` array in `create.tsx`
2. Add corresponding icon mapping
3. Update database schema if needed

#### Extending Image Processing
1. Modify `ImageService` for new formats
2. Update validation schemas
3. Add new EXIF extraction capabilities

#### Database Migrations
1. Create new migration files in `supabase/migrations/`
2. Update TypeScript types accordingly
3. Test with existing data

---

**Note**: This is the MVP implementation of Feature 0001. The architecture is designed to support future enhancements including AI-powered insights, advanced search, and social features.
