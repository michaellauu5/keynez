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
import { SUGGESTED_PROMPTS } from "@/data/suggestedPrompts";
import { useTranslation } from "@/hooks/useTranslation";
import { SlidingPromptRow } from "./SlidingPromptRow";

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
  // Loading state props
  searchSources?: SearchSource[];
  loadingMessage?: string;
  // Webhook result data keyed by message ID
  messageResults?: Record<string, WebhookResultData>;
  // Handlers for results
  onRowClick?: (property: PropertyResult | WebSearchResult) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onAddToCanvas?: () => void;
  onSearchAgain?: () => void;
}

export function ChatMessageList({
  messages,
  suggestions,
  onSuggestionClick,
  isLoading,
  searchSources,
  loadingMessage,
  messageResults,
  onRowClick,
  onExportCSV,
  onExportPDF,
  onAddToCanvas,
  onSearchAgain,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  const prompts = SUGGESTED_PROMPTS[language] ?? SUGGESTED_PROMPTS.en;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 px-3 py-4 scroll-smooth"
    >
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-start max-h-[70%] py-4 text-muted-foreground text-sm">
          <div className="text-center space-y-1 mb-3">
            <Sparkles className="h-6 w-6 mx-auto text-accent/50" />
            <p className="text-xs">Try asking…</p>
          </div>
          <div className="w-full space-y-2">
            <SlidingPromptRow
              prompts={prompts}
              startIndex={0}
              enterDelay={0}
              onClick={onSuggestionClick}
            />
            <SlidingPromptRow
              prompts={prompts}
              startIndex={5}
              enterDelay={700}
              onClick={onSuggestionClick}
            />
            <SlidingPromptRow
              prompts={prompts}
              startIndex={10}
              enterDelay={1400}
              onClick={onSuggestionClick}
            />
          </div>
        </div>
      )}

      {messages.map((message) => {
        const resultData = messageResults?.[message.id];

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {/* Assistant avatar */}
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                "rounded-2xl text-sm max-w-[90%]",
                message.role === "user"
                  ? "bg-accent text-accent-foreground px-4 py-2.5"
                  : "bg-card border border-border px-4 py-3"
              )}
            >
              {/* Text content */}
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}

              {/* Webhook results embedded in assistant message */}
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

              {/* Result count badge (for messages without full results) */}
              {message.resultCount !== undefined && !resultData && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {message.resultCount} properties found
                </Badge>
              )}

              {/* Retry button for error messages */}
              {message.role === "assistant" && message.content.startsWith("⚠️") && onSearchAgain && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs gap-1"
                  onClick={onSearchAgain}
                >
                  🔄 Retry
                </Button>
              )}
            </div>

            {/* User avatar */}
            {message.role === "user" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
        );
      })}

      {/* Loading state as system message */}
      {isLoading && (
        <div className="flex justify-center animate-in fade-in-50 duration-300">
          <div className="bg-[#F5F5DC]/50 border border-border/30 rounded-2xl px-4 py-3 max-w-[90%] w-full">
            {searchSources ? (
              <SearchProgressIndicator
                sources={searchSources}
                isSearching={true}
                totalFound={0}
                loadingMessage={loadingMessage}
                estimatedTime="10-30 seconds"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="animate-pulse">
                  {loadingMessage || "Searching..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions after last assistant message */}
      {!isLoading &&
        suggestions.length > 0 &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === "assistant" && (
          <div className="flex flex-wrap gap-2 pl-9 animate-in fade-in-50 duration-500">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 hover:bg-accent/10 hover:border-accent"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <ChevronRight className="h-3 w-3" />
                {suggestion}
              </Button>
            ))}
          </div>
        )}
    </div>
  );
}
