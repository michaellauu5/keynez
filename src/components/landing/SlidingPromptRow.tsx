import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SlidingPromptRowProps {
  prompts: string[];
  startIndex: number;
  enterDelay: number;
  holdMs?: number;
  exitMs?: number;
  onClick: (prompt: string) => void;
}

export function SlidingPromptRow({
  prompts,
  startIndex,
  enterDelay,
  holdMs = 3000,
  exitMs = 600,
  onClick,
}: SlidingPromptRowProps) {
  const [index, setIndex] = useState(startIndex);
  const [phase, setPhase] = useState<"waiting" | "in" | "out">("waiting");

  useEffect(() => {
    setIndex(startIndex % Math.max(prompts.length, 1));
  }, [prompts, startIndex]);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    const cycle = () => {
      setPhase("in");
      timers.push(
        setTimeout(() => {
          setPhase("out");
          timers.push(
            setTimeout(() => {
              setIndex((i) => (i + 1) % Math.max(prompts.length, 1));
              setPhase("waiting");
              timers.push(setTimeout(cycle, 50));
            }, exitMs)
          );
        }, 500 + holdMs)
      );
    };

    timers.push(setTimeout(cycle, enterDelay));

    return () => {
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts, enterDelay, holdMs, exitMs]);

  if (prompts.length === 0) return <div className="h-9" />;

  const prompt = prompts[index];

  return (
    <div className="overflow-hidden flex justify-center h-9">
      {phase !== "waiting" && (
        <button
          type="button"
          onClick={() => onClick(prompt)}
          className={cn(
            "px-4 py-1.5 rounded-full bg-card border border-border shadow-sm text-xs text-foreground/80 hover:bg-accent/10 hover:border-accent transition-colors max-w-full truncate",
            phase === "in" && "animate-prompt-in",
            phase === "out" && "animate-prompt-out"
          )}
        >
          {prompt}
        </button>
      )}
    </div>
  );
}