import {
  StickyNote,
  Type,
  ArrowRight,
  Square,
  Trash2,
  Save,
  FolderOpen,
  FileDown,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CanvasToolbarProps {
  zoom: number;
  connectorMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  elementCount: number;
  onAddStickyNote: () => void;
  onAddTextBox: () => void;
  onAddGroup: () => void;
  onToggleConnectorMode: () => void;
  onClearCanvas: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExportPDF: () => void;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function CanvasToolbar({
  zoom,
  connectorMode,
  canUndo,
  canRedo,
  elementCount,
  onAddStickyNote,
  onAddTextBox,
  onAddGroup,
  onToggleConnectorMode,
  onClearCanvas,
  onSave,
  onLoad,
  onExportPDF,
  onZoomChange,
  onUndo,
  onRedo,
}: CanvasToolbarProps) {
  const navigate = useNavigate();

  const handleSave = () => {
    onSave();
    toast.success('Canvas saved');
  };

  const handleLoad = () => {
    onLoad();
    toast.success('Canvas loaded');
  };

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
      {/* Left section - Back + Add tools */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={onAddStickyNote}
          className="gap-1.5"
        >
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Note</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onAddTextBox}
          className="gap-1.5"
        >
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">Text</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onAddGroup}
          className="gap-1.5"
        >
          <Square className="h-4 w-4" />
          <span className="hidden sm:inline">Group</span>
        </Button>

        <Button
          variant={connectorMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleConnectorMode}
          className={cn('gap-1.5', connectorMode && 'bg-accent text-accent-foreground')}
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
        </Button>
      </div>

      {/* Center section - Element count */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <span>{elementCount} elements</span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.max(50, zoom - 25))}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-20">
            <Slider
              value={[zoom]}
              onValueChange={([v]) => onZoomChange(v)}
              min={50}
              max={200}
              step={25}
              className="w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.min(200, zoom + 25))}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Save/Load/Export */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-8 w-8"
          title="Save canvas"
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLoad}
          className="h-8 w-8"
          title="Load canvas"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onExportPDF}
          className="h-8 w-8"
          title="Export to PDF"
        >
          <FileDown className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Clear canvas */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Clear canvas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear canvas?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all elements from the canvas. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClearCanvas} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
