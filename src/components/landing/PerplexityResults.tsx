import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Lightbulb, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  ExternalLink,
  ChevronDown,
  FileText,
  Download,
  Table as TableIcon,
  Printer,
  Plus,
  MapPin,
  Check
} from "lucide-react";
import { PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { MatchQualityBadge, calculateMatchQuality, MatchQuality } from "./MatchQualityBadge";
import { cn } from "@/lib/utils";

interface PerplexityResultsProps {
  mode: 'rent' | 'buy';
  query: string;
  aiResults: (PropertyResult & { matchQuality?: MatchQuality; relevanceScore?: number })[];
  webResults: WebSearchResult[];
  extractedCriteria: {
    locations: string[];
    priceMin: number | null;
    priceMax: number | null;
    bedrooms: number[];
    features: string[];
  } | null;
  sourcesSearched: string[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick: (property: PropertyResult | WebSearchResult) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onAddToCanvas: (ids: string[]) => void;
  highlightTerms: string[];
}

interface MarketInsight {
  type: 'tip' | 'warning' | 'info';
  title: string;
  description: string;
}

interface AgentInfo {
  name: string;
  specialty: string;
  phone?: string;
  whatsapp?: string;
}

// Generate market insights based on search criteria and results
function generateMarketInsights(
  mode: 'rent' | 'buy',
  locations: string[],
  priceRange: [number | null, number | null],
  results: (PropertyResult | WebSearchResult)[]
): MarketInsight[] {
  const insights: MarketInsight[] = [];
  
  if (mode === 'rent') {
    insights.push({
      type: 'tip',
      title: 'True Open Balconies are Rare',
      description: `In the ${priceRange[0] ? `HK$${(priceRange[0]/1000).toFixed(0)}k` : ''}-${priceRange[1] ? `HK$${(priceRange[1]/1000).toFixed(0)}k` : ''} price range, fully open balconies are uncommon. Most buildings offer "utility platforms" (small enclosed spaces) rather than true outdoor living areas. Look for keywords like "open balcony" or "terrace" in listings.`
    });
    
    insights.push({
      type: 'info',
      title: 'Older Buildings Offer Better Space',
      description: `Buildings from the 1980s-1990s in ${locations.join(', ') || 'Hong Kong'} typically offer larger unit sizes per dollar compared to newer developments. Consider Healthy Gardens, Kornhill, or City Garden for better value.`
    });
    
    insights.push({
      type: 'tip',
      title: 'Platform Units',
      description: 'Look for "Low Floor with Platform" units - these often include private outdoor space at ground level that isn\'t reflected in the listed square footage. Great for pet owners or those wanting garden access.'
    });
  } else {
    insights.push({
      type: 'info',
      title: 'Price Trends',
      description: `Properties in ${locations.join(', ') || 'Hong Kong'} have seen varied performance. Premium locations like The Peak and Mid-Levels maintain value better during market corrections.`
    });
    
    insights.push({
      type: 'warning',
      title: 'Transaction Costs',
      description: 'Remember to budget for stamp duty (up to 4.25% for residents, 15% for non-residents), legal fees, and agent commission (typically 1% of purchase price).'
    });
  }
  
  if (results.length < 5) {
    insights.push({
      type: 'warning',
      title: 'Limited Inventory',
      description: 'Your search criteria returned fewer results than typical. Consider expanding your price range or looking at adjacent neighborhoods.'
    });
  }
  
  return insights;
}

// Generate agent recommendations based on location
function generateAgentRecommendations(locations: string[]): AgentInfo[] {
  const agents: AgentInfo[] = [];
  
  if (locations.some(l => l.toLowerCase().includes('north point') || l.toLowerCase().includes('fortress'))) {
    agents.push({
      name: 'Elegant Property Agency',
      specialty: 'Specializes in North Point estates like Healthy Gardens and Fortress Metro Tower',
      phone: '+852 2570 1234',
      whatsapp: '85225701234'
    });
  }
  
  if (locations.some(l => l.toLowerCase().includes('mid-levels') || l.toLowerCase().includes('central'))) {
    agents.push({
      name: 'Midland Realty Central',
      specialty: 'Luxury apartments in Mid-Levels and Central. Excellent English service.',
      phone: '+852 2526 8888',
      whatsapp: '85225268888'
    });
  }
  
  // Always add a general agent
  agents.push({
    name: 'Forever Realty H.K. Limited',
    specialty: 'Wide coverage across Hong Kong Island and Kowloon',
    phone: '+852 2545 6789'
  });
  
  return agents;
}

function formatPrice(price: number | null, mode: 'rent' | 'buy'): string {
  if (!price) return '-';
  
  if (mode === 'rent') {
    return `HK$${price.toLocaleString()}/mo`;
  }
  
  if (price >= 1000000) {
    return `HK$${(price / 1000000).toFixed(1)}M`;
  }
  return `HK$${price.toLocaleString()}`;
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
        <mark key={index} className="bg-[#FFD54F] text-foreground rounded px-0.5">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function PerplexityResults({
  mode,
  query,
  aiResults,
  webResults,
  extractedCriteria,
  sourcesSearched,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onExportCSV,
  onExportPDF,
  onAddToCanvas,
  highlightTerms,
}: PerplexityResultsProps) {
  const [sortField, setSortField] = useState<string>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Combine results
  const allResults = [...aiResults, ...webResults.map(w => ({
    id: w.id,
    name: w.buildingName,
    location: w.location,
    price: mode === 'rent' ? (w.monthlyRent || 0) : (w.salePrice || 0),
    size: w.size || 0,
    bedrooms: w.bedrooms,
    bathrooms: w.bathrooms,
    features: w.features,
    floorLevel: w.floorLevel,
    agentName: w.agentName,
    agentContact: w.agentContact,
    refNumber: w.refNumber,
    sourceUrl: w.sourceUrl,
    sourceName: w.sourceDisplayName,
    rank: 0,
    relevanceScore: w.matchScore,
    matchReason: w.rawSnippet,
  }))];
  
  const totalResults = allResults.length;
  
  // Generate summary text
  const locations = extractedCriteria?.locations || [];
  const bedrooms = extractedCriteria?.bedrooms || [];
  const priceMin = extractedCriteria?.priceMin;
  const priceMax = extractedCriteria?.priceMax;
  const features = extractedCriteria?.features || [];
  
  const summaryText = `Here are ${totalResults} ${mode === 'rent' ? 'apartments currently available for rent' : 'properties for sale'} ${locations.length > 0 ? `in ${locations.join(', ')}` : 'in Hong Kong'}${bedrooms.length > 0 ? `, with ${bedrooms.join(' or ')} bedrooms` : ''}${priceMax ? `, ${mode === 'rent' ? `$${(priceMin || 0).toLocaleString()}–$${priceMax.toLocaleString()}` : `under HK$${(priceMax / 1000000).toFixed(0)}M`}` : ''}${features.length > 0 ? `, featuring ${features.join(', ')}` : ''}.`;
  
  // Generate insights and agents
  const insights = generateMarketInsights(mode, locations, [priceMin, priceMax], allResults);
  const agents = generateAgentRecommendations(locations);
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Toggle row selection
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  
  const toggleAll = () => {
    if (selectedIds.length === allResults.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allResults.map(r => r.id));
    }
  };

  if (totalResults === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Answer Summary */}
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-base leading-relaxed text-foreground">
              {summaryText}
            </p>
            {query && (
              <p className="text-sm text-muted-foreground mt-2">
                Based on your search: "{query}"
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Export Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select rows to export'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs"
            onClick={onExportCSV}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs"
            onClick={onExportPDF}
          >
            <FileText className="h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          {selectedIds.length > 0 && (
            <Button 
              size="sm" 
              className="gap-1.5 text-xs bg-accent hover:bg-accent/90"
              onClick={() => onAddToCanvas(selectedIds)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add to Canvas ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-10 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === allResults.length && allResults.length > 0}
                    onChange={toggleAll}
                    className="rounded border-input"
                  />
                </th>
                <th className="w-10 px-2 py-3 text-center text-xs font-semibold text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Match
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  Building Name
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('price')}
                >
                  {mode === 'rent' ? 'Monthly Rent' : 'Price'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Layout
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Size
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Floor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Outdoor Space
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Agent/Contact
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Ref
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((result, index) => {
                const isWeb = 'sourceUrl' in result;
                const isSelected = selectedIds.includes(result.id);
                
                return (
                  <tr 
                    key={result.id}
                    className={cn(
                      "border-t transition-colors cursor-pointer",
                      index % 2 === 0 ? "bg-background" : "bg-[#FFFBF0]",
                      isSelected && "bg-accent/10",
                      "hover:bg-accent/5"
                    )}
                    onClick={() => onRowClick(result as any)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(result.id)}
                        className="rounded border-input"
                      />
                    </td>
                    <td className="px-2 py-3 text-center text-xs text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        // Calculate match quality from relevanceScore if available
                        const score = 'relevanceScore' in result ? result.relevanceScore : 50;
                        const quality: MatchQuality = score >= 80 ? 'perfect' : score >= 60 ? 'good' : 'partial';
                        const matchDetails = [
                          { label: `${result.bedrooms} BR`, matched: extractedCriteria?.bedrooms?.includes(parseInt(result.bedrooms as string)) ?? true },
                          { label: result.location || 'Location', matched: extractedCriteria?.locations?.some(l => result.location?.toLowerCase().includes(l.toLowerCase())) ?? true },
                          { label: 'Budget', matched: (!extractedCriteria?.priceMax || result.price <= extractedCriteria.priceMax) }
                        ];
                        return (
                          <MatchQualityBadge 
                            quality={quality} 
                            criteria={matchDetails}
                          />
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {highlightText(result.name, highlightTerms)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-base text-accent">
                        {formatPrice(result.price, mode)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{result.bedrooms} BR</span>
                      {result.bathrooms && result.bathrooms !== '-' && (
                        <span className="text-muted-foreground"> / {result.bathrooms} Ba</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result.size ? `${result.size.toLocaleString()} ft²` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {result.floorLevel || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {result.features?.filter(f => 
                          ['balcony', 'terrace', 'rooftop', 'garden', 'platform'].some(
                            keyword => f.toLowerCase().includes(keyword)
                          )
                        ).slice(0, 2).map((feature, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-[10px] border-green-500 text-green-600 bg-green-50"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {result.features?.filter(f => 
                          ['balcony', 'terrace', 'rooftop', 'garden', 'platform'].some(
                            keyword => f.toLowerCase().includes(keyword)
                          )
                        ).length === 0 && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {'agentName' in result && result.agentName !== '-' ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">{result.agentName}</div>
                          {'agentContact' in result && result.agentContact !== '-' && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                                <a href={`tel:${result.agentContact}`}>
                                  <Phone className="h-3 w-3" />
                                </a>
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                                <a href={`https://wa.me/${result.agentContact?.replace(/\D/g, '')}`} target="_blank">
                                  <MessageCircle className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {'refNumber' in result ? (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {result.refNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {result.id}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {'sourceUrl' in result && result.sourceUrl ? (
                        <a 
                          href={result.sourceUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          {'sourceName' in result ? result.sourceName : 'View'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Database
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Sections */}
      <Accordion type="multiple" defaultValue={["insights"]} className="space-y-2">
        {/* Market Insights */}
        <AccordionItem value="insights" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Market Insights
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === 'tip' && <Lightbulb className="h-4 w-4 text-amber-500" />}
                    {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {insight.type === 'info' && <Lightbulb className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {insight.type === 'tip' && '💡 '}{insight.type === 'warning' && '⚠️ '}{insight.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Agent Contact Info */}
        <AccordionItem value="agents" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              Recommended Agents ({agents.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{agent.specialty}</p>
                  </div>
                  <div className="flex gap-2">
                    {agent.phone && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                      </Button>
                    )}
                    {agent.whatsapp && (
                      <Button size="sm" className="gap-1.5 text-xs bg-green-600 hover:bg-green-700" asChild>
                        <a href={`https://wa.me/${agent.whatsapp}`} target="_blank">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sources */}
        <AccordionItem value="sources" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              Sources ({sourcesSearched.length + 1})
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Information compiled from {sourcesSearched.length + 1} sources
            </p>
            <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
              <li>KeyNest Property Database (internal)</li>
              {sourcesSearched.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
