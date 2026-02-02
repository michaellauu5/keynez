import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus, Crosshair, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyListing } from "@/data/mockProperties";
import { useTranslation } from "@/hooks/useTranslation";
import hongKongMapImage from "@/assets/hong-kong-map.png";

interface DummyHongKongMapProps {
  properties: PropertyListing[];
  hoveredPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (property: PropertyListing) => void;
  activeFilterCount?: number;
  className?: string;
}

// Property marker positions (percentage-based for the map image)
const DISTRICT_POSITIONS: Record<string, { x: number; y: number }> = {
  // New Territories
  "Sha Tin": { x: 55, y: 25 },
  "Tai Po": { x: 60, y: 18 },
  "Sai Kung": { x: 72, y: 35 },
  "Ma On Shan": { x: 65, y: 28 },
  "Clearwater Bay": { x: 75, y: 45 },
  "Tsuen Wan": { x: 30, y: 40 },
  "Tuen Mun": { x: 18, y: 35 },
  "Yuen Long": { x: 22, y: 25 },
  "Discovery Bay": { x: 28, y: 55 },
  "Tung Chung": { x: 15, y: 50 },
  // Kowloon
  "Tsim Sha Tsui": { x: 48, y: 58 },
  "Mong Kok": { x: 45, y: 52 },
  "Kowloon Tong": { x: 52, y: 48 },
  "Ho Man Tin": { x: 48, y: 52 },
  "Hung Hom": { x: 54, y: 56 },
  "Kowloon City": { x: 56, y: 50 },
  // Hong Kong Island
  "Central": { x: 45, y: 65 },
  "Mid-Levels": { x: 42, y: 68 },
  "The Peak": { x: 40, y: 72 },
  "Happy Valley": { x: 52, y: 68 },
  "Causeway Bay": { x: 56, y: 64 },
  "Wan Chai": { x: 50, y: 65 },
  "Repulse Bay": { x: 55, y: 78 },
};

interface PropertyPopup {
  property: PropertyListing;
  x: number;
  y: number;
}

export function DummyHongKongMap({
  properties,
  hoveredPropertyId,
  onPropertyHover,
  onPropertyClick,
  activeFilterCount = 0,
  className,
}: DummyHongKongMapProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [selectedPopup, setSelectedPopup] = useState<PropertyPopup | null>(null);

  // Group properties by district
  const propertiesByDistrict = useMemo(() => {
    const grouped: Record<string, PropertyListing[]> = {};
    properties.forEach((property) => {
      if (!grouped[property.district]) {
        grouped[property.district] = [];
      }
      grouped[property.district].push(property);
    });
    return grouped;
  }, [properties]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handleReset = () => setZoom(1);

  const handleMarkerClick = (property: PropertyListing, position: { x: number; y: number }) => {
    setSelectedPopup({
      property,
      x: position.x,
      y: position.y,
    });
  };

  const handleViewDetails = () => {
    if (selectedPopup) {
      onPropertyClick?.(selectedPopup.property);
      setSelectedPopup(null);
    }
  };

  // Render property markers for a district
  const renderDistrictMarkers = (district: string) => {
    const districtProperties = propertiesByDistrict[district] || [];
    const position = DISTRICT_POSITIONS[district];
    if (!position || districtProperties.length === 0) return null;

    // If multiple properties, show clustered marker
    if (districtProperties.length > 3) {
      return (
        <div
          key={`cluster-${district}`}
          className="absolute cursor-pointer transition-transform hover:scale-110"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleMarkerClick(districtProperties[0], position)}
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm shadow-lg border-2 border-white">
            {districtProperties.length}
          </div>
        </div>
      );
    }

    // Individual markers with slight offset
    return districtProperties.map((property, index) => {
      const offsetX = (index % 2) * 2 - 1;
      const offsetY = Math.floor(index / 2) * 2;
      const isHovered = hoveredPropertyId === property.id;
      const isSelected = selectedPopup?.property.id === property.id;
      const markerColor = property.priceType === "sale" ? "bg-blue-500" : "bg-green-500";

      return (
        <div
          key={property.id}
          className={cn(
            "absolute cursor-pointer transition-all duration-200",
            isHovered && "animate-pulse z-10"
          )}
          style={{
            left: `${position.x + offsetX}%`,
            top: `${position.y + offsetY}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleMarkerClick(property, { x: position.x + offsetX, y: position.y + offsetY })}
          onMouseEnter={() => onPropertyHover?.(property.id)}
          onMouseLeave={() => onPropertyHover?.(null)}
        >
          <div
            className={cn(
              "rounded-full border-2 border-white shadow-lg transition-all",
              markerColor,
              isHovered || isSelected ? "w-5 h-5" : "w-4 h-4"
            )}
          />
        </div>
      );
    });
  };

  return (
    <div
      className={cn(
        "relative h-[500px] rounded-lg overflow-hidden",
        className
      )}
      onClick={() => setSelectedPopup(null)}
    >
      {/* Map Image Background */}
      <div 
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
      >
        <img
          src={hongKongMapImage}
          alt="Hong Kong Map"
          className="w-full h-full object-cover"
        />
        
        {/* Property markers overlay */}
        <div className="absolute inset-0">
          {Object.keys(DISTRICT_POSITIONS).map((district) => renderDistrictMarkers(district))}
        </div>
      </div>

      {/* Property popup */}
      {selectedPopup && (
        <div
          className="absolute z-20 bg-card rounded-lg shadow-xl border p-3 min-w-[200px] animate-in fade-in-50 zoom-in-95"
          style={{
            left: `${Math.min(Math.max(selectedPopup.x, 15), 75)}%`,
            top: `${Math.min(Math.max(selectedPopup.y - 5, 10), 70)}%`,
            transform: "translate(-50%, -100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedPopup(null)}
            className="absolute -top-2 -right-2 p-1 bg-muted rounded-full hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Property image */}
          <div className="w-full h-24 rounded-md overflow-hidden mb-2">
            <img
              src={selectedPopup.property.images[0]}
              alt={selectedPopup.property.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Property info */}
          <h4 className="font-semibold text-sm truncate">{selectedPopup.property.name}</h4>
          <p className="text-xs text-muted-foreground mb-1">{selectedPopup.property.address}</p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{selectedPopup.property.bedrooms} {t('property.bed')}</span>
            <span>•</span>
            <span>{selectedPopup.property.bathrooms} {t('property.bath')}</span>
            <span>•</span>
            <span>{selectedPopup.property.size.toLocaleString()} sqft</span>
          </div>

          <p className="text-lg font-bold text-primary mb-2">
            {selectedPopup.property.priceType === "sale" ? (
              <>HK${(selectedPopup.property.price / 1000000).toFixed(1)}M</>
            ) : (
              <>HK${selectedPopup.property.price.toLocaleString()}{t('property.perMonth')}</>
            )}
          </p>

          <Button size="sm" className="w-full" onClick={handleViewDetails}>
            {t('map.viewDetails')}
          </Button>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md" onClick={handleZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md" onClick={handleZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md" onClick={handleReset}>
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter badge */}
      {activeFilterCount > 0 && (
        <Badge className="absolute top-4 left-4 gap-1 bg-accent text-accent-foreground z-10">
          <Search className="h-3 w-3" />
          {activeFilterCount} {t('map.filters')}
        </Badge>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs z-10">
        <p className="font-medium mb-2">{t('map.legend')}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>{t('map.forSale')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{t('map.forRent')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent flex items-center justify-center text-[8px] text-accent-foreground font-bold">
              5
            </div>
            <span>{t('map.clustered')}</span>
          </div>
        </div>
        <p className="mt-2 text-muted-foreground">{properties.length} {t('map.properties')}</p>
      </div>
    </div>
  );
}
