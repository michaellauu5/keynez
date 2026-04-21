import { Badge } from "@/components/ui/badge";
import { PropertySearchChat } from "./PropertySearchChat";
import { useTranslation } from "@/hooks/useTranslation";
import { useFilterSync } from "@/contexts/FilterSyncContext";

export function HeroSection() {
  const { t, language } = useTranslation();
  const { chatFilters, setChatFilters, searchMode, setSearchMode } = useFilterSync();

  const renderTitle = () => {
    if (language === "en") {
      return (
        <>
          {t("hero.title")} <span className="text-accent-foreground">{t("hero.titleAccent")}</span>
        </>
      );
    }

    return (
      <>
        {t("hero.title")}
        <span className="text-accent-foreground">{t("hero.titleAccent")}</span>
      </>
    );
  };

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 pb-14 pt-10 md:px-6 lg:pb-20 lg:pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="rounded-full border border-border/70 bg-background/70 px-4 py-1 text-xs text-foreground backdrop-blur-md">
              Search-first browsing
            </Badge>
            <Badge variant="secondary" className="rounded-full border border-border/70 bg-background/70 px-4 py-1 text-xs text-foreground backdrop-blur-md">
              Unified filters across buy and rent
            </Badge>
            <Badge variant="secondary" className="rounded-full border border-border/70 bg-background/70 px-4 py-1 text-xs text-foreground backdrop-blur-md">
              Hong Kong market coverage
            </Badge>
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-tight text-white text-shadow-lg sm:text-5xl lg:text-6xl">
            {renderTitle()}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-white/88 text-shadow-lg md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-md border border-white/15 bg-background/10 px-5 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-normal text-white/65">Browse</p>
              <p className="mt-2 text-sm font-medium text-white">Start with buy or rent, then narrow with compact filters.</p>
            </div>
            <div className="rounded-md border border-white/15 bg-background/10 px-5 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-normal text-white/65">Compare</p>
              <p className="mt-2 text-sm font-medium text-white">Review homes, shortlist options, and switch between grid and map.</p>
            </div>
            <div className="rounded-md border border-white/15 bg-background/10 px-5 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-normal text-white/65">Refine</p>
              <p className="mt-2 text-sm font-medium text-white">Keep the current chat behavior while improving the browsing shell.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl lg:mt-12">
          <PropertySearchChat
            externalFilters={chatFilters}
            onFiltersChange={setChatFilters}
            externalSearchMode={searchMode}
            onSearchModeChange={setSearchMode}
          />
        </div>
      </div>
    </section>
  );
}
