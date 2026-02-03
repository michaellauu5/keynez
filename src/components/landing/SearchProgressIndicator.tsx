import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchSource {
  name: string;
  status: 'pending' | 'searching' | 'done' | 'error';
  resultCount?: number;
}

interface SearchProgressIndicatorProps {
  sources: SearchSource[];
  isSearching: boolean;
  totalFound: number;
  estimatedTime?: string;
  errors?: string[];
}

export function SearchProgressIndicator({
  sources,
  isSearching,
  totalFound,
  estimatedTime = "5-10 seconds",
  errors = [],
}: SearchProgressIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isSearching) {
      setElapsedSeconds(0);
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  if (!isSearching && sources.every(s => s.status === 'pending')) {
    return null;
  }

  const completedCount = sources.filter(s => s.status === 'done').length;
  const errorCount = sources.filter(s => s.status === 'error').length;
  const liveCount = sources.reduce((acc, s) => acc + (s.resultCount || 0), 0);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4 text-accent" />
          {isSearching ? (
            <span>Searching property portals...</span>
          ) : (
            <span className="text-green-600">
              ✅ Found {totalFound} listings, showing top 15
            </span>
          )}
        </div>
        {isSearching && (
          <span className="text-xs text-muted-foreground">
            {elapsedSeconds}s (typically {estimatedTime})
          </span>
        )}
      </div>

      {/* Source Progress List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sources.map((source) => (
          <div
            key={source.name}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-300",
              source.status === 'done' && "bg-green-50 text-green-700",
              source.status === 'searching' && "bg-accent/10 text-accent",
              source.status === 'error' && "bg-red-50 text-red-600",
              source.status === 'pending' && "bg-muted/50 text-muted-foreground"
            )}
          >
            {source.status === 'pending' && (
              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">○</span>
            )}
            {source.status === 'searching' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {source.status === 'done' && (
              <Check className="h-4 w-4 text-green-600" />
            )}
            {source.status === 'error' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">{source.name}</span>
            {source.status === 'done' && source.resultCount !== undefined && (
              <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
                {source.resultCount}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Live Count */}
      {isSearching && liveCount > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-accent">{liveCount}</span> results found so far...
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
