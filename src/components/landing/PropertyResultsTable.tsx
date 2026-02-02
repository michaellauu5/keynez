import { useState } from "react";
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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PropertyResult {
  id: string;
  name: string;
  location: string;
  price: number;
  size: number;
  bedrooms: string;
  features: string[];
}

interface PropertyResultsTableProps {
  results: PropertyResult[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

type SortField = "name" | "location" | "price" | "size" | "bedrooms";
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

export function PropertyResultsTable({
  results,
  selectedIds,
  onSelectionChange,
}: PropertyResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
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
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

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
          Search for properties to see results here
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
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("name")}
              >
                Property Name
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
                Location
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
                Price (HKD)
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
                Size (sqft)
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
                Bedrooms
                <SortIcon field="bedrooms" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[200px]">Key Features</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((property, index) => (
            <TableRow
              key={property.id}
              className={cn(
                "transition-colors",
                selectedIds.includes(property.id) && "bg-accent/10"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(property.id)}
                  onCheckedChange={() => toggleOne(property.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{property.name}</TableCell>
              <TableCell className="text-muted-foreground">{property.location}</TableCell>
              <TableCell className="font-semibold text-primary">
                {formatPrice(property.price)}
              </TableCell>
              <TableCell>{property.size.toLocaleString()}</TableCell>
              <TableCell>{property.bedrooms}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {property.features.slice(0, 3).map((feature) => (
                    <Badge
                      key={feature}
                      className={cn("text-xs", getFeatureClass(feature))}
                    >
                      {feature}
                    </Badge>
                  ))}
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
