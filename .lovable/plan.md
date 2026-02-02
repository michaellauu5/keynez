

# Google Maps Integration for Keynest AI

## Overview
Add interactive Google Maps functionality to the landing page and Buy/Rent listing pages, replacing the current placeholder MapView component. This integration will feature property markers, info windows, synchronized list-map interactions, and a slide-up property details panel.

---

## Prerequisites

### Google Maps API Key Required
Before implementation, you'll need to:
1. Create a Google Cloud Platform project
2. Enable the **Maps JavaScript API**
3. Generate an API key with appropriate restrictions
4. Add the key to the project via Lovable's secrets management

The API key will be stored as `GOOGLE_MAPS_API_KEY` and accessed through environment variables.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add @react-google-maps/api, @googlemaps/markerclusterer |
| `src/data/mockProperties.ts` | Modify | Add lat/lng coordinates for each property |
| `src/components/map/GoogleMapView.tsx` | Create | Main Google Maps component with markers |
| `src/components/map/PropertyMarker.tsx` | Create | Custom property marker with price label |
| `src/components/map/PropertyInfoWindow.tsx` | Create | Info window popup for marker click |
| `src/components/map/PropertyDetailsPanel.tsx` | Create | Slide-up full property details panel |
| `src/components/map/MapControls.tsx` | Create | Custom zoom, location, search area controls |
| `src/components/map/MobileMapDrawer.tsx` | Create | Mobile list overlay drawer |
| `src/components/map/useMapState.ts` | Create | Hook for map state management |
| `src/components/listings/ResultsHeader.tsx` | Modify | Add split view toggle option |
| `src/components/listings/ListingsPageLayout.tsx` | Modify | Integrate new map views (full, split) |
| `src/components/landing/PropertyListingsSection.tsx` | Modify | Add map view toggle to landing page |
| `src/components/landing/PropertyCard.tsx` | Modify | Add "View on Map" button and hover events |
| `src/index.css` | Modify | Add custom map styles and animations |

---

## Architecture

```text
+------------------------------------------------------------------+
|  HEADER                                                           |
+------------------------------------------------------------------+
|  RESULTS HEADER                                                   |
|  [X properties] [Sort] [List | Map | Split]  [Save]               |
+------------------------------------------------------------------+
|                                                                   |
|  LIST VIEW          |          MAP VIEW                           |
|  +-------------+    |    +---------------------------+            |
|  | PropertyCard|    |    |                           |            |
|  | (with hover)|<-->|    |    [Clustered Markers]    |            |
|  +-------------+    |    |         [pin] [pin]       |            |
|  +-------------+    |    |    [pin]      [pin]       |            |
|  | PropertyCard|    |    |                           |            |
|  +-------------+    |    |  +--InfoWindow--+         |            |
|                     |    |  | [image]      |         |            |
|                     |    |  | $2.5M        |         |            |
|                     |    |  | 2bd 1ba      |         |            |
|                     |    |  | [View More]  |         |            |
|                     |    |  +-------------+          |            |
|                     |    +---------------------------+            |
+------------------------------------------------------------------+
|  PROPERTY DETAILS PANEL (slide-up, covers 70% of screen)          |
|  +----------------------------------------------------------------+
|  | [X Close]                                                      |
|  | [Image Carousel]                                               |
|  | Property Name - $Price                                         |
|  | Address [Get Directions]                                       |
|  | Full details, description, agent info                          |
|  | Similar Properties carousel                                    |
|  +----------------------------------------------------------------+
```

---

## Component Details

### 1. GoogleMapView Component
Main map container using `@react-google-maps/api`:

**Features:**
- Lazy loading with `useLoadScript`
- Custom map styling (Keynest beige/blue palette)
- Marker clustering for 20+ properties
- Auto-fit bounds to visible properties
- Real-time marker updates on filter change
- Geolocation support ("My Location" button)
- "Search this area" button when map is panned

**Map Style (matches Keynest palette):**
- Water: Light blue (#A8D8EA)
- Land: Warm beige (#F5F0E6)
- Roads: Subtle brown (#D4C5B0)
- Parks: Muted green (#C8E6C9)
- Labels: Dark brown (#4A3B2A)

### 2. PropertyMarker Component
Custom marker for each property:

**Visual Design:**
- Colored pin based on transaction type:
  - For Sale: Blue (#3B82F6)
  - For Rent: Green (#22C55E)
- Price label shown on hover
- Pulse animation when corresponding card is hovered
- Z-index increase on hover/selection

**States:**
- Default: Pin icon only
- Hover: Shows price bubble above pin
- Selected: Larger pin with highlight ring
- Clustered: Group indicator with count

### 3. PropertyInfoWindow Component
Popup displayed when marker is clicked:

**Content:**
- Property thumbnail (150x100px)
- Price (large, bold)
- Address (truncated)
- Bed/bath/size icons row
- "View Details" button (opens slide-up panel)
- Close button (X)

**Styling:**
- White background with subtle shadow
- Rounded corners matching card design
- Max width: 280px

### 4. PropertyDetailsPanel Component
Slide-up panel for full property details:

**Features:**
- Covers bottom 70% of screen (desktop) / 90% on mobile
- Slide-up animation (300ms ease-out)
- Swipe down to dismiss (mobile)
- Close button (X) in top-right

**Content:**
- Image carousel at top (full width)
- Property name and price
- Full address with "Get Directions" link (opens Google Maps)
- All property details and description
- Agent contact card with phone/email buttons
- "Similar Properties" carousel at bottom

### 5. MapControls Component
Custom map control overlay:

**Buttons:**
- Zoom in (+)
- Zoom out (-)
- My Location (crosshair icon)
- Fullscreen toggle
- Search this area (appears after pan)
- Active filter count badge

### 6. MobileMapDrawer Component
Mobile-optimized list overlay:

**Behavior:**
- Map fills screen by default
- Swipe up from bottom handle to reveal list
- Three snap points: Collapsed (mini cards), Half, Full
- Mini card carousel when collapsed (horizontal scroll)

### 7. useMapState Hook
Centralized map state management:

```typescript
interface MapState {
  center: google.maps.LatLngLiteral;
  zoom: number;
  bounds: google.maps.LatLngBounds | null;
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  isInfoWindowOpen: boolean;
  isDetailsPanelOpen: boolean;
  searchThisAreaVisible: boolean;
}
```

---

## View Modes

### 1. Grid/List View (Default)
- Current PropertyGrid display
- Cards show "View on Map" button
- Hovering card pulses map marker

### 2. Map View (Full)
- Map takes full content area
- Property list hidden on desktop
- Mobile: Swipeable drawer from bottom

### 3. Split View (Desktop Only)
- 50% list / 50% map side by side
- Scrolling list updates map center
- Clicking marker scrolls to card

---

## Synchronized Behaviors

### List → Map Sync:
1. **Hover card** → Pulse corresponding marker
2. **Click "View on Map"** → Switch to map view, center on property, open info window
3. **Scroll list** → Update map to show properties in view (debounced)

### Map → List Sync:
1. **Click marker** → Highlight card, scroll into view
2. **Pan/zoom map** → Show "X properties in this area"
3. **Search this area** → Filter to properties in bounds

### Filter → Map Sync:
1. Filters change → Update markers immediately
2. Re-fit bounds to show all filtered properties
3. Update property count display

---

## Data Changes

### Add Coordinates to mockProperties.ts

```typescript
// Hong Kong district coordinates
const districtCoordinates = {
  "Central": { lat: 22.2819, lng: 114.1587 },
  "Mid-Levels": { lat: 22.2776, lng: 114.1477 },
  "The Peak": { lat: 22.2759, lng: 114.1455 },
  "Happy Valley": { lat: 22.2694, lng: 114.1839 },
  "Causeway Bay": { lat: 22.2801, lng: 114.1842 },
  // ... all districts
};

// Add to PropertyListing interface:
coordinates: {
  lat: number;
  lng: number;
};
```

---

## Mobile Optimizations

### Touch Interactions:
- Tap marker → Show mini card at bottom
- Tap mini card → Expand to full details panel
- Swipe down → Dismiss panel
- Pinch to zoom map
- Two-finger pan

### Performance:
- Reduce marker detail at low zoom
- Virtualized list in drawer
- Lazy load images in details panel

---

## Performance Optimizations

1. **Lazy load map component** - Only load Google Maps JS when map view is activated
2. **Marker clustering** - Group markers at zoom level < 14
3. **Debounced updates** - 150ms delay on pan/zoom events
4. **Memo markers** - Prevent re-renders on filter change
5. **Virtual scrolling** - For large property lists

---

## CSS Additions

```css
/* Custom map marker styles */
.map-marker {
  @apply transition-transform duration-200;
}
.map-marker:hover {
  @apply scale-110;
}
.map-marker-pulse {
  animation: marker-pulse 1.5s ease-in-out infinite;
}

/* Details panel slide animation */
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.details-panel {
  animation: slide-up 0.3s ease-out;
}

/* Custom Google Maps styling */
.gm-style .gm-style-iw {
  @apply rounded-lg shadow-lg border-0;
}
```

---

## Implementation Order

1. **Setup & Dependencies**
   - Install @react-google-maps/api
   - Add Google Maps API key placeholder
   - Add coordinates to mock data

2. **Core Map Component**
   - Create GoogleMapView with basic map
   - Add custom styling
   - Implement useMapState hook

3. **Markers & Interactions**
   - Create PropertyMarker component
   - Add marker clustering
   - Implement hover/selection states

4. **Info Window & Details**
   - Create PropertyInfoWindow
   - Create PropertyDetailsPanel
   - Add slide-up animation

5. **View Mode Integration**
   - Update ResultsHeader with split view toggle
   - Modify ListingsPageLayout for all view modes
   - Add PropertyCard map interactions

6. **Synchronization**
   - Implement list-map hover sync
   - Add scroll-based map updates
   - Create "Search this area" functionality

7. **Mobile Optimization**
   - Create MobileMapDrawer
   - Add touch gestures
   - Optimize for performance

8. **Landing Page Integration**
   - Add map view toggle to PropertyListingsSection
   - Ensure consistent behavior across pages

---

## API Key Note

The implementation will include a check for the Google Maps API key. If not configured, the map will show a friendly message prompting setup with a link to the Google Cloud Console. Once you're ready to add the API key, I can help you set it up through Lovable's secrets management.

