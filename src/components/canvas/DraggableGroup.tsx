import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { CanvasGroup } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface DraggableGroupProps {
  group: CanvasGroup;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasGroup>) => void;
  onRemove: (id: string) => void;
}

export function DraggableGroup({
  group,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: DraggableGroupProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [label, setLabel] = useState(group.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: group.id,
  });

  const style = {
    left: group.position.x,
    top: group.position.y,
    width: group.width,
    height: group.height,
    backgroundColor: group.color,
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  const handleLabelSave = () => {
    onUpdate(group.id, { label });
    setIsEditingLabel(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute rounded-lg border-2 border-dashed border-border/50 select-none -z-10',
        isDragging && 'opacity-80 z-0',
        isSelected && 'border-accent'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(group.id, e.metaKey || e.ctrlKey);
      }}
    >
      {/* Header bar - draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-6 left-0 right-0 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        {/* Label */}
        {isEditingLabel ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSave();
              if (e.key === 'Escape') {
                setLabel(group.label);
                setIsEditingLabel(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background/80 border border-border rounded px-2 py-0.5 text-xs font-medium text-foreground outline-none"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingLabel(true);
            }}
            className="bg-background/80 border border-border rounded px-2 py-0.5 text-xs font-medium text-muted-foreground cursor-text"
          >
            {group.label}
          </span>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(group.id);
          }}
          className="p-0.5 rounded hover:bg-muted bg-background/80 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
