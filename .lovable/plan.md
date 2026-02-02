

# Keynest AI Landing Page - Top Section Design

## Overview
A striking 2-column hero section that combines an AI-powered property search chat interface with an engaging video demo area, inspired by modern SaaS landing pages.

---

## 🎨 Visual Design
- **Background**: Clean light beige gradient transitioning to warm brown tones (Compass-inspired)
- **Left Column**: White/cream card with subtle shadow for the AI chat interface
- **Right Column**: Dark overlay on video area with play button, similar to Redpoint's bold visual approach
- **Accent Color**: Yellow highlights for CTAs and interactive elements

---

## 📐 Layout Structure

### Two-Column Grid (Desktop)
- **Left (55%)**: AI Chat Interface
- **Right (45%)**: Video Demo
- **Mobile**: Stacks vertically (Chat on top, Video below)

---

## 🤖 LEFT COLUMN: AI Property Search Chat

### Filter Toggles Section
A horizontal/wrapped row of toggle chips for:
- Property Type (Apartment, House, Commercial)
- Price Range (HKD budget slider)
- Location (District dropdown)
- Bedrooms (1-5+)
- Bathrooms (1-4+)
- Size (sqft range)
- Floor Level (Low, Mid, High)
- Building Age (New, <10 years, <20 years, 20+)
- Orientation (North, South, East, West, Sea View, Mountain View)
- Developer (Major HK developers)

### Chat Input Area
- Large text input with placeholder: "Describe your ideal property..."
- Microphone icon for voice input (optional)
- **Search** button with yellow accent color
- Subtle AI sparkle icon to indicate AI-powered search

### Results Table
- Clean, modern table design with hover states
- **Columns**: Property Name, Location, Price (HKD), Size (sqft), Bedrooms, Key Features
- Sortable column headers with arrow indicators
- Top 15 results displayed with pagination
- **Key Features** column uses colored badges (e.g., "Sea View" in blue, "New Build" in green, "Pet Friendly" in purple)

### Export Actions (Above Table)
Three action buttons:
- 📄 **Export to CSV** - Downloads results as spreadsheet
- 📑 **Export to PDF** - Generates formatted PDF report
- 🔬 **Export to Research Canvas** - Opens comparison tool with selected properties

---

## 🎬 RIGHT COLUMN: Video Demo

### Interactive Video Player
- **16:9 aspect ratio** container
- Fallback image showing Keynest AI interface screenshot
- Large play button overlay (yellow accent)
- "Tap anywhere to pause" functionality in top-right corner area
- Subtle progress bar at bottom

### Content
- **Title**: "See How Keynest AI Works" (elegant serif font)
- **Subtitle**: "AI-powered property search for Hong Kong"
- **Caption below**: Brief description of the AI search process
  - "Our AI understands your preferences in plain language and finds the perfect properties in seconds"

### Visual Treatment
- Slightly elevated with shadow
- Rounded corners matching the design system
- Dark gradient overlay on the thumbnail for text readability

---

## ⚡ Interactions & Animations

### Chat Interface
- Smooth filter toggle animations
- Typing indicator when AI is "thinking"
- Results fade in with staggered animation
- Table rows highlight on hover

### Video Section
- Play button pulse animation
- Smooth video transitions
- Tap anywhere on top-right corner pauses (with visual indicator)
- Progress bar animates as video plays

---

## 📱 Responsive Behavior

### Desktop (1200px+)
- Side-by-side 55/45 split layout
- All filters visible in chips

### Tablet (768px - 1199px)
- Side-by-side 50/50 split
- Filters collapse into dropdown menus

### Mobile (<768px)
- Stacked layout (Chat → Video)
- Filters in expandable accordion
- Swipe-enabled results table
- Video takes full width

---

## 🔧 Technical Considerations

### Components to Create
1. `PropertySearchChat` - Main chat interface container
2. `FilterToggleBar` - Reusable filter chips component
3. `PropertyResultsTable` - Sortable, exportable table
4. `ExportActions` - Export button group
5. `VideoDemo` - Interactive video player with controls
6. `HeroSection` - Parent layout component

### Data Structure
- Property filters state management
- Search results with sorting capability
- Export functionality (CSV, PDF generation)
- Integration with Research Canvas page

