import { useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, User, ChevronRight } from "lucide-react";
import { ChatMessage } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ChatMessageListProps {
  messages: ChatMessage[];
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
}

export function ChatMessageList({ 
  messages, 
  suggestions, 
  onSuggestionClick,
  isLoading 
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div 
      ref={scrollRef}
      className="max-h-[300px] overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
          )}
          
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
              message.role === 'user'
                ? "bg-accent text-accent-foreground"
                : "bg-muted"
            )}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
            
            {message.resultCount !== undefined && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {message.resultCount} properties found
              </Badge>
            )}
          </div>
          
          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      ))}
      
      {/* Suggestions after last assistant message */}
      {!isLoading && suggestions.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
        <div className="flex flex-wrap gap-2 pl-11 animate-in fade-in-50 duration-500">
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
