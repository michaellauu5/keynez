import { Plus, Minus, Locate, Maximize2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  onFullscreen?: () => void;
  onSearchThisArea?: () => void;
  showSearchThisArea?: boolean;
  activeFilterCount?: number;
  className?: string;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onMyLocation,
  onFullscreen,
  onSearchThisArea,
  showSearchThisArea = false,
  activeFilterCount = 0,
  className,
}: MapControlsProps) {
  return (
    <>
      {/* Zoom Controls - Bottom Right */}
      <div className={cn("absolute right-4 bottom-20 flex flex-col gap-2", className)}>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          className="h-10 w-10 bg-card shadow-md hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          className="h-10 w-10 bg-card shadow-md hover:bg-secondary"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onMyLocation}
          className="h-10 w-10 bg-card shadow-md hover:bg-secondary"
        >
          <Locate className="h-4 w-4" />
        </Button>
        {onFullscreen && (
          <Button
            variant="outline"
            size="icon"
            onClick={onFullscreen}
            className="h-10 w-10 bg-card shadow-md hover:bg-secondary"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search This Area Button - Top Center */}
      {showSearchThisArea && onSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={onSearchThisArea}
            className="bg-card text-foreground shadow-lg hover:bg-secondary gap-2"
          >
            <Search className="h-4 w-4" />
            Search this area
          </Button>
        </div>
      )}

      {/* Active Filter Badge - Top Left */}
      {activeFilterCount > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-accent text-accent-foreground shadow-md">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </Badge>
        </div>
      )}
    </>
  );
}
