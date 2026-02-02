import { useState } from "react";
import { Heart, Bed, Bath, Square, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/data/mockProperties";

interface PropertyCardProps {
  property: PropertyListing;
  className?: string;
  isHighlighted?: boolean;
}

export function PropertyCard({ property, className, isHighlighted }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
    setCurrentSlide((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
    setCurrentSlide((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

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
    <Card className={cn(
      "group overflow-hidden transition-all hover:shadow-lg",
      isHighlighted && "ring-2 ring-accent shadow-lg",
      className
    )}>
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div ref={emblaRef} className="h-full">
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
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                currentSlide === index ? "bg-background" : "bg-background/50"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge
            className={cn(
              "text-xs font-semibold",
              property.priceType === "sale"
                ? "bg-feature-new-build text-white"
                : "bg-feature-sea-view text-white"
            )}
          >
            For {property.priceType === "sale" ? "Sale" : "Rent"}
          </Badge>
          {property.isNew && (
            <Badge className="bg-accent text-accent-foreground text-xs font-semibold">
              New
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Price */}
        <p className="text-xl font-bold text-foreground">
          {formatPrice(property.price, property.priceType)}
        </p>

        {/* Location */}
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {property.address}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {property.district}, {property.region}
        </p>

        {/* Property Info */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            {property.size.toLocaleString()} sqft
          </span>
        </div>

        {/* Features */}
        <div className="mt-3 flex flex-wrap gap-1">
          {property.features.slice(0, 3).map((feature) => (
            <Badge
              key={feature}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {feature}
            </Badge>
          ))}
        </div>

        {/* Agent Info */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={property.agent.avatar} alt={property.agent.name} />
              <AvatarFallback>{property.agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{property.agent.name}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Phone className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
