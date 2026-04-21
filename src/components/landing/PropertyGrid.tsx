import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PropertyListing } from "@/data/mockProperties";

interface PropertyGridProps {
  properties: PropertyListing[];
  onPropertyHover?: (propertyId: string | null) => void;
  highlightedPropertyId?: string | null;
}

const ITEMS_PER_PAGE = 12;

export function PropertyGrid({ properties, onPropertyHover, highlightedPropertyId }: PropertyGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [properties]);

  const displayedProperties = properties.slice(0, displayCount);
  const hasMore = displayCount < properties.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, properties.length));
      setIsLoading(false);
    }, 350);
  };

  if (properties.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No properties found</p>
        <p className="mt-2 text-sm text-muted-foreground">Adjust your filters to broaden the search area or price range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displayedProperties.map((property, index) => (
          <div
            key={property.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 35}ms` }}
            onMouseEnter={() => onPropertyHover?.(property.id)}
            onMouseLeave={() => onPropertyHover?.(null)}
          >
            <PropertyCard property={property} isHighlighted={highlightedPropertyId === property.id} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        {hasMore && (
          <Button onClick={handleLoadMore} disabled={isLoading} variant="outline" className="min-w-[220px] rounded-full px-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more homes
              </>
            ) : (
              `Load more (${properties.length - displayCount} remaining)`
            )}
          </Button>
        )}
        <p className="text-sm text-muted-foreground">Showing {displayedProperties.length} of {properties.length} homes</p>
      </div>
    </div>
  );
}
