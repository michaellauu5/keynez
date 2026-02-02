import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { CanvasTextBox } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface DraggableTextBoxProps {
  textBox: CanvasTextBox;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasTextBox>) => void;
  onRemove: (id: string) => void;
}

export function DraggableTextBox({
  textBox,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: DraggableTextBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(textBox.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: textBox.id,
  });

  const style = {
    left: textBox.position.x,
    top: textBox.position.y,
    fontSize: textBox.fontSize,
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleContentSave = () => {
    if (content.trim() === '') {
      onRemove(textBox.id);
    } else {
      onUpdate(textBox.id, { content });
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute group select-none',
        isDragging && 'opacity-80 z-50',
        isSelected && 'ring-2 ring-accent ring-offset-2 rounded'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(textBox.id, e.metaKey || e.ctrlKey);
      }}
    >
      <div className="relative flex items-center gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            </div>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            </div>
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleContentSave();
              if (e.key === 'Escape') {
                setContent(textBox.content);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border-none outline-none text-foreground min-w-[100px]"
            style={{ fontSize: textBox.fontSize }}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="cursor-text text-foreground"
          >
            {textBox.content}
          </span>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(textBox.id);
          }}
          className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
