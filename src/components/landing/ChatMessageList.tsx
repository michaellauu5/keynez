import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, User, ChevronRight, Loader2 } from "lucide-react";
import { ChatMessage } from "@/hooks/useConversation";
import { ChatResultsBubble } from "./ChatResultsBubble";
import { SearchProgressIndicator, SearchSource } from "./SearchProgressIndicator";
import { PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { AgentRecommendation } from "@/hooks/useWebhookSearch";
import { MatchQuality } from "./MatchQualityBadge";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export interface WebhookResultData {
  mode: "rent" | "buy";
  results: (PropertyResult & {
    matchQuality?: MatchQuality;
    relevanceScore?: number;
  })[];
  insights: string[];
  agentRecommendations: AgentRecommendation[];
  highlightTerms: string[];
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
  searchSources?: SearchSource[];
  loadingMessage?: string;
  messageResults?: Record<string, WebhookResultData>;
  onRowClick?: (property: PropertyResult | WebSearchResult) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onAddToCanvas?: () => void;
  onSearchAgain?: () => void;
}

export function ChatMessageList({ messages, suggestions, onSuggestionClick, isLoading, searchSources, loadingMessage, messageResults, onRowClick, onExportCSV, onExportPDF, onAddToCanvas, onSearchAgain }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 scroll-smooth">
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
          <div className="space-y-2">
            <Sparkles className="mx-auto h-8 w-8 text-accent/60" />
            <p>Start a conversation to search properties</p>
          </div>
        </div>
      )}

      {messages.map((message) => {
        const resultData = messageResults?.[message.id];
        const isError = message.role === "assistant" && message.content.startsWith("⚠️");
        const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        return (
          <div key={message.id} className={cn("flex animate-in gap-2 fade-in-50 slide-in-from-bottom-2 duration-300", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
            )}

            <div className="max-w-[90%]">
              <div className={cn("rounded-2xl text-sm", message.role === "user" ? "bg-accent px-4 py-2.5 text-accent-foreground" : "border border-border bg-card px-4 py-3") }>
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}

                {message.role === "assistant" && resultData && (
                  <div className="mt-3">
                    <ChatResultsBubble
                      mode={resultData.mode}
                      results={resultData.results}
                      insights={resultData.insights}
                      agentRecommendations={resultData.agentRecommendations}
                      onRowClick={onRowClick || (() => {})}
                      onExportCSV={onExportCSV || (() => {})}
                      onExportPDF={onExportPDF || (() => {})}
                      onAddToCanvas={onAddToCanvas || (() => {})}
                      onSearchAgain={onSearchAgain || (() => {})}
                      highlightTerms={resultData.highlightTerms}
                    />
                  </div>
                )}

                {message.resultCount !== undefined && !resultData && <Badge variant="secondary" className="mt-2 text-xs">{message.resultCount} properties found</Badge>}

                {isError && onSearchAgain && (
                  <Button variant="outline" size="sm" className="mt-3 rounded-full text-xs" onClick={onSearchAgain}>
                    Retry
                  </Button>
                )}
              </div>
              <p className={cn("mt-1 text-xs text-muted-foreground", message.role === "user" ? "text-right" : "text-left")}>{timestamp}</p>
            </div>

            {message.role === "user" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-center animate-in fade-in-50 duration-300">
          <div className="w-full max-w-[90%] rounded-2xl border border-border bg-card px-4 py-3">
            {searchSources ? (
              <SearchProgressIndicator sources={searchSources} isSearching={true} totalFound={0} loadingMessage={loadingMessage} estimatedTime="10-30 seconds" />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-accent-foreground" />
                <span className="animate-pulse">{loadingMessage || "Searching..."}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
        <div className="flex flex-wrap gap-2 pl-9 animate-in fade-in-50 duration-500">
          {suggestions.map((suggestion, idx) => (
            <Button key={idx} variant="outline" size="sm" className="h-8 gap-1 rounded-full text-xs" onClick={() => onSuggestionClick(suggestion)}>
              <ChevronRight className="h-3 w-3" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
