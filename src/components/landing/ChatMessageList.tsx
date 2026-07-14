import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, User, ChevronRight, Loader2, AlertCircle, Check } from "lucide-react";
import { ChatMessage } from "@/hooks/useConversation";
import { ChatResultsBubble } from "./ChatResultsBubble";
import { SearchProgressIndicator, SearchSource } from "./SearchProgressIndicator";
import { PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { AgentRecommendation } from "@/hooks/useWebhookSearch";
import { MatchQuality } from "./MatchQualityBadge";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SUGGESTED_PROMPTS } from "@/data/suggestedPrompts";
import { useTranslation } from "@/hooks/useTranslation";
import { SlidingPromptRow } from "./SlidingPromptRow";
import { RecommendationsView, RecommendationsPayload } from "./RecommendationsView";

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

export interface ToolStatus {
  /** Current label to animate (e.g. "正在搜尋盤源指數…"). Empty string when idle. */
  current: string;
  /** Completed step summaries (rendered muted with a check). */
  completed: string[];
  /** Optional error message to render inline in the status area. */
  error?: string | null;
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
  // Agent recommendations keyed by assistant message ID
  messageRecommendations?: Record<string, RecommendationsPayload>;
  // Live tool status to render during streaming
  toolStatus?: ToolStatus;
  // Live streaming assistant token accumulator (for autoscroll deps)
  streamingContent?: string;
  // Retry the last user turn (used by error blocks)
  onRetry?: () => void;
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
  messageRecommendations,
  toolStatus,
  streamingContent,
  onRetry,
  onRowClick,
  onExportCSV,
  onExportPDF,
  onAddToCanvas,
  onSearchAgain,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  const prompts = SUGGESTED_PROMPTS[language] ?? SUGGESTED_PROMPTS.en;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [
    messages,
    isLoading,
    streamingContent,
    toolStatus?.current,
    toolStatus?.completed?.length,
  ]);

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
            <p className="text-xs">{t('chat.empty.tryAsking')}</p>
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
        const recData = messageRecommendations?.[message.id];
        const isError = message.role === "assistant" && message.content.startsWith("⚠️");

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
                  : cn(
                      "bg-card border border-border px-4 py-3",
                      isError && "border-destructive/40 bg-destructive/5"
                    )
              )}
            >
              {/* Text content */}
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
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
                      table: ({ children }) => (
                        <div className="my-2 overflow-x-auto">
                          <table className="min-w-full border-collapse text-xs">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted/50">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border px-2 py-1 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-2 py-1 align-top">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}

              {/* Agent recommendations rendered inline */}
              {message.role === "assistant" && recData && (
                <div className="mt-3">
                  <RecommendationsView payload={recData} />
                </div>
              )}

              {/* Webhook results embedded in assistant message */}
              {message.role === "assistant" && resultData && !recData && (
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
              {isError && (onRetry || onSearchAgain) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={onRetry ?? onSearchAgain}
                >
                  {t("chat.retry")}
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
        <div className="flex gap-2 animate-in fade-in-50 duration-300">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-1">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="flex-1 space-y-1.5 pt-1">
            {toolStatus?.current ? (
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                <span className="animate-pulse">{toolStatus.current}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                <span className="animate-pulse">{loadingMessage || t("chat.status.default")}</span>
              </div>
            )}
            {toolStatus?.completed?.map((line, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5 animate-in fade-in slide-in-from-left-1 duration-300"
              >
                <Check className="h-3 w-3 text-emerald-500" />
                <span>{line}</span>
              </div>
            ))}
            {toolStatus?.error && (
              <div className="flex items-center gap-1.5 text-xs text-destructive pl-5">
                <AlertCircle className="h-3 w-3" />
                <span>{toolStatus.error}</span>
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
