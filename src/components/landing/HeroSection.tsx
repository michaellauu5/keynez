import { PropertySearchChat } from "./PropertySearchChat";
import { VideoDemo } from "./VideoDemo";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const { t, language } = useTranslation();

  const renderTitle = () => {
    if (language === 'en') {
      return (
        <>
          {t('hero.title')}{" "}
          <span className="text-accent">{t('hero.titleAccent')}</span>
        </>
      );
    }
    return (
      <>
        {t('hero.title')}
        <span className="text-accent">{t('hero.titleAccent')}</span>
        尋找您的理想居所
      </>
    );
  };

  return (
    <>
      {/* Hero Banner - Full Viewport */}
      <section className="relative min-h-[100vh] flex items-center justify-center bg-gradient-hero">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
            {renderTitle()}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10">
            <a
              href="#search"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full text-base font-medium hover:bg-accent/90 transition-all duration-200 btn-glow hover:scale-105"
            >
              Start Searching
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Chatbot + Video Section */}
      <section id="search" className="bg-card py-section lg:py-section-lg">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left: Chatbot */}
            <div className="order-1">
              <PropertySearchChat />
            </div>

            {/* Right: Video Demo */}
            <div className="order-2 lg:sticky lg:top-28">
              <VideoDemo />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
