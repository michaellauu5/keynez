import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Bed, Bath, Maximize, X, MessageSquare, Palette } from 'lucide-react';
import { CanvasProperty, PROPERTY_CARD_COLORS } from '@/types/canvas';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DraggablePropertyCardProps {
  property: CanvasProperty;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasProperty>) => void;
  onRemove: (id: string) => void;
}

export function DraggablePropertyCard({
  property,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: DraggablePropertyCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(property.notes);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: property.id,
  });

  const style = {
    left: property.position.x,
    top: property.position.y,
    transform: CSS.Translate.toString(transform),
  };

  const handleNotesSave = () => {
    onUpdate(property.id, { notes: notesValue });
    setShowNotes(false);
  };

  const handleColorChange = (color: string) => {
    onUpdate(property.id, { colorCode: color });
  };

  const handleRankChange = (rank: number) => {
    onUpdate(property.id, { rank });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute w-[180px] rounded-lg bg-card shadow-lg border overflow-hidden transition-shadow select-none',
        isDragging && 'opacity-80 shadow-xl z-50',
        isSelected && 'ring-2 ring-accent'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(property.id, e.metaKey || e.ctrlKey);
      }}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5"
        style={{ backgroundColor: property.colorCode }}
      />

      {/* Drag handle - Image area */}
      <div
        {...attributes}
        {...listeners}
        className="relative h-20 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <img
          src={property.data.thumbnail}
          alt={property.data.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(property.id);
          }}
          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 space-y-1.5">
        <h4 className="font-medium text-xs truncate" title={property.data.name}>
          {property.data.name}
        </h4>
        
        <p className="text-sm font-semibold text-primary">
          HK${(property.data.price / 1000000).toFixed(1)}M
        </p>

        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <span className="flex items-center gap-0.5">
            <Bed className="h-3 w-3" />
            {property.data.bedrooms}
          </span>
          {property.data.bathrooms && (
            <span className="flex items-center gap-0.5">
              <Bath className="h-3 w-3" />
              {property.data.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Maximize className="h-3 w-3" />
            {property.data.size.toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        <div className="pt-1">
          <StarRating
            rating={property.rank}
            onChange={handleRankChange}
            size="sm"
          />
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-1 pt-1">
          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <Palette className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                {PROPERTY_CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'w-5 h-5 rounded-full transition-transform hover:scale-110',
                      property.colorCode === color && 'ring-2 ring-offset-1 ring-foreground'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Notes toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes(!showNotes);
            }}
          >
            <MessageSquare className={cn('h-3 w-3', property.notes && 'text-accent')} />
          </Button>
        </div>

        {/* Notes input */}
        {showNotes && (
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNotesSave()}
              placeholder="Add notes..."
              className="h-7 text-xs"
            />
          </div>
        )}

        {/* Show notes preview if exists but not editing */}
        {!showNotes && property.notes && (
          <p className="text-[10px] text-muted-foreground italic truncate">
            "{property.notes}"
          </p>
        )}
      </div>
    </div>
  );
}
