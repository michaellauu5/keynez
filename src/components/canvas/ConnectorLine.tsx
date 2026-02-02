import { CanvasConnector, CanvasElement } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface ConnectorLineProps {
  connector: CanvasConnector;
  elements: CanvasElement[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function getElementCenter(element: CanvasElement): { x: number; y: number } {
  const width = element.type === 'property' ? 180 : element.type === 'sticky' ? (element as any).width : 100;
  const height = element.type === 'property' ? 200 : element.type === 'sticky' ? (element as any).height : 30;
  
  return {
    x: element.position.x + width / 2,
    y: element.position.y + height / 2,
  };
}

export function ConnectorLine({
  connector,
  elements,
  isSelected,
  onSelect,
  onRemove,
}: ConnectorLineProps) {
  const fromElement = elements.find((el) => el.id === connector.fromId);
  const toElement = elements.find((el) => el.id === connector.toId);

  if (!fromElement || !toElement) return null;

  const from = getElementCenter(fromElement);
  const to = getElementCenter(toElement);

  // Calculate control points for bezier curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5 + 50;

  const c1x = from.x + controlOffset;
  const c1y = from.y;
  const c2x = to.x - controlOffset;
  const c2y = to.y;

  const path = `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;

  // Calculate arrow head position and angle
  const arrowSize = 8;
  const angle = Math.atan2(to.y - c2y, to.x - c2x);
  const arrowPath = connector.style === 'arrow' 
    ? `M ${to.x - arrowSize * Math.cos(angle - Math.PI / 6)} ${to.y - arrowSize * Math.sin(angle - Math.PI / 6)} 
       L ${to.x} ${to.y} 
       L ${to.x - arrowSize * Math.cos(angle + Math.PI / 6)} ${to.y - arrowSize * Math.sin(angle + Math.PI / 6)}`
    : '';

  return (
    <g
      onClick={() => onSelect(connector.id)}
      onDoubleClick={() => onRemove(connector.id)}
      className="cursor-pointer"
      style={{ pointerEvents: 'stroke' }}
    >
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="pointer-events-stroke"
      />
      
      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? 'hsl(45, 95%, 55%)' : connector.color}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={connector.style === 'dashed' ? '8 4' : undefined}
        className={cn(
          'transition-colors',
          isSelected && 'drop-shadow-md'
        )}
      />

      {/* Arrow head */}
      {connector.style === 'arrow' && (
        <path
          d={arrowPath}
          fill="none"
          stroke={isSelected ? 'hsl(45, 95%, 55%)' : connector.color}
          strokeWidth={isSelected ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}
