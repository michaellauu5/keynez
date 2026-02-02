import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { CanvasStickyNote, STICKY_NOTE_COLORS, StickyNoteColor } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface DraggableStickyNoteProps {
  note: CanvasStickyNote;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasStickyNote>) => void;
  onRemove: (id: string) => void;
}

const colorOptions: StickyNoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple'];

export function DraggableStickyNote({
  note,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: DraggableStickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
  });

  const style = {
    left: note.position.x,
    top: note.position.y,
    width: note.width,
    minHeight: note.height,
    backgroundColor: STICKY_NOTE_COLORS[note.color],
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleContentSave = () => {
    onUpdate(note.id, { content });
    setIsEditing(false);
  };

  const handleColorChange = (color: StickyNoteColor) => {
    onUpdate(note.id, { color });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute rounded-md shadow-md p-3 select-none transition-shadow',
        isDragging && 'opacity-80 shadow-xl z-50',
        isSelected && 'ring-2 ring-accent'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(note.id, e.metaKey || e.ctrlKey);
      }}
    >
      {/* Header with drag handle and controls */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
      >
        {/* Color selector */}
        <div className="flex gap-1">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                handleColorChange(color);
              }}
              className={cn(
                'w-3 h-3 rounded-full transition-transform hover:scale-110',
                note.color === color && 'ring-1 ring-offset-1 ring-foreground/50'
              )}
              style={{ backgroundColor: STICKY_NOTE_COLORS[color] }}
            />
          ))}
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(note.id);
          }}
          className="p-0.5 rounded hover:bg-foreground/10 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-foreground/50" />
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleContentSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setContent(note.content);
              setIsEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="min-h-[80px] bg-transparent border-none resize-none p-0 text-sm focus-visible:ring-0"
          style={{ color: 'hsl(30, 20%, 15%)' }}
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="text-sm whitespace-pre-wrap cursor-text min-h-[80px]"
          style={{ color: 'hsl(30, 20%, 15%)' }}
        >
          {note.content}
        </div>
      )}
    </div>
  );
}
