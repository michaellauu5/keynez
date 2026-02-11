import { PropertySearchChat } from "./PropertySearchChat";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
  const { t, language } = useTranslation();

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
        <div className="mx-auto max-w-2xl">
          <PropertySearchChat />
        </div>
      </div>
    </section>
  );
}