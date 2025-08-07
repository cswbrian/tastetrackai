# TasteTrackAI Product Brief

## Project Overview

TasteTrackAI is an AI-powered personal journal that intelligently tracks, understands, and shares your unique tastes and discoveries. The app transforms casual experiences into structured, searchable insights by automatically extracting key details from your notes and photos using advanced AI.

**Core Value Proposition**: Turn everyday discoveries into an intelligent, searchable personal database of your preferences and experiences.

## Target Audience

### Primary Users
- **Curious Explorers**: People who love trying new things (food, books, music, places)
- **Personal Archivists**: Users who want to remember and reference their past experiences
- **Taste Enthusiasts**: Individuals who take pride in their preferences and want to track them over time

### User Personas
- **Sarah, 28, Food Blogger**: Wants to track restaurant experiences and food discoveries
- **Mike, 35, Music Enthusiast**: Seeks to catalog albums, artists, and genres he discovers
- **Emma, 42, Book Lover**: Aims to remember books she's read and authors she enjoys

## Primary Benefits & Features

### 🎯 Core Benefits
1. **Intelligent Memory**: AI automatically extracts key details from your discoveries
2. **Effortless Organization**: No manual tagging or categorization required
3. **Powerful Search**: Find past discoveries using natural language or extracted details
4. **Personal Insights**: Build a comprehensive database of your preferences over time

### 🔧 Key Features

#### Discovery Creation
- **Text Notes**: Write your thoughts and experiences
- **Photo Capture**: Add visual context to your discoveries
- **Smart Categorization**: Choose from "Liked It", "Didn't Like It", "Want to Try"
- **Type Classification**: Categorize as Book, Music, Food, Place, Product, etc.

#### AI-Powered Intelligence
- **Automatic Extraction**: AI identifies key entities (authors, artists, brands, genres)
- **Structured Data**: Converts free-form text into searchable metadata
- **Visual Analysis**: Extracts information from photos (book covers, labels, etc.)

#### Discovery Management
- **Timeline View**: Chronological feed of all discoveries
- **Advanced Search**: Search by text, categories, or extracted details
- **Smart Filtering**: Filter by type, category, or time period

## High-Level Architecture

### Technology Stack
- **Frontend**: React Native with Expo (iOS & Android)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: OpenAI GPT-4o Mini / Google Gemini Flash
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Supabase      │    │   AI Service    │
│                 │    │                 │    │                 │
│ • Discovery     │───▶│ • PostgreSQL    │───▶│ • GPT-4o Mini   │
│   Creation      │    │ • Auth          │    │ • Image Analysis│
│ • Timeline      │    │ • Storage       │    │ • Text Analysis │
│ • Search        │    │ • Real-time     │    │ • JSON Output   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Input**: Text + optional photo + category + type
2. **Image Processing**: Upload to Supabase Storage
3. **AI Analysis**: Send text + image to LLM for entity extraction
4. **Data Storage**: Save discovery with extracted structured data
5. **Search Index**: Make discovery searchable across all fields

### Key Integrations
- **Authentication**: Apple/Google Sign-In via Supabase Auth
- **Camera/Photos**: Expo Camera and Image Picker
- **Location**: GPS coordinates for place-based discoveries
- **AI Processing**: Real-time entity extraction and classification

## Success Metrics

### User Engagement
- Discovery creation rate (target: 3+ per week per active user)
- Search usage (target: 60% of users search weekly)
- Photo attachment rate (target: 40% of discoveries include photos)

### Technical Performance
- Discovery creation: < 3 seconds (including AI processing)
- Search response: < 1 second
- AI extraction accuracy: > 80%

### Business Goals
- User retention: 70% monthly active users
- Feature adoption: 90% of users create at least one discovery
- Search effectiveness: 85% of searches return relevant results

---

*This brief provides the essential context for understanding TasteTrackAI's business objectives, user needs, and technical approach.* 