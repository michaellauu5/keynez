import { useState } from "react";
import { PropertySearchChat } from "./PropertySearchChat";
import { useTranslation } from "@/hooks/useTranslation";
import { useFilterSync } from "@/contexts/FilterSyncContext";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { t, language } = useTranslation();
  const { chatFilters, setChatFilters, searchMode, setSearchMode } = useFilterSync();
  const [chatActive, setChatActive] = useState(false);

  const renderTitle = () => {
    if (language === 'en') {
      return <>
        {t('hero.title')}{" "}
        <span className="text-accent">{t('hero.titleAccent')}</span>
      </>;
    }
    // Chinese: "新一代 · 智能搵樓助理"
    return <>
      {t('hero.title')}
      <span className="text-accent">{t('hero.titleAccent')}</span>
    </>;
  };

  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 text-center lg:mb-12">
          <h1 className="font-sans text-3xl font-bold text-white text-shadow-lg sm:text-4xl lg:text-5xl">
            {renderTitle()}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/90 text-shadow-lg whitespace-pre-line">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Chat Only */}
        <div
          className={cn(
            "mx-auto transition-all duration-500",
            chatActive ? "w-full lg:w-3/4 max-w-6xl" : "max-w-2xl"
          )}
        >
          <PropertySearchChat
            externalFilters={chatFilters}
            onFiltersChange={setChatFilters}
            externalSearchMode={searchMode}
            onSearchModeChange={setSearchMode}
            onActiveChange={setChatActive}
          />
        </div>
      </div>
    </section>
  );
}