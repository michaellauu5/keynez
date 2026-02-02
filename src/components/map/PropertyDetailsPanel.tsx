import { useState } from "react";
import { X, Bed, Bath, Square, Phone, Mail, MapPin, ExternalLink, ChevronLeft, ChevronRight, Car, Dog, Sofa, Building } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/data/mockProperties";

interface PropertyDetailsPanelProps {
  property: PropertyListing;
  onClose: () => void;
  className?: string;
}

export function PropertyDetailsPanel({ property, onClose, className }: PropertyDetailsPanelProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const formatPrice = (price: number, type: "sale" | "rent") => {
    if (type === "sale") {
      if (price >= 10000000) {
        return `HK$${(price / 1000000).toFixed(1)}M`;
      }
      return `HK$${(price / 1000000).toFixed(2)}M`;
    }
    return `HK$${price.toLocaleString()}/mo`;
  };

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
    setCurrentSlide((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
    setCurrentSlide((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`;
  };

  return (
    <div 
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-2xl animate-slide-up",
        "h-[70vh] md:h-[70vh] overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Handle Bar (mobile) */}
      <div className="flex justify-center py-2 md:hidden">
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
        aria-label="Close panel"
      >
        <X className="h-5 w-5 text-foreground" />
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Carousel */}
        <div className="relative aspect-[16/9] bg-muted">
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {property.images.map((image, index) => (
                <div key={index} className="relative h-full min-w-0 flex-[0_0_100%]">
                  <img
                    src={image}
                    alt={`${property.name} - Image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm">
            {currentSlide + 1} / {property.images.length}
          </div>
        </div>

        {/* Property Info */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{property.name}</h2>
                <p className="text-muted-foreground mt-1">{property.propertyType}</p>
              </div>
              <Badge
                className={cn(
                  "text-sm font-semibold shrink-0",
                  property.priceType === "sale"
                    ? "bg-feature-new-build text-white"
                    : "bg-feature-sea-view text-white"
                )}
              >
                For {property.priceType === "sale" ? "Sale" : "Rent"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {formatPrice(property.price, property.priceType)}
            </p>
          </div>

          {/* Address with Get Directions */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="flex-1">{property.address}</span>
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent hover:underline text-sm shrink-0"
            >
              Get Directions
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <Bed className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-lg font-semibold mt-1">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
            </div>
            <div className="text-center">
              <Bath className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-lg font-semibold mt-1">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
            </div>
            <div className="text-center">
              <Square className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-lg font-semibold mt-1">{property.size.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Sq. Ft.</p>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Property Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Floor:</span>
                <span className="font-medium">{property.floorLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{property.buildingAge}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Orientation:</span>
                <span className="font-medium">{property.orientation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Developer:</span>
                <span className="font-medium">{property.developer}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.hasParking && (
                <Badge variant="secondary" className="gap-1">
                  <Car className="h-3 w-3" /> Parking
                </Badge>
              )}
              {property.petsAllowed && (
                <Badge variant="secondary" className="gap-1">
                  <Dog className="h-3 w-3" /> Pet-friendly
                </Badge>
              )}
              {property.isFurnished && (
                <Badge variant="secondary" className="gap-1">
                  <Sofa className="h-3 w-3" /> Furnished
                </Badge>
              )}
              {property.features.map((feature) => (
                <Badge key={feature} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Agent Info */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-foreground mb-4">Contact Agent</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={property.agent.avatar} alt={property.agent.name} />
                  <AvatarFallback>{property.agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{property.agent.name}</p>
                  <p className="text-sm text-muted-foreground">{property.agent.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
