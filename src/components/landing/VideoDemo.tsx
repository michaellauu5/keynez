import { useState, useRef, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";

export function VideoDemo() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPauseHint, setShowPauseHint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePauseZoneClick = () => {
    if (isPlaying) togglePlay();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Video Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-border/30">
        <AspectRatio ratio={16 / 9}>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster="/placeholder.svg"
            preload="metadata"
          >
            <source src="" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark Gradient Overlay (shown when paused) */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-dark-overlay transition-opacity duration-300",
              isPlaying ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Play Button Overlay */}
          <button
            onClick={togglePlay}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
              isPlaying && "pointer-events-none opacity-0"
            )}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl transition-transform hover:scale-110 animate-pulse-glow">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
            </div>
          </button>

          {/* Pause Zone (top-right corner) */}
          <div
            onClick={handlePauseZoneClick}
            onMouseEnter={() => isPlaying && setShowPauseHint(true)}
            onMouseLeave={() => setShowPauseHint(false)}
            className={cn(
              "absolute right-0 top-0 h-1/3 w-1/3 cursor-pointer transition-opacity",
              !isPlaying && "pointer-events-none"
            )}
          >
            <div
              className={cn(
                "absolute right-4 top-4 flex items-center gap-2 rounded-full bg-foreground/80 px-3 py-1.5 text-xs text-background transition-opacity duration-200",
                showPauseHint ? "opacity-100" : "opacity-0"
              )}
            >
              <Pause className="h-3 w-3" />
              {t("video.tapToPause")}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <Progress
              value={progress}
              className={cn(
                "h-1 transition-opacity duration-300",
                isPlaying ? "opacity-100" : "opacity-50"
              )}
            />
          </div>
        </AspectRatio>
      </div>

      {/* Caption Below */}
      <p className="mt-4 text-center text-sm text-muted-foreground lg:text-left">
        {t("video.caption")}
      </p>
    </div>
  );
}
