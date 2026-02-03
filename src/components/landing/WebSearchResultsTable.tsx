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
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface WebSearchResult {
  id: string;
  buildingName: string;
  monthlyRent: number | null;
  salePrice: number | null;
  bedrooms: string;
  bathrooms: string;
  size: number | null;
  floorLevel: string;
  outdoorSpace: string[];
  features: string[];
  agentName: string;
  agentContact: string;
  refNumber: string;
  sourceUrl: string;
  sourceName: string;
  sourceDisplayName: string;
  location: string;
  matchScore: number;
  rawSnippet: string;
}

interface WebSearchResultsTableProps {
  results: WebSearchResult[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  highlightTerms?: string[];
  onRowClick?: (result: WebSearchResult) => void;
}

type SortField = "buildingName" | "monthlyRent" | "bedrooms" | "size" | "matchScore";
type SortDirection = "asc" | "desc";

function formatRent(rent: number | null): string {
  if (rent === null) return "-";
  if (rent >= 100000) {
    return `HK$${(rent / 1000).toFixed(0)}K`;
  }
  return `HK$${rent.toLocaleString()}`;
}

function highlightText(text: string, terms: string[]): React.ReactNode {
  if (!terms || terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase());
    if (isMatch) {
      return (
        <mark key={index} className="bg-[#FFD54F]/50 text-foreground rounded px-0.5">
          {part}
        </mark>
      );
    }
    return part;
  });
}

const SOURCE_COLORS: Record<string, string> = {
  "28hse": "bg-blue-500",
  "house730": "bg-emerald-500",
  "squarefoot": "bg-purple-500",
  "spacious": "bg-orange-500",
  "oneday": "bg-pink-500",
  "midland": "bg-red-500",
  "centaline": "bg-indigo-500",
  "propertyhk": "bg-teal-500",
  "okay": "bg-cyan-500",
};

export function WebSearchResultsTable({
  results,
  selectedIds,
  onSelectionChange,
  highlightTerms = [],
  onRowClick,
}: WebSearchResultsTableProps) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("matchScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "matchScore" ? "desc" : "asc");
    }
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "buildingName":
          comparison = a.buildingName.localeCompare(b.buildingName);
          break;
        case "monthlyRent":
          comparison = (a.monthlyRent || 0) - (b.monthlyRent || 0);
          break;
        case "bedrooms":
          const aNum = a.bedrooms === "Studio" ? 0 : parseInt(a.bedrooms) || 0;
          const bNum = b.bedrooms === "Studio" ? 0 : parseInt(b.bedrooms) || 0;
          comparison = aNum - bNum;
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case "matchScore":
          comparison = a.matchScore - b.matchScore;
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
          No results found. Try a different search query.
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
            <TableHead className="min-w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("buildingName")}
              >
                Building Name
                <SortIcon field="buildingName" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("monthlyRent")}
              >
                Monthly Rent
                <SortIcon field="monthlyRent" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold"
                onClick={() => handleSort("bedrooms")}
              >
                Layout Details
                <SortIcon field="bedrooms" />
              </Button>
            </TableHead>
            <TableHead>Outdoor Space</TableHead>
            <TableHead>Agent/Contact</TableHead>
            <TableHead>Ref</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result, index) => (
            <TableRow
              key={result.id}
              className={cn(
                "transition-colors cursor-pointer",
                selectedIds.includes(result.id) && "bg-accent/10",
                onRowClick && "hover:bg-muted/70"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onRowClick?.(result)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(result.id)}
                  onCheckedChange={() => toggleOne(result.id)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {highlightText(result.buildingName, highlightTerms)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {highlightText(result.location, highlightTerms)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {formatRent(result.monthlyRent)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div>{result.bedrooms} BR</div>
                  {result.size && (
                    <div className="text-xs text-muted-foreground">
                      {result.size.toLocaleString()} sqft
                    </div>
                  )}
                  {result.floorLevel !== "-" && (
                    <div className="text-xs text-muted-foreground">
                      {result.floorLevel} Floor
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {result.outdoorSpace.map((space, i) => {
                    if (space === "-") return <span key={i}>-</span>;
                    const isHighlighted = highlightTerms.some(
                      term => space.toLowerCase().includes(term.toLowerCase())
                    );
                    return (
                      <Badge
                        key={i}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isHighlighted && "bg-[#FFD54F]/30 border-[#FFD54F]"
                        )}
                      >
                        {space}
                      </Badge>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{result.agentName}</div>
                  {result.agentContact !== "-" && (
                    <div className="text-xs text-muted-foreground">
                      {result.agentContact}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {result.refNumber}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:text-primary transition-colors"
                >
                  <Badge 
                    className={cn(
                      "text-white text-[10px]",
                      SOURCE_COLORS[result.sourceName] || "bg-gray-500"
                    )}
                  >
                    {result.sourceDisplayName}
                  </Badge>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
