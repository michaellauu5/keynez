import { PropertySearchChat } from "./PropertySearchChat";
import { VideoDemo } from "./VideoDemo";
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
          <p className="mx-auto mt-4 max-w-2xl text-white/90 text-shadow-lg">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="order-1">
            <PropertySearchChat />
          </div>
          <div className="order-2">
            <VideoDemo />
          </div>
        </div>
      </div>
    </section>
  );
}