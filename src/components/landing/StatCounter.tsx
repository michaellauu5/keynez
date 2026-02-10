import { useEffect, useRef, useState } from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useTranslation } from "@/hooks/useTranslation";
interface StatCounterProps {
  value?: number;
}
export function StatCounter({
  value = 45000
}: StatCounterProps) {
  const {
    t
  } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      threshold: 0.3
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const animatedValue = useAnimatedCounter({
    end: value,
    duration: 2000,
    enabled: isVisible
  });
  const formattedValue = animatedValue.toLocaleString();
  return <div ref={containerRef} className="py-12 md:py-16 text-center bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4">
        <div className="inline-block">
          <p className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary-foreground" aria-label={`${value.toLocaleString()} plus ${t('stats.activeListings')}`}>
            {formattedValue}+
          </p>
          <div className="mt-2 h-1 w-full bg-accent rounded-full" />
        </div>
        <p className="mt-4 text-xl md:text-2xl text-muted-foreground font-medium">
          {t('stats.activeListings')}
        </p>
      </div>
    </div>;
}