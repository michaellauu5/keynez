import { useState, useCallback, useEffect, useRef } from 'react';
import {
  CanvasElement,
  CanvasConnector,
  CanvasProperty,
  CanvasStickyNote,
  CanvasTextBox,
  CanvasGroup,
  Position,
  CanvasState,
} from '@/types/canvas';
import { PropertyResult } from '@/components/landing/PropertyResultsTable';

const STORAGE_KEY = 'keynez_research_canvas';
const IMPORT_KEY = 'keynez_canvas_import';

interface HistoryState {
  elements: CanvasElement[];
  connectors: CanvasConnector[];
}

export function useCanvasState() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [connectors, setConnectors] = useState<CanvasConnector[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);
  const [connectorMode, setConnectorMode] = useState(false);
  const [connectorStart, setConnectorStart] = useState<string | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Auto-save debounce timer
  const saveTimer = useRef<NodeJS.Timeout>();

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage();
    checkForImport();
  }, []);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      saveToStorage();
    }, 1000);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [elements, connectors]);

  // Record history on changes
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const newState: HistoryState = { elements, connectors };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState].slice(-50); // Keep last 50 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [elements, connectors]);

  const checkForImport = useCallback(() => {
    const importData = localStorage.getItem(IMPORT_KEY);
    if (importData) {
      try {
        const properties = JSON.parse(importData) as PropertyResult[];
        importProperties(properties);
        localStorage.removeItem(IMPORT_KEY);
      } catch (e) {
        console.error('Failed to import properties:', e);
      }
    }
  }, []);

  const saveToStorage = useCallback(() => {
    const state: CanvasState = {
      elements,
      connectors,
      zoom,
      selectedIds: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [elements, connectors, zoom]);

  const loadFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state = JSON.parse(stored) as CanvasState;
        setElements(state.elements || []);
        setConnectors(state.connectors || []);
        setZoom(state.zoom || 100);
      } catch (e) {
        console.error('Failed to load canvas state:', e);
      }
    }
  }, []);

  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addElement = useCallback((element: CanvasElement) => {
    setElements((prev) => [...prev, element]);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } as CanvasElement : el))
    );
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setConnectors((prev) => prev.filter((c) => c.fromId !== id && c.toId !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const moveElement = useCallback((id: string, position: Position) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, position } : el))
    );
  }, []);

  const addStickyNote = useCallback((position?: Position) => {
    const sticky: CanvasStickyNote = {
      id: generateId(),
      type: 'sticky',
      position: position || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      content: 'New note...',
      color: 'yellow',
      width: 200,
      height: 150,
    };
    addElement(sticky);
  }, [addElement]);

  const addTextBox = useCallback((position?: Position) => {
    const text: CanvasTextBox = {
      id: generateId(),
      type: 'text',
      position: position || { x: 150 + Math.random() * 200, y: 150 + Math.random() * 200 },
      content: 'Click to edit...',
      fontSize: 14,
    };
    addElement(text);
  }, [addElement]);

  const addGroup = useCallback((position?: Position) => {
    const group: CanvasGroup = {
      id: generateId(),
      type: 'group',
      position: position || { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      width: 300,
      height: 250,
      label: 'Group',
      color: 'hsl(35, 25%, 90%)',
    };
    addElement(group);
  }, [addElement]);

  const addConnector = useCallback((fromId: string, toId: string) => {
    // Don't add duplicate connectors
    const exists = connectors.some(
      (c) => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
    );
    if (exists || fromId === toId) return;

    const connector: CanvasConnector = {
      id: generateId(),
      type: 'connector',
      fromId,
      toId,
      color: 'hsl(30, 15%, 45%)',
      style: 'arrow',
    };
    setConnectors((prev) => [...prev, connector]);
  }, [connectors]);

  const removeConnector = useCallback((id: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCanvas = useCallback(() => {
    setElements([]);
    setConnectors([]);
    setSelectedIds([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setConnectors(prevState.connectors);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setConnectors(nextState.connectors);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  const importProperties = useCallback((properties: PropertyResult[]) => {
    const newElements: CanvasProperty[] = properties.map((prop, index) => ({
      id: generateId(),
      type: 'property' as const,
      position: {
        x: 100 + (index % 4) * 220,
        y: 100 + Math.floor(index / 4) * 220,
      },
      data: {
        propertyId: prop.id,
        name: prop.name,
        location: prop.location,
        price: prop.price,
        size: prop.size,
        bedrooms: prop.bedrooms,
        thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop',
        features: prop.features,
      },
      rank: 0,
      notes: '',
      colorCode: '#6B7280',
    }));

    setElements((prev) => [...prev, ...newElements]);
  }, []);

  const handleConnectorClick = useCallback((elementId: string) => {
    if (!connectorMode) return;
    
    if (!connectorStart) {
      setConnectorStart(elementId);
    } else {
      if (connectorStart !== elementId) {
        addConnector(connectorStart, elementId);
      }
      setConnectorStart(null);
      setConnectorMode(false);
    }
  }, [connectorMode, connectorStart, addConnector]);

  const selectElement = useCallback((id: string, multiSelect = false) => {
    if (connectorMode) {
      handleConnectorClick(id);
      return;
    }

    if (multiSelect) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }, [connectorMode, handleConnectorClick]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const exportToPDF = useCallback(() => {
    // Create a printable view
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const propertyElements = elements.filter((el) => el.type === 'property') as CanvasProperty[];
    const stickyElements = elements.filter((el) => el.type === 'sticky') as CanvasStickyNote[];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Keynez AI - Research Canvas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
          h1 { color: #5c4033; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .properties-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
          .property-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
          .property-card h3 { margin: 0 0 8px 0; font-size: 14px; }
          .property-card .price { font-weight: bold; color: #5c4033; margin-bottom: 8px; }
          .property-card .stats { font-size: 12px; color: #666; }
          .property-card .rank { margin-top: 8px; }
          .property-card .notes { margin-top: 8px; font-size: 12px; color: #333; font-style: italic; }
          .notes-section { margin-top: 40px; }
          .sticky-note { background: #fffbcc; padding: 16px; margin-bottom: 16px; border-radius: 4px; }
          .stars { color: #eab308; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Keynez AI Research Canvas</h1>
        <p class="subtitle">Exported on ${new Date().toLocaleDateString()}</p>
        
        <h2>Properties (${propertyElements.length})</h2>
        <div class="properties-grid">
          ${propertyElements.map((p) => `
            <div class="property-card" style="border-left: 4px solid ${p.colorCode}">
              <h3>${p.data.name}</h3>
              <div class="price">HK$${(p.data.price / 1000000).toFixed(1)}M</div>
              <div class="stats">${p.data.bedrooms} bed • ${p.data.size.toLocaleString()} sqft • ${p.data.location}</div>
              <div class="rank">
                <span class="stars">${'★'.repeat(p.rank)}${'☆'.repeat(5 - p.rank)}</span>
              </div>
              ${p.notes ? `<div class="notes">"${p.notes}"</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        ${stickyElements.length > 0 ? `
          <div class="notes-section">
            <h2>Notes (${stickyElements.length})</h2>
            ${stickyElements.map((s) => `
              <div class="sticky-note">${s.content}</div>
            `).join('')}
          </div>
        ` : ''}
        
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }, [elements]);

  return {
    // State
    elements,
    connectors,
    selectedIds,
    zoom,
    connectorMode,
    connectorStart,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // Element operations
    addElement,
    updateElement,
    removeElement,
    moveElement,
    addStickyNote,
    addTextBox,
    addGroup,

    // Connector operations
    addConnector,
    removeConnector,
    setConnectorMode,

    // Selection
    selectElement,
    clearSelection,

    // Canvas operations
    setZoom,
    clearCanvas,
    saveToStorage,
    loadFromStorage,
    undo,
    redo,
    importProperties,
    exportToPDF,
  };
}
