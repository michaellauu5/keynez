import { X, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyListing } from "@/data/mockProperties";

interface PropertyInfoWindowProps {
  property: PropertyListing;
  onClose: () => void;
  onViewDetails: () => void;
}

export function PropertyInfoWindow({ property, onClose, onViewDetails }: PropertyInfoWindowProps) {
  const formatPrice = (price: number, type: "sale" | "rent") => {
    if (type === "sale") {
      if (price >= 10000000) {
        return `HK$${(price / 1000000).toFixed(1)}M`;
      }
      return `HK$${(price / 1000000).toFixed(2)}M`;
    }
    return `HK$${price.toLocaleString()}/mo`;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden w-[280px] border border-border">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full p-1 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Image */}
      <div className="relative h-[120px]">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <p className="text-lg font-bold text-foreground">
          {formatPrice(property.price, property.priceType)}
        </p>

        {/* Address */}
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {property.address}
        </p>

        {/* Property Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-3 w-3" />
            {property.size.toLocaleString()} sqft
          </span>
        </div>

        {/* View Details Button */}
        <Button
          onClick={onViewDetails}
          className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-sm"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
