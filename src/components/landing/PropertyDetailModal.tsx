import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Building2, 
  Calendar, 
  Compass, 
  Phone, 
  Mail, 
  MessageCircle,
  ExternalLink,
  Plus,
  DollarSign,
  Star,
  Home,
  Layers
} from "lucide-react";
import { PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { cn } from "@/lib/utils";

interface PropertyDetailModalProps {
  property: PropertyResult | WebSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCanvas?: (property: PropertyResult | WebSearchResult) => void;
  type: 'ai' | 'web';
}

function isWebSearchResult(property: any): property is WebSearchResult {
  return 'buildingName' in property && 'sourceUrl' in property;
}

function formatPrice(price: number | null, type: 'sale' | 'rent' = 'sale'): string {
  if (!price) return '-';
  
  if (type === 'rent') {
    return `HK$${price.toLocaleString()}/mo`;
  }
  
  if (price >= 1000000) {
    return `HK$${(price / 1000000).toFixed(1)}M`;
  }
  return `HK$${price.toLocaleString()}`;
}

export function PropertyDetailModal({ 
  property, 
  isOpen, 
  onClose, 
  onAddToCanvas,
  type 
}: PropertyDetailModalProps) {
  if (!property) return null;

  const isWeb = isWebSearchResult(property);
  
  // Normalize property data
  const name = isWeb ? property.buildingName : property.name;
  const location = isWeb ? property.location : property.location;
  const price = isWeb ? (property.monthlyRent || property.salePrice) : property.price;
  const priceType = isWeb && property.monthlyRent ? 'rent' : 'sale';
  const bedrooms = isWeb ? property.bedrooms : property.bedrooms;
  const bathrooms = isWeb ? property.bathrooms : (property.bathrooms || '-');
  const size = isWeb ? property.size : property.size;
  const floorLevel = isWeb ? property.floorLevel : (property.floorLevel || '-');
  const features = isWeb ? property.features : property.features;
  const propertyType = isWeb ? '-' : (property.propertyType || '-');
  const buildingAge = isWeb ? '-' : (property.buildingAge || '-');
  const orientation = isWeb ? '-' : (property.orientation || '-');
  const developer = isWeb ? '-' : (property.developer || '-');
  const outdoorSpace = isWeb ? property.outdoorSpace : [];
  const agentName = isWeb ? property.agentName : '-';
  const agentContact = isWeb ? property.agentContact : '-';
  const refNumber = isWeb ? property.refNumber : property.id;
  const sourceUrl = isWeb ? property.sourceUrl : null;
  const sourceName = isWeb ? property.sourceDisplayName : 'Keynez Database';
  const matchScore = isWeb ? property.matchScore : (property as any).relevanceScore;
  const matchReason = isWeb ? property.rawSnippet : (property as any).matchReason;

  const handleWhatsApp = () => {
    if (agentContact && agentContact !== '-') {
      const phone = agentContact.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=Hi, I'm interested in ${name} (Ref: ${refNumber})`, '_blank');
    }
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=Inquiry: ${name}&body=Hi, I'm interested in ${name} (Ref: ${refNumber}). Please provide more details.`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-serif mb-2">{name}</DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{location || 'Hong Kong'}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {sourceName}
                    </Badge>
                  </div>
                </div>
                {matchScore && (
                  <div className="flex items-center gap-1 bg-accent/10 rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span className="text-sm font-medium text-accent">{matchScore}%</span>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Price Section */}
            <div className="bg-accent/10 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {priceType === 'rent' ? 'Monthly Rent' : 'Asking Price'}
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    {formatPrice(price, priceType)}
                  </p>
                </div>
                {size && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Price per sq.ft.
                    </p>
                    <p className="text-lg font-semibold">
                      HK${price && size ? Math.round(price / size).toLocaleString() : '-'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{bedrooms}</p>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{bathrooms}</p>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Square className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{size ? `${size}` : '-'}</p>
                <p className="text-xs text-muted-foreground">Sq. Ft.</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Layers className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{floorLevel || '-'}</p>
                <p className="text-xs text-muted-foreground">Floor Level</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Property Details */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Property Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" /> Type
                  </span>
                  <span className="font-medium">{propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Age
                  </span>
                  <span className="font-medium">{buildingAge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Compass className="h-4 w-4" /> Facing
                  </span>
                  <span className="font-medium">{orientation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Developer
                  </span>
                  <span className="font-medium">{developer}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            {features && features.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Features & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Outdoor Space */}
            {outdoorSpace && outdoorSpace.length > 0 && outdoorSpace[0] !== '-' && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Outdoor Space
                </h3>
                <div className="flex flex-wrap gap-2">
                  {outdoorSpace.map((space, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-green-500 text-green-600">
                      {space}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Match Reason / Description */}
            {matchReason && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Why This Matches
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {matchReason}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            {/* Agent Contact */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Contact Agent
              </h3>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="font-medium">{agentName}</p>
                  <p className="text-sm text-muted-foreground">{agentContact}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ref: {refNumber}</p>
                </div>
                <div className="flex gap-2">
                  {agentContact && agentContact !== '-' && (
                    <>
                      <Button size="icon" variant="outline" onClick={handleWhatsApp}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={handleEmail}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {sourceUrl && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => window.open(sourceUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Listing
                </Button>
              )}
              {onAddToCanvas && (
                <Button 
                  className="flex-1 gap-2 bg-accent hover:bg-accent/90"
                  onClick={() => {
                    onAddToCanvas(property);
                    onClose();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add to Research Canvas
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
