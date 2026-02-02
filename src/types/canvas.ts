export interface Position {
  x: number;
  y: number;
}

export interface CanvasPropertyData {
  propertyId: string;
  name: string;
  location: string;
  price: number;
  size: number;
  bedrooms: string;
  bathrooms?: number;
  thumbnail: string;
  features: string[];
}

export interface CanvasProperty {
  id: string;
  type: 'property';
  position: Position;
  data: CanvasPropertyData;
  rank: number; // 0-5 stars
  notes: string;
  colorCode: string; // hex color for card border
}

export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export interface CanvasStickyNote {
  id: string;
  type: 'sticky';
  position: Position;
  content: string;
  color: StickyNoteColor;
  width: number;
  height: number;
}

export interface CanvasTextBox {
  id: string;
  type: 'text';
  position: Position;
  content: string;
  fontSize: number;
}

export type ConnectorStyle = 'solid' | 'dashed' | 'arrow';

export interface CanvasConnector {
  id: string;
  type: 'connector';
  fromId: string;
  toId: string;
  color: string;
  style: ConnectorStyle;
}

export interface CanvasGroup {
  id: string;
  type: 'group';
  position: Position;
  width: number;
  height: number;
  label: string;
  color: string;
}

export type CanvasElement = 
  | CanvasProperty 
  | CanvasStickyNote 
  | CanvasTextBox 
  | CanvasGroup;

export interface CanvasState {
  elements: CanvasElement[];
  connectors: CanvasConnector[];
  zoom: number;
  selectedIds: string[];
}

export const STICKY_NOTE_COLORS: Record<StickyNoteColor, string> = {
  yellow: 'hsl(48, 96%, 89%)',
  pink: 'hsl(330, 81%, 90%)',
  blue: 'hsl(208, 88%, 90%)',
  green: 'hsl(142, 69%, 88%)',
  purple: 'hsl(270, 67%, 91%)',
};

export const PROPERTY_CARD_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
];
