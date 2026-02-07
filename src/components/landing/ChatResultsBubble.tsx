import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  TableIcon,
  FileText,
  Palette,
  RefreshCw,
  Lightbulb,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Eye,
} from "lucide-react";
import { PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { MatchQualityBadge, MatchQuality } from "./MatchQualityBadge";
import { AgentRecommendation } from "@/hooks/useWebhookSearch";
import { cn } from "@/lib/utils";

interface ChatResultsBubbleProps {
  mode: "rent" | "buy";
  results: (PropertyResult & {
    matchQuality?: MatchQuality;
    relevanceScore?: number;
  })[];
  insights: string[];
  agentRecommendations: AgentRecommendation[];
  onRowClick: (property: PropertyResult | WebSearchResult) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onAddToCanvas: () => void;
  onSearchAgain: () => void;
  highlightTerms: string[];
}

function formatPrice(price: number | null, mode: "rent" | "buy"): string {
  if (!price) return "-";
  if (mode === "rent") return `HK$${price.toLocaleString()}/mo`;
  if (price >= 1000000) return `HK$${(price / 1000000).toFixed(1)}M`;
  return `HK$${price.toLocaleString()}`;
}

function highlightText(
  text: string,
  terms: string[]
): React.ReactNode {
  if (!terms || terms.length === 0) return text;
  const regex = new RegExp(
    `(${terms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, index) => {
    const isMatch = terms.some(
      (term) => part.toLowerCase() === term.toLowerCase()
    );
    if (isMatch) {
      return (
        <mark
          key={index}
          className="bg-accent/30 text-foreground rounded px-0.5"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function ChatResultsBubble({
  mode,
  results,
  insights,
  agentRecommendations,
  onRowClick,
  onExportCSV,
  onExportPDF,
  onAddToCanvas,
  onSearchAgain,
  highlightTerms,
}: ChatResultsBubbleProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Compact Results Table */}
      <div className="overflow-hidden rounded-lg border border-border/50">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/80 backdrop-blur-sm">
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-muted-foreground w-8">
                  #
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                  Match
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-muted-foreground">
                  Building Name
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold text-muted-foreground">
                  {mode === "rent" ? "Rent" : "Price"}
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                  Layout
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-muted-foreground">
                  Features
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-muted-foreground">
                  Agent
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const score =
                  "relevanceScore" in result ? result.relevanceScore : 50;
                const quality: MatchQuality =
                  (score || 50) >= 80
                    ? "perfect"
                    : (score || 50) >= 60
                    ? "good"
                    : "partial";

                return (
                  <tr
                    key={result.id}
                    className={cn(
                      "border-t border-border/30 transition-colors cursor-pointer",
                      index % 2 === 0 ? "bg-background" : "bg-[#FAFAF8]",
                      "hover:bg-accent/5"
                    )}
                    onClick={() => onRowClick(result as any)}
                  >
                    <td className="px-2 py-2 text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2">
                      <MatchQualityBadge
                        quality={quality}
                        criteria={[]}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="font-medium text-foreground text-xs">
                        {highlightText(result.name, highlightTerms)}
                      </div>
                      {result.location && (
                        <div className="text-[10px] text-muted-foreground">
                          {result.location}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span className="font-bold text-xs text-accent">
                        {formatPrice(result.price, mode)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-[11px]">
                      <span className="font-medium">{result.bedrooms}BR</span>
                      {result.bathrooms && result.bathrooms !== "-" && (
                        <span className="text-muted-foreground">
                          /{result.bathrooms}Ba
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-0.5">
                        {result.features?.slice(0, 2).map((f, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[9px] px-1 py-0 h-4"
                          >
                            {f}
                          </Badge>
                        ))}
                        {(!result.features || result.features.length === 0) && (
                          <span className="text-[10px] text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {"agentName" in result && (result as any).agentName !== "-" ? (
                        <span className="text-[11px]">{String((result as any).agentName)}</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          -
                        </span>
                      )}
                    </td>
                    <td
                      className="px-2 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onRowClick(result as any)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5"
          onClick={onExportCSV}
        >
          <TableIcon className="h-3 w-3" />
          📊 Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5"
          onClick={onExportPDF}
        >
          <FileText className="h-3 w-3" />
          📄 Export PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5"
          onClick={onAddToCanvas}
        >
          <Palette className="h-3 w-3" />
          🎨 Send to Canvas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5"
          onClick={onSearchAgain}
        >
          <RefreshCw className="h-3 w-3" />
          🔄 Search Again
        </Button>
      </div>

      {/* Collapsible Insights */}
      {insights.length > 0 && (
        <Accordion type="multiple" className="space-y-1">
          <AccordionItem
            value="insights"
            className="border rounded-lg bg-muted/30"
          >
            <AccordionTrigger className="px-3 py-2 text-xs font-semibold hover:no-underline">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                💡 Market Insights
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <ul className="space-y-2">
                {(insights as string[]).map((insight: string, index: number) => (
                  <li
                    key={index}
                    className="text-xs text-muted-foreground flex gap-2"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{String(insight)}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Agent Recommendations */}
          {agentRecommendations.length > 0 && (
            <AccordionItem
              value="agents"
              className="border rounded-lg bg-muted/30"
            >
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold hover:no-underline">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-green-500" />
                  👤 Recommended Agents ({agentRecommendations.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
                  {agentRecommendations.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-2 bg-background rounded-md border border-border/40"
                    >
                      <div>
                        <p className="font-medium text-xs text-foreground">
                          {agent.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {agent.specialization}
                        </p>
                      </div>
                      {agent.contact && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] gap-1 px-2"
                            asChild
                          >
                            <a href={`tel:${agent.contact}`}>
                              <Phone className="h-3 w-3" />
                              Call
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1 px-2 bg-green-600 hover:bg-green-700"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${agent.contact.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
}
