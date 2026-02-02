

# Keynest AI Research Canvas - Notion-Style Property Research Tool

## Overview
A powerful, interactive research workspace where users can visualize, compare, and annotate properties imported from AI search results. Features free-form drag-and-drop canvas with property cards, sticky notes, connectors, and grouping capabilities.

---

## Architecture

```text
+---------------------------------------------------+
|  Header (existing)                                 |
+---------------------------------------------------+
|  TOOLBAR                                           |
|  [Add Note] [Add Text] [Connector] [Clear] [Save] [Export] |
+---------------------------------------------------+
|                                                    |
|   +-------+                      +-------+         |
|   |Property|  --------->        |Property|         |
|   | Card  |                      | Card  |         |
|   +-------+                      +-------+         |
|                                                    |
|   +-------------+     +-------+                    |
|   | Sticky Note |     |Property|                   |
|   |             |     | Card  |                    |
|   +-------------+     +-------+         +--------+ |
|                                         | Group  | |
|   +----------+                          | Area   | |
|   | Text Box |                          +--------+ |
|   +----------+                                     |
|                                                    |
+---------------------------------------------------+
```

---

## File Structure

| File | Purpose |
|------|---------|
| `src/pages/ResearchCanvas.tsx` | Main page component |
| `src/components/canvas/CanvasToolbar.tsx` | Top toolbar with actions |
| `src/components/canvas/CanvasArea.tsx` | Main drag-and-drop canvas container |
| `src/components/canvas/DraggablePropertyCard.tsx` | Condensed property card for canvas |
| `src/components/canvas/DraggableStickyNote.tsx` | Draggable sticky note component |
| `src/components/canvas/DraggableTextBox.tsx` | Text annotation component |
| `src/components/canvas/ConnectorLine.tsx` | SVG connector between elements |
| `src/components/canvas/GroupArea.tsx` | Visual grouping rectangle |
| `src/components/canvas/StarRating.tsx` | 1-5 star ranking component |
| `src/hooks/useCanvasState.ts` | Canvas state management and persistence |
| `src/types/canvas.ts` | TypeScript interfaces for canvas elements |

---

## Dependencies

New package required:
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/utilities` - CSS transform utilities

---

## Data Types

```typescript
// src/types/canvas.ts

interface Position {
  x: number;
  y: number;
}

interface CanvasProperty {
  id: string;
  type: 'property';
  position: Position;
  data: {
    propertyId: string;
    name: string;
    location: string;
    price: number;
    size: number;
    bedrooms: string;
    bathrooms?: number;
    thumbnail: string;
    features: string[];
  };
  rank: number; // 0-5 stars
  notes: string;
  colorCode: string; // hex color for card border
}

interface CanvasStickyNote {
  id: string;
  type: 'sticky';
  position: Position;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  width: number;
  height: number;
}

interface CanvasTextBox {
  id: string;
  type: 'text';
  position: Position;
  content: string;
  fontSize: number;
}

interface CanvasConnector {
  id: string;
  type: 'connector';
  fromId: string;
  toId: string;
  color: string;
  style: 'solid' | 'dashed' | 'arrow';
}

interface CanvasGroup {
  id: string;
  type: 'group';
  position: Position;
  width: number;
  height: number;
  label: string;
  color: string;
}

type CanvasElement = 
  | CanvasProperty 
  | CanvasStickyNote 
  | CanvasTextBox 
  | CanvasGroup;

interface CanvasState {
  elements: CanvasElement[];
  connectors: CanvasConnector[];
  zoom: number;
  selectedIds: string[];
}
```

---

## Component Details

### 1. ResearchCanvas Page
**Route**: `/research-canvas`

- Full-height canvas workspace
- Header with back navigation
- Receives imported properties via URL state or localStorage
- Initializes canvas from localStorage if existing session

### 2. CanvasToolbar
Fixed toolbar at top with:

| Button | Icon | Action |
|--------|------|--------|
| Add Sticky Note | StickyNote | Creates new draggable sticky at center |
| Add Text Box | Type | Creates text annotation element |
| Draw Connector | ArrowRight | Enables connector drawing mode |
| Color Picker | Palette | Opens color selector for selected elements |
| Clear Canvas | Trash2 | Confirms and clears all elements |
| Save Canvas | Save | Saves to localStorage with toast confirmation |
| Load Canvas | FolderOpen | Loads saved canvas state |
| Export PDF | FileDown | Generates PDF of canvas |

Additional controls:
- Zoom slider (50% - 200%)
- Undo/Redo buttons
- Element count indicator

### 3. CanvasArea (DndContext Container)
- Uses `@dnd-kit/core` DndContext
- Full viewport canvas with grid background
- Absolute positioning for all elements
- Pan/scroll with mouse drag on empty space
- Zoom with scroll wheel + ctrl key
- Click to deselect, click element to select

### 4. DraggablePropertyCard
Condensed property display:
- 120x160px card size
- Thumbnail image (80px height)
- Property name (truncated)
- Price in HKD
- Bed/Bath/Size icons row
- Star rating component (clickable)
- Color-coded left border
- Expand button to show notes
- Right-click context menu:
  - Edit notes
  - Change color
  - Remove from canvas

### 5. DraggableStickyNote
- Resizable (drag corner)
- Editable text content (click to edit)
- 5 color options
- Delete button on hover
- Shadow effect for depth

### 6. DraggableTextBox
- Inline editable text
- Font size selector
- Minimal styling (clean look)
- Delete on empty + blur

### 7. ConnectorLine (SVG)
- Bezier curve between element centers
- Arrow head option
- Color customizable
- Click to select/delete
- Updates position when connected elements move

### 8. GroupArea
- Resizable rectangle
- Label at top
- Semi-transparent fill
- Elements inside move together
- Lower z-index (behind other elements)

### 9. StarRating
- 5 clickable stars
- Half-star support optional
- Yellow filled, gray empty
- Compact size for card

---

## useCanvasState Hook

```typescript
// Manages:
// - elements array with CRUD operations
// - connectors array
// - selection state
// - undo/redo history
// - localStorage persistence
// - export functions

function useCanvasState() {
  // State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [connectors, setConnectors] = useState<CanvasConnector[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<CanvasState[]>([]);
  
  // Element operations
  const addElement = (element: CanvasElement) => {...};
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {...};
  const removeElement = (id: string) => {...};
  const moveElement = (id: string, position: Position) => {...};
  
  // Connector operations
  const addConnector = (fromId: string, toId: string) => {...};
  const removeConnector = (id: string) => {...};
  
  // Canvas operations
  const clearCanvas = () => {...};
  const saveToStorage = () => {...};
  const loadFromStorage = () => {...};
  const undo = () => {...};
  const redo = () => {...};
  
  // Import from search
  const importProperties = (properties: PropertyResult[]) => {...};
  
  // Export
  const exportToPDF = () => {...};
  
  return {...};
}
```

---

## Drag and Drop Implementation

Using @dnd-kit/core for free-form positioning:

```typescript
// CanvasArea.tsx
import { DndContext, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';

function CanvasArea() {
  const { elements, moveElement } = useCanvasState();
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const element = elements.find(e => e.id === active.id);
    if (element) {
      moveElement(active.id, {
        x: element.position.x + delta.x,
        y: element.position.y + delta.y,
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative w-full h-full overflow-auto bg-[url('/grid.svg')]">
        {elements.map(element => (
          <DraggableElement key={element.id} element={element} />
        ))}
        <svg className="absolute inset-0 pointer-events-none">
          {connectors.map(connector => (
            <ConnectorLine key={connector.id} connector={connector} />
          ))}
        </svg>
      </div>
    </DndContext>
  );
}
```

---

## Integration with AI Search

1. Update `ExportActions.tsx` to use `react-router-dom` navigation
2. Pass selected properties via route state or store in localStorage
3. Research Canvas reads and imports on mount

```typescript
// ExportActions.tsx update
const navigate = useNavigate();

const handleExportToResearchCanvas = () => {
  const dataToExport = selectedIds.length > 0 ? selectedResults : results.slice(0, 4);
  // Store in localStorage for cross-page access
  localStorage.setItem('keynest_canvas_import', JSON.stringify(dataToExport));
  navigate('/research-canvas', { state: { properties: dataToExport } });
};
```

---

## Local Storage Persistence

- Key: `keynest_research_canvas`
- Auto-save on changes (debounced 1 second)
- Manual save button
- Load on page mount
- Clear storage on "Clear Canvas"

---

## Responsive Design

- Desktop: Full canvas experience
- Tablet: Simplified toolbar, touch-friendly drag
- Mobile: Read-only view or simplified list mode

---

## Implementation Order

1. Install @dnd-kit/core and @dnd-kit/utilities
2. Create types/canvas.ts with all interfaces
3. Create useCanvasState hook with basic state management
4. Create CanvasArea with DndContext
5. Create DraggablePropertyCard component
6. Create CanvasToolbar with add/clear/save buttons
7. Create ResearchCanvas page and add route
8. Update ExportActions to navigate to canvas
9. Add DraggableStickyNote component
10. Add DraggableTextBox component
11. Add ConnectorLine with SVG drawing
12. Add GroupArea component
13. Add StarRating component
14. Implement localStorage persistence
15. Add PDF export functionality
16. Polish animations and interactions

---

## Visual Design

- Canvas background: Subtle dot grid pattern (like Figma)
- Property cards: White with colored left border, subtle shadow
- Sticky notes: Paper texture effect, slightly rotated
- Connectors: Gray by default, accent yellow when selected
- Groups: Semi-transparent with dashed border
- Toolbar: Matches existing header style (beige/brown tones)

