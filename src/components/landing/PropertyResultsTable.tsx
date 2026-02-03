import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface PropertyResult {
  id: string;
  name: string;
  location: string;
  price: number;
  size: number;
  bedrooms: string;
  bathrooms?: string;
  propertyType?: string;
  floorLevel?: string;
  buildingAge?: string;
  orientation?: string;
  developer?: string;
  features: string[];
  rank?: number;
  relevanceScore?: number;
  matchReason?: string;
}

interface PropertyResultsTableProps {
  results: PropertyResult[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  highlightTerms?: string[];
  onRowClick?: (property: PropertyResult) => void;
}

type SortField = "rank" | "name" | "location" | "price" | "size" | "bedrooms" | "relevanceScore";
type SortDirection = "asc" | "desc";

const FEATURE_COLORS: Record<string, string> = {
  "Sea View": "bg-feature-sea-view text-white",
  "New Build": "bg-feature-new-build text-white",
  "Pet Friendly": "bg-feature-pet-friendly text-white",
  "Garden": "bg-feature-garden text-white",
  "Parking": "bg-feature-parking text-white",
  "Gym": "bg-feature-gym text-white",
  "Pool": "bg-blue-500 text-white",
  "Balcony": "bg-amber-500 text-white",
  "Rooftop": "bg-orange-500 text-white",
  "Renovated": "bg-emerald-600 text-white",
  "Mountain View": "bg-slate-600 text-white",
  "City View": "bg-zinc-600 text-white",
};

function getFeatureClass(feature: string): string {
  return FEATURE_COLORS[feature] || "bg-muted text-muted-foreground";
}

function formatPrice(price: number): string {
  if (price >= 100000000) {
    return `HK$${(price / 100000000).toFixed(1)}億`;
  }
  if (price >= 10000000) {
    return `HK$${(price / 10000000).toFixed(1)}千萬`;
  }
  return `HK$${(price / 1000000).toFixed(1)}M`;
}

// Highlight matching terms in text
function highlightText(text: string, terms: string[]): React.ReactNode {
  if (!terms || terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase());
    if (isMatch) {
      return (
        <mark key={index} className="bg-accent/30 text-accent-foreground rounded px-0.5">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function PropertyResultsTable({
  results,
  selectedIds,
  onSelectionChange,
  highlightTerms = [],
  onRowClick,
}: PropertyResultsTableProps) {
  const { t } = useTranslation();
  const hasRanking = results.some(r => r.rank !== undefined);
  const [sortField, setSortField] = useState<SortField>(hasRanking ? "rank" : "price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "relevanceScore" ? "desc" : "asc");
    }
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "rank":
          comparison = (a.rank || 999) - (b.rank || 999);
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "bedrooms":
          comparison = a.bedrooms.localeCompare(b.bedrooms);
          break;
        case "relevanceScore":
          comparison = (a.relevanceScore || 0) - (b.relevanceScore || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [results, sortField, sortDirection]);

  const toggleAll = () => {
    if (selectedIds.length === results.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(results.map((r) => r.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  if (results.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {t('search.emptyState')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-10">
              <Checkbox
                checked={selectedIds.length === results.length && results.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            {hasRanking && (
              <TableHead className="w-14">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-xs font-semibold"
                  onClick={() => handleSort("rank")}
                >
                  #
                  <SortIcon field="rank" />
                </Button>
              </TableHead>
            )}
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("name")}
              >
                {t('table.propertyName')}
                <SortIcon field="name" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("location")}
              >
                {t('table.location')}
                <SortIcon field="location" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("price")}
              >
                {t('table.priceHKD')}
                <SortIcon field="price" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("size")}
              >
                {t('table.sizeSqft')}
                <SortIcon field="size" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("bedrooms")}
              >
                {t('table.bedrooms')}
                <SortIcon field="bedrooms" />
              </Button>
            </TableHead>
            {hasRanking && (
              <TableHead className="w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-xs font-semibold"
                  onClick={() => handleSort("relevanceScore")}
                >
                  {t('table.match')}
                  <SortIcon field="relevanceScore" />
                </Button>
              </TableHead>
            )}
            <TableHead className="min-w-[200px]">{t('table.keyFeatures')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((property, index) => (
            <TableRow
              key={property.id}
              className={cn(
                "transition-colors cursor-pointer",
                selectedIds.includes(property.id) && "bg-accent/10",
                onRowClick && "hover:bg-muted/70"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onRowClick?.(property)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(property.id)}
                  onCheckedChange={() => toggleOne(property.id)}
                />
              </TableCell>
              {hasRanking && (
                <TableCell>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {property.rank}
                  </div>
                </TableCell>
              )}
              <TableCell className="font-medium">
                {highlightText(property.name, highlightTerms)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {highlightText(property.location, highlightTerms)}
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {formatPrice(property.price)}
              </TableCell>
              <TableCell>{property.size.toLocaleString()}</TableCell>
              <TableCell>{property.bedrooms}</TableCell>
              {hasRanking && (
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Progress 
                        value={property.relevanceScore || 0} 
                        className="h-1.5 w-16" 
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {property.relevanceScore}%
                      </span>
                    </div>
                    {property.matchReason && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={property.matchReason}>
                        {property.matchReason}
                      </p>
                    )}
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {property.features.slice(0, 3).map((feature) => {
                    const isHighlighted = highlightTerms.some(
                      term => feature.toLowerCase().includes(term.toLowerCase())
                    );
                    return (
                      <Badge
                        key={feature}
                        className={cn(
                          "text-xs",
                          getFeatureClass(feature),
                          isHighlighted && "ring-2 ring-accent ring-offset-1"
                        )}
                      >
                        {feature}
                      </Badge>
                    );
                  })}
                  {property.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.features.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
