import { useEffect, useState } from "react";
import { Heart, Bed, Bath, Square, Phone, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/data/mockProperties";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyCardProps {
  property: PropertyListing;
  className?: string;
  isHighlighted?: boolean;
}

export function PropertyCard({ property, className, isHighlighted }: PropertyCardProps) {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const formatPrice = (price: number, type: "sale" | "rent") => {
    if (type === "sale") {
      return `HK$${(price / 1000000).toFixed(price >= 10000000 ? 1 : 2)}M`;
    }
    return `HK$${price.toLocaleString()}${t("property.perMonth")}`;
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-md border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        isHighlighted && "border-foreground shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div ref={emblaRef} className="h-full">
          <div className="flex h-full">
            {property.images.map((image, index) => (
              <div key={index} className="min-w-0 flex-[0_0_100%]">
                <img src={image} alt={`${property.name} view ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full border border-border/60 bg-background/90 px-3 py-1 text-[11px] text-foreground backdrop-blur-sm">
              {property.priceType === "sale" ? t("property.forSale") : t("property.forRent")}
            </Badge>
            {property.isNew && (
              <Badge className="rounded-full px-3 py-1 text-[11px]">{t("property.new")}</Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 backdrop-blur-sm transition-opacity group-hover:flex"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 backdrop-blur-sm transition-opacity group-hover:flex"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/70 px-2 py-1 backdrop-blur-sm">
          {property.images.map((_, index) => (
            <span key={index} className={cn("h-1.5 w-1.5 rounded-full", currentSlide === index ? "bg-foreground" : "bg-foreground/30")} />
          ))}
        </div>
      </div>

      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">{formatPrice(property.price, property.priceType)}</p>
              <h3 className="mt-1 text-lg font-medium text-foreground">{property.name}</h3>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
              {property.propertyType}
            </Badge>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{property.address}</p>
              <p>{property.district}, {property.region}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-border py-4 text-sm text-foreground">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span>{property.size.toLocaleString()} {t("property.sqft")}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.features.slice(0, 4).map((feature) => (
            <Badge key={feature} variant="secondary" className="rounded-full px-3 py-1 text-[11px] text-foreground">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={property.agent.avatar} alt={property.agent.name} />
              <AvatarFallback>{property.agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{property.agent.name}</p>
              <p className="text-xs text-muted-foreground">{property.floorLevel} · {property.developer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-9 w-9 rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" className="rounded-full px-4">
              {t("property.viewDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
