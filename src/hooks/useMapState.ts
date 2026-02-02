import { useState, useCallback, useMemo } from "react";
import type { PropertyListing } from "@/data/mockProperties";

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  isDetailsPanelOpen: boolean;
  searchThisAreaVisible: boolean;
  mapBounds: google.maps.LatLngBounds | null;
}

const HONG_KONG_CENTER = { lat: 22.3193, lng: 114.1694 };
const DEFAULT_ZOOM = 11;

export function useMapState(properties: PropertyListing[]) {
  const [state, setState] = useState<MapState>({
    center: HONG_KONG_CENTER,
    zoom: DEFAULT_ZOOM,
    selectedPropertyId: null,
    hoveredPropertyId: null,
    isDetailsPanelOpen: false,
    searchThisAreaVisible: false,
    mapBounds: null,
  });

  const selectedProperty = useMemo(() => {
    if (!state.selectedPropertyId) return null;
    return properties.find(p => p.id === state.selectedPropertyId) || null;
  }, [properties, state.selectedPropertyId]);

  const setCenter = useCallback((center: { lat: number; lng: number }) => {
    setState(prev => ({ ...prev, center }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const selectProperty = useCallback((propertyId: string | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedPropertyId: propertyId,
      isDetailsPanelOpen: false,
    }));
  }, []);

  const setHoveredProperty = useCallback((propertyId: string | null) => {
    setState(prev => ({ ...prev, hoveredPropertyId: propertyId }));
  }, []);

  const openDetailsPanel = useCallback(() => {
    setState(prev => ({ ...prev, isDetailsPanelOpen: true }));
  }, []);

  const closeDetailsPanel = useCallback(() => {
    setState(prev => ({ ...prev, isDetailsPanelOpen: false }));
  }, []);

  const centerOnProperty = useCallback((property: PropertyListing) => {
    setState(prev => ({
      ...prev,
      center: property.coordinates,
      zoom: 15,
      selectedPropertyId: property.id,
    }));
  }, []);

  const setMapBounds = useCallback((bounds: google.maps.LatLngBounds | null) => {
    setState(prev => ({ ...prev, mapBounds: bounds, searchThisAreaVisible: true }));
  }, []);

  const clearSearchThisArea = useCallback(() => {
    setState(prev => ({ ...prev, searchThisAreaVisible: false }));
  }, []);

  const fitBounds = useCallback((map: google.maps.Map, props: PropertyListing[]) => {
    if (!map || props.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    props.forEach(p => {
      bounds.extend(p.coordinates);
    });
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, []);

  return {
    ...state,
    selectedProperty,
    setCenter,
    setZoom,
    selectProperty,
    setHoveredProperty,
    openDetailsPanel,
    closeDetailsPanel,
    centerOnProperty,
    setMapBounds,
    clearSearchThisArea,
    fitBounds,
  };
}
