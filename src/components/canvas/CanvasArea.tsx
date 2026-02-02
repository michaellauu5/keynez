import { DndContext, DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CanvasElement, CanvasConnector, CanvasProperty, CanvasStickyNote, CanvasTextBox, CanvasGroup } from '@/types/canvas';
import { DraggablePropertyCard } from './DraggablePropertyCard';
import { DraggableStickyNote } from './DraggableStickyNote';
import { DraggableTextBox } from './DraggableTextBox';
import { DraggableGroup } from './DraggableGroup';
import { ConnectorLine } from './ConnectorLine';
import { cn } from '@/lib/utils';

interface CanvasAreaProps {
  elements: CanvasElement[];
  connectors: CanvasConnector[];
  selectedIds: string[];
  zoom: number;
  connectorMode: boolean;
  connectorStart: string | null;
  onMoveElement: (id: string, position: { x: number; y: number }) => void;
  onSelectElement: (id: string, multiSelect: boolean) => void;
  onClearSelection: () => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onRemoveElement: (id: string) => void;
  onSelectConnector: (id: string) => void;
  onRemoveConnector: (id: string) => void;
}

export function CanvasArea({
  elements,
  connectors,
  selectedIds,
  zoom,
  connectorMode,
  connectorStart,
  onMoveElement,
  onSelectElement,
  onClearSelection,
  onUpdateElement,
  onRemoveElement,
  onSelectConnector,
  onRemoveConnector,
}: CanvasAreaProps) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const element = elements.find((el) => el.id === active.id);
    if (element) {
      onMoveElement(active.id as string, {
        x: element.position.x + delta.x / (zoom / 100),
        y: element.position.y + delta.y / (zoom / 100),
      });
    }
  };

  // Sort elements so groups render first (behind other elements)
  const sortedElements = [...elements].sort((a, b) => {
    if (a.type === 'group' && b.type !== 'group') return -1;
    if (a.type !== 'group' && b.type === 'group') return 1;
    return 0;
  });

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className={cn(
          'relative flex-1 overflow-auto',
          connectorMode && 'cursor-crosshair'
        )}
        onClick={onClearSelection}
        style={{
          backgroundImage: `radial-gradient(circle, hsl(35, 20%, 85%) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <div
          className="relative min-w-[2000px] min-h-[1500px]"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        >
          {/* SVG layer for connectors */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(30, 15%, 45%)"
                />
              </marker>
            </defs>
            <g style={{ pointerEvents: 'auto' }}>
              {connectors.map((connector) => (
                <ConnectorLine
                  key={connector.id}
                  connector={connector}
                  elements={elements}
                  isSelected={selectedIds.includes(connector.id)}
                  onSelect={onSelectConnector}
                  onRemove={onRemoveConnector}
                />
              ))}
            </g>
          </svg>

          {/* Canvas elements */}
          {sortedElements.map((element) => {
            switch (element.type) {
              case 'property':
                return (
                  <DraggablePropertyCard
                    key={element.id}
                    property={element as CanvasProperty}
                    isSelected={selectedIds.includes(element.id)}
                    onSelect={onSelectElement}
                    onUpdate={(id, updates) => onUpdateElement(id, updates)}
                    onRemove={onRemoveElement}
                  />
                );
              case 'sticky':
                return (
                  <DraggableStickyNote
                    key={element.id}
                    note={element as CanvasStickyNote}
                    isSelected={selectedIds.includes(element.id)}
                    onSelect={onSelectElement}
                    onUpdate={(id, updates) => onUpdateElement(id, updates)}
                    onRemove={onRemoveElement}
                  />
                );
              case 'text':
                return (
                  <DraggableTextBox
                    key={element.id}
                    textBox={element as CanvasTextBox}
                    isSelected={selectedIds.includes(element.id)}
                    onSelect={onSelectElement}
                    onUpdate={(id, updates) => onUpdateElement(id, updates)}
                    onRemove={onRemoveElement}
                  />
                );
              case 'group':
                return (
                  <DraggableGroup
                    key={element.id}
                    group={element as CanvasGroup}
                    isSelected={selectedIds.includes(element.id)}
                    onSelect={onSelectElement}
                    onUpdate={(id, updates) => onUpdateElement(id, updates)}
                    onRemove={onRemoveElement}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Connector mode indicator */}
          {connectorMode && connectorStart && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Click another element to connect
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}
