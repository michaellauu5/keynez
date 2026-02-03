import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type MatchQuality = 'perfect' | 'good' | 'partial';

interface MatchQualityBadgeProps {
  quality: MatchQuality;
  criteria?: {
    label: string;
    matched: boolean;
    value?: string;
    deviation?: string;
  }[];
  className?: string;
}

const qualityConfig = {
  perfect: {
    label: 'Perfect Match',
    emoji: '🟢',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Check,
  },
  good: {
    label: 'Good Match',
    emoji: '🟡',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: Info,
  },
  partial: {
    label: 'Partial Match',
    emoji: '🟠',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertTriangle,
  },
};

export function MatchQualityBadge({ quality, criteria, className }: MatchQualityBadgeProps) {
  const config = qualityConfig[quality];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium gap-1 px-1.5 py-0.5",
        config.color,
        className
      )}
    >
      <span>{config.emoji}</span>
      {config.label}
    </Badge>
  );

  if (!criteria || criteria.length === 0) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1.5 text-xs">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {c.matched ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
                <span className={cn(!c.matched && "text-muted-foreground")}>
                  {c.label}
                </span>
                {c.deviation && (
                  <span className="text-amber-600 text-[10px]">({c.deviation})</span>
                )}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Utility function to calculate match quality
export function calculateMatchQuality(
  property: {
    bedrooms?: number;
    price?: number;
    location?: string;
    features?: string[];
  },
  criteria: {
    bedrooms?: number[];
    priceMin?: number | null;
    priceMax?: number | null;
    locations?: string[];
    features?: string[];
  }
): { quality: MatchQuality; matchDetails: { label: string; matched: boolean; deviation?: string }[] } {
  const details: { label: string; matched: boolean; deviation?: string }[] = [];
  let matchCount = 0;
  let totalCriteria = 0;

  // Check bedrooms
  if (criteria.bedrooms && criteria.bedrooms.length > 0 && property.bedrooms !== undefined) {
    totalCriteria++;
    const matched = criteria.bedrooms.includes(property.bedrooms);
    details.push({
      label: `${property.bedrooms} BR`,
      matched,
      deviation: !matched ? `wanted ${criteria.bedrooms.join('/')} BR` : undefined,
    });
    if (matched) matchCount++;
  }

  // Check price
  if ((criteria.priceMin || criteria.priceMax) && property.price) {
    totalCriteria++;
    const inRange = (!criteria.priceMin || property.price >= criteria.priceMin) &&
                    (!criteria.priceMax || property.price <= criteria.priceMax);
    
    let deviation: string | undefined;
    if (!inRange) {
      if (criteria.priceMax && property.price > criteria.priceMax) {
        const overBy = ((property.price - criteria.priceMax) / criteria.priceMax * 100).toFixed(0);
        deviation = `${overBy}% over budget`;
      } else if (criteria.priceMin && property.price < criteria.priceMin) {
        deviation = 'below budget';
      }
    }

    details.push({
      label: 'Price',
      matched: inRange,
      deviation,
    });
    if (inRange) matchCount++;
  }

  // Check location
  if (criteria.locations && criteria.locations.length > 0 && property.location) {
    totalCriteria++;
    const matched = criteria.locations.some(
      loc => property.location?.toLowerCase().includes(loc.toLowerCase())
    );
    details.push({
      label: property.location || 'Location',
      matched,
    });
    if (matched) matchCount++;
  }

  // Check features
  if (criteria.features && criteria.features.length > 0 && property.features) {
    criteria.features.forEach(feature => {
      totalCriteria++;
      const matched = property.features?.some(
        f => f.toLowerCase().includes(feature.toLowerCase())
      ) || false;
      details.push({
        label: feature,
        matched,
      });
      if (matched) matchCount++;
    });
  }

  // Determine quality level
  let quality: MatchQuality;
  if (totalCriteria === 0 || matchCount === totalCriteria) {
    quality = 'perfect';
  } else if (matchCount >= totalCriteria * 0.7) {
    quality = 'good';
  } else {
    quality = 'partial';
  }

  return { quality, matchDetails: details };
}
