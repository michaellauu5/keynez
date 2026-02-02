import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Plus, Minus, Crosshair, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyListing } from "@/data/mockProperties";

interface DummyHongKongMapProps {
  properties: PropertyListing[];
  hoveredPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (property: PropertyListing) => void;
  activeFilterCount?: number;
  className?: string;
}

// Hong Kong regions with SVG paths and district data
const REGIONS = {
  "New Territories": {
    path: "M 10 5 L 90 5 L 95 25 L 85 35 L 70 30 L 55 35 L 40 30 L 25 35 L 10 25 Z",
    fill: "hsl(var(--muted))",
    center: { x: 52, y: 18 },
    districts: ["Sha Tin", "Tai Po", "Sai Kung", "Ma On Shan", "Clearwater Bay", "Tsuen Wan", "Tuen Mun", "Yuen Long", "Discovery Bay", "Tung Chung"],
  },
  "Kowloon": {
    path: "M 35 35 L 65 35 L 70 50 L 60 55 L 40 55 L 30 50 Z",
    fill: "hsl(var(--secondary))",
    center: { x: 50, y: 45 },
    districts: ["Tsim Sha Tsui", "Mong Kok", "Kowloon Tong", "Ho Man Tin", "Hung Hom", "Kowloon City"],
  },
  "Hong Kong Island": {
    path: "M 25 60 L 75 60 L 80 72 L 70 85 L 50 90 L 30 85 L 20 72 Z",
    fill: "hsl(var(--accent)/0.3)",
    center: { x: 50, y: 73 },
    districts: ["Central", "Mid-Levels", "The Peak", "Happy Valley", "Causeway Bay", "Wan Chai", "Repulse Bay"],
  },
};

// District positions within regions (relative x, y percentages)
const DISTRICT_POSITIONS: Record<string, { x: number; y: number }> = {
  // New Territories
  "Sha Tin": { x: 55, y: 15 },
  "Tai Po": { x: 65, y: 10 },
  "Sai Kung": { x: 80, y: 20 },
  "Ma On Shan": { x: 70, y: 15 },
  "Clearwater Bay": { x: 85, y: 28 },
  "Tsuen Wan": { x: 25, y: 22 },
  "Tuen Mun": { x: 15, y: 15 },
  "Yuen Long": { x: 20, y: 10 },
  "Discovery Bay": { x: 30, y: 28 },
  "Tung Chung": { x: 12, y: 25 },
  // Kowloon
  "Tsim Sha Tsui": { x: 50, y: 50 },
  "Mong Kok": { x: 45, y: 42 },
  "Kowloon Tong": { x: 55, y: 38 },
  "Ho Man Tin": { x: 48, y: 45 },
  "Hung Hom": { x: 58, y: 48 },
  "Kowloon City": { x: 60, y: 42 },
  // Hong Kong Island
  "Central": { x: 42, y: 65 },
  "Mid-Levels": { x: 38, y: 70 },
  "The Peak": { x: 35, y: 75 },
  "Happy Valley": { x: 55, y: 70 },
  "Causeway Bay": { x: 60, y: 65 },
  "Wan Chai": { x: 52, y: 65 },
  "Repulse Bay": { x: 58, y: 82 },
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
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

  // Get district property count
  const getDistrictCount = useCallback(
    (district: string) => propertiesByDistrict[district]?.length || 0,
    [propertiesByDistrict]
  );

  // Get region property count
  const getRegionCount = useCallback(
    (regionName: string) => {
      const region = REGIONS[regionName as keyof typeof REGIONS];
      if (!region) return 0;
      return region.districts.reduce((sum, district) => sum + getDistrictCount(district), 0);
    },
    [getDistrictCount]
  );

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMarkerClick = (property: PropertyListing, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest("svg")?.getBoundingClientRect();
    if (parentRect) {
      setSelectedPopup({
        property,
        x: ((rect.left - parentRect.left + rect.width / 2) / parentRect.width) * 100,
        y: ((rect.top - parentRect.top) / parentRect.height) * 100,
      });
    }
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
        <g key={`cluster-${district}`}>
          <circle
            cx={position.x}
            cy={position.y}
            r={3}
            className="fill-accent stroke-white stroke-[0.5] cursor-pointer transition-transform hover:scale-125"
            onClick={(e) => handleMarkerClick(districtProperties[0], e)}
          />
          <text
            x={position.x}
            y={position.y + 0.8}
            textAnchor="middle"
            className="fill-accent-foreground text-[2.5px] font-bold pointer-events-none"
          >
            {districtProperties.length}
          </text>
        </g>
      );
    }

    // Individual markers with slight offset
    return districtProperties.map((property, index) => {
      const offsetX = (index % 2) * 3 - 1.5;
      const offsetY = Math.floor(index / 2) * 3;
      const isHovered = hoveredPropertyId === property.id;
      const isSelected = selectedPopup?.property.id === property.id;
      const markerColor = property.priceType === "sale" ? "#3B82F6" : "#22C55E";

      return (
        <circle
          key={property.id}
          cx={position.x + offsetX}
          cy={position.y + offsetY}
          r={isHovered || isSelected ? 2.5 : 2}
          fill={markerColor}
          className={cn(
            "stroke-white stroke-[0.4] cursor-pointer transition-all",
            isHovered && "animate-pulse"
          )}
          onClick={(e) => handleMarkerClick(property, e)}
          onMouseEnter={() => onPropertyHover?.(property.id)}
          onMouseLeave={() => onPropertyHover?.(null)}
        />
      );
    });
  };

  return (
    <div
      className={cn(
        "relative h-[500px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-blue-200",
        className
      )}
      onClick={() => setSelectedPopup(null)}
    >
      {/* Water background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <pattern id="water-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M0 10 Q5 5 10 10 Q15 15 20 10"
              fill="none"
              stroke="hsl(var(--primary)/0.2)"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#water-pattern)" />
        </svg>
      </div>

      {/* Main map SVG */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "center",
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Render regions */}
        {Object.entries(REGIONS).map(([name, region]) => {
          const isHovered = hoveredRegion === name;
          const propertyCount = getRegionCount(name);

          return (
            <g key={name}>
              {/* Region shape */}
              <path
                d={region.path}
                fill={region.fill}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  isHovered && "brightness-110"
                )}
                onMouseEnter={() => setHoveredRegion(name)}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Region label */}
              <text
                x={region.center.x}
                y={region.center.y}
                textAnchor="middle"
                className="fill-foreground/70 text-[3px] font-medium pointer-events-none select-none"
              >
                {name}
              </text>

              {/* Property count badge */}
              {propertyCount > 0 && (
                <g>
                  <rect
                    x={region.center.x - 5}
                    y={region.center.y + 2}
                    width={10}
                    height={4}
                    rx={1}
                    className="fill-primary"
                  />
                  <text
                    x={region.center.x}
                    y={region.center.y + 4.8}
                    textAnchor="middle"
                    className="fill-primary-foreground text-[2.5px] font-bold pointer-events-none"
                  >
                    {propertyCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render property markers */}
        {Object.keys(DISTRICT_POSITIONS).map((district) => renderDistrictMarkers(district))}
      </svg>

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
            <span>{selectedPopup.property.bedrooms} bed</span>
            <span>•</span>
            <span>{selectedPopup.property.bathrooms} bath</span>
            <span>•</span>
            <span>{selectedPopup.property.size.toLocaleString()} sqft</span>
          </div>

          <p className="text-lg font-bold text-primary mb-2">
            {selectedPopup.property.priceType === "sale" ? (
              <>HK${(selectedPopup.property.price / 1000000).toFixed(1)}M</>
            ) : (
              <>HK${selectedPopup.property.price.toLocaleString()}/mo</>
            )}
          </p>

          <Button size="sm" className="w-full" onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
        <Badge className="absolute top-4 left-4 gap-1 bg-accent text-accent-foreground">
          <Search className="h-3 w-3" />
          {activeFilterCount} filters
        </Badge>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <p className="font-medium mb-2">Legend</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>For Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>For Rent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent flex items-center justify-center text-[8px] text-accent-foreground font-bold">
              5
            </div>
            <span>Clustered</span>
          </div>
        </div>
        <p className="mt-2 text-muted-foreground">{properties.length} properties</p>
      </div>

      {/* Hover tooltip for regions */}
      {hoveredRegion && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <p className="font-medium">{hoveredRegion}</p>
          <p className="text-sm text-muted-foreground">{getRegionCount(hoveredRegion)} properties</p>
        </div>
      )}
    </div>
  );
}
