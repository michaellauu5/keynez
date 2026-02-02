import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PropertyListing } from "@/data/mockProperties";

interface PropertyGridProps {
  properties: PropertyListing[];
}

const ITEMS_PER_PAGE = 12;

export function PropertyGrid({ properties }: PropertyGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  const displayedProperties = properties.slice(0, displayCount);
  const hasMore = displayCount < properties.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, properties.length));
      setIsLoading(false);
    }, 500);
  };

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">No properties found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {displayedProperties.map((property, index) => (
          <div
            key={property.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 50}ms` }}
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {/* Load More / Pagination */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${properties.length - displayCount} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* Results Count */}
      <p className="text-center text-sm text-muted-foreground">
        Showing {displayedProperties.length} of {properties.length} properties
      </p>
    </div>
  );
}
