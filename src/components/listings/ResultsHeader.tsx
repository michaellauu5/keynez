import { LayoutGrid, Map, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortOption = "price_asc" | "price_desc" | "size_desc" | "newest" | "relevant";
export type ViewMode = "grid" | "map";

interface ResultsHeaderProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSaveSearch: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "size_desc", label: "Size: Large to Small" },
];

export function ResultsHeader({
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onSaveSearch,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      {/* Left: Count */}
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-foreground">
          <span className="text-lg font-bold">{totalCount.toLocaleString()}</span>{" "}
          <span className="text-muted-foreground">properties found</span>
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Save Search */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSaveSearch}
          className="gap-2"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Save Search</span>
        </Button>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex border border-border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "h-9 px-3 rounded-none",
              viewMode === "grid" && "bg-accent text-accent-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("map")}
            className={cn(
              "h-9 px-3 rounded-none border-l border-border",
              viewMode === "map" && "bg-accent text-accent-foreground"
            )}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
