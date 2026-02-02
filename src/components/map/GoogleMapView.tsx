import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api";
import { MapPin, Loader2 } from "lucide-react";
import { MapControls } from "./MapControls";
import { PropertyInfoWindow } from "./PropertyInfoWindow";
import { PropertyDetailsPanel } from "./PropertyDetailsPanel";
import { useMapState } from "@/hooks/useMapState";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/data/mockProperties";

interface GoogleMapViewProps {
  properties: PropertyListing[];
  hoveredPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (property: PropertyListing) => void;
  activeFilterCount?: number;
  className?: string;
}

// Custom map styles matching Keynest palette
const mapStyles = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a8d8ea" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f0e6" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#d4c5b0" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c9bba3" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#c8e6c9" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a3b2a" }],
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a3b2a" }],
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const HONG_KONG_CENTER = { lat: 22.3193, lng: 114.1694 };

// Cluster styles
const clusterStyles = [
  {
    textColor: "white",
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="#d4a853" stroke="#fff" stroke-width="2"/>
      </svg>
    `),
    height: 50,
    width: 50,
  },
  {
    textColor: "white",
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="25" fill="#d4a853" stroke="#fff" stroke-width="2"/>
      </svg>
    `),
    height: 60,
    width: 60,
  },
];

export function GoogleMapView({
  properties,
  hoveredPropertyId,
  onPropertyHover,
  onPropertyClick,
  activeFilterCount = 0,
  className,
}: GoogleMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapMoved, setMapMoved] = useState(false);

  const {
    center,
    zoom,
    selectedPropertyId,
    isDetailsPanelOpen,
    selectedProperty,
    setCenter,
    setZoom,
    selectProperty,
    openDetailsPanel,
    closeDetailsPanel,
    fitBounds,
  } = useMapState(properties);

  // Check for API key - use import.meta.env for Vite
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (properties.length > 0) {
      fitBounds(map, properties);
    }
  }, [properties, fitBounds]);

  const onMapDragEnd = useCallback(() => {
    setMapMoved(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || zoom;
      mapRef.current.setZoom(currentZoom + 1);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || zoom;
      mapRef.current.setZoom(currentZoom - 1);
    }
  }, [zoom]);

  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(pos);
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(14);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    }
  }, [setCenter]);

  const handleSearchThisArea = useCallback(() => {
    setMapMoved(false);
    // In a real app, this would trigger a search within the current map bounds
  }, []);

  const handleMarkerClick = useCallback((property: PropertyListing) => {
    selectProperty(property.id);
    onPropertyClick?.(property);
  }, [selectProperty, onPropertyClick]);

  const handleInfoWindowClose = useCallback(() => {
    selectProperty(null);
  }, [selectProperty]);

  const handleViewDetails = useCallback(() => {
    openDetailsPanel();
  }, [openDetailsPanel]);

  // Get marker icon based on property type
  const getMarkerIcon = useCallback((property: PropertyListing, isHovered: boolean, isSelected: boolean) => {
    const color = property.priceType === "sale" ? "#3B82F6" : "#22C55E";
    const scale = isHovered || isSelected ? 1.3 : 1;
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10 * scale,
    };
  }, []);

  // Fit bounds when properties change
  useEffect(() => {
    if (mapRef.current && properties.length > 0) {
      fitBounds(mapRef.current, properties);
    }
  }, [properties, fitBounds]);

  if (loadError) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] bg-muted rounded-lg", className)}>
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Map Error</h3>
          <p className="text-sm text-muted-foreground">
            Failed to load Google Maps. Please check your API key configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] bg-muted rounded-lg", className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] bg-muted rounded-lg", className)}>
        <div className="text-center p-6 max-w-md">
          <MapPin className="h-12 w-12 mx-auto text-accent mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To enable the interactive map, please add your Google Maps API key.
          </p>
          <a
            href="https://console.cloud.google.com/google/maps-apis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline text-sm"
          >
            Get an API key from Google Cloud Console →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-[500px] rounded-lg overflow-hidden", className)}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onMapLoad}
        onDragEnd={onMapDragEnd}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <MarkerClusterer
          options={{
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            minimumClusterSize: 3,
            styles: clusterStyles,
          }}
        >
          {(clusterer) => (
            <>
              {properties.map((property) => (
                <Marker
                  key={property.id}
                  position={property.coordinates}
                  icon={getMarkerIcon(
                    property,
                    hoveredPropertyId === property.id,
                    selectedPropertyId === property.id
                  )}
                  onClick={() => handleMarkerClick(property)}
                  clusterer={clusterer}
                  animation={
                    hoveredPropertyId === property.id
                      ? google.maps.Animation.BOUNCE
                      : undefined
                  }
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {/* Info Window */}
        {selectedProperty && !isDetailsPanelOpen && (
          <InfoWindow
            position={selectedProperty.coordinates}
            onCloseClick={handleInfoWindowClose}
            options={{
              pixelOffset: new google.maps.Size(0, -30),
            }}
          >
            <PropertyInfoWindow
              property={selectedProperty}
              onClose={handleInfoWindowClose}
              onViewDetails={handleViewDetails}
            />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMyLocation={handleMyLocation}
        onSearchThisArea={handleSearchThisArea}
        showSearchThisArea={mapMoved}
        activeFilterCount={activeFilterCount}
      />

      {/* Property Details Panel */}
      {isDetailsPanelOpen && selectedProperty && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeDetailsPanel}
          />
          <PropertyDetailsPanel
            property={selectedProperty}
            onClose={closeDetailsPanel}
          />
        </>
      )}
    </div>
  );
}
