import { LayoutGrid, Map, Heart, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type SortOption = "price_asc" | "price_desc" | "size_desc" | "newest" | "relevant";
export type ViewMode = "grid" | "map" | "split";

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

export function ResultsHeader({ totalCount, sortBy, onSortChange, viewMode, onViewModeChange, onSaveSearch }: ResultsHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-md border border-border bg-background/95 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-normal text-muted-foreground">Results</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-2xl font-semibold text-foreground">{totalCount.toLocaleString()}</span> homes available
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={onSaveSearch} className="h-10 rounded-full px-4">
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Save Search</span>
          </Button>

          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="h-10 w-[210px] rounded-full bg-background">
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

          <div className="flex overflow-hidden rounded-full border border-border bg-background">
            <Button variant="ghost" size="sm" onClick={() => onViewModeChange("grid")} className={cn("rounded-none px-3", viewMode === "grid" && "bg-accent text-accent-foreground")} title="Grid View">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onViewModeChange("map")} className={cn("rounded-none border-l border-border px-3", viewMode === "map" && "bg-accent text-accent-foreground")} title="Map View">
              <Map className="h-4 w-4" />
            </Button>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => onViewModeChange("split")} className={cn("rounded-none border-l border-border px-3", viewMode === "split" && "bg-accent text-accent-foreground")} title="Split View">
                <Columns className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
