import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// TODO: replace placeholder values with verified numbers and flip `verified` to true.
type StatDef = {
  key: string;
  value: number;
  suffix?: string;
  labelKey: string;
  verified: boolean;
  tooltipKey?: string;
};

const STATS: StatDef[] = [
  { key: "listings", value: 45000, suffix: "+", labelKey: "stats.listingsIndexed", verified: true, tooltipKey: "stats.listingsTooltip" },
  { key: "districts", value: 17, labelKey: "stats.districtsCovered", verified: true },
  { key: "sources", value: 0, labelKey: "stats.dataSources", verified: false },
  { key: "speed", value: 0, suffix: "s", labelKey: "stats.firstMatch", verified: false },
];

function StatItem({ stat, isVisible }: { stat: StatDef; isVisible: boolean }) {
  const { t } = useTranslation();
  const animated = useAnimatedCounter({
    end: stat.value,
    duration: 2000,
    enabled: isVisible && stat.verified,
  });

  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="flex items-baseline gap-1">
        {stat.verified ? (
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {animated.toLocaleString()}
            {stat.suffix ?? ""}
          </p>
        ) : (
          <p
            className={
              stat.key === "sources" || stat.key === "speed"
                ? "text-base md:text-lg font-semibold tracking-tight text-muted-foreground italic"
                : "text-2xl md:text-3xl font-semibold tracking-tight text-muted-foreground italic"
            }
          >
            {t("stats.comingSoon")}
          </p>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <p className="text-sm md:text-base text-muted-foreground">
          {t(stat.labelKey)}
        </p>
        {stat.tooltipKey && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t(stat.tooltipKey)}
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{t(stat.tooltipKey)}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function StatCounter() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="py-10 md:py-14 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container px-4">
        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {STATS.map((stat) => (
              <StatItem key={stat.key} stat={stat} isVisible={isVisible} />
            ))}
          </div>
        </TooltipProvider>
        <p className="mt-8 text-center text-xs md:text-sm text-muted-foreground/80">
          {t("stats.dataSourcedFrom")}
        </p>
      </div>
    </div>
  );
}