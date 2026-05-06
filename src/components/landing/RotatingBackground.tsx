import { useEffect, useState } from "react";

interface RotatingBackgroundProps {
  images: string[];
  intervalMs?: number;
}

/**
 * Fixed, full-viewport background that cross-fades between images.
 */
export function RotatingBackground({ images, intervalMs = 8000 }: RotatingBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images, intervalMs]);

  return (
    <div className="fixed inset-0 z-0">
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === activeIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
