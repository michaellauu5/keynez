import { PropertySearchChat } from "./PropertySearchChat";
import { VideoDemo } from "./VideoDemo";
import { DummyHongKongMap } from "@/components/map/DummyHongKongMap";
import { mockProperties } from "@/data/mockProperties";
import { useTranslation } from "@/hooks/useTranslation";
import hongKongBackdrop from "@/assets/hong-kong-backdrop.jpg";

export function HeroSection() {
  const { t, language } = useTranslation();

  // Handle different title structure for Chinese vs English
  const renderTitle = () => {
    if (language === 'en') {
      return (
        <>
          {t('hero.title')}{" "}
          <span className="text-accent">{t('hero.titleAccent')}</span>
        </>
      );
    }
    // For Chinese: "在香港尋找您的理想居所"
    return (
      <>
        {t('hero.title')}
        <span className="text-accent">{t('hero.titleAccent')}</span>
        尋找您的理想居所
      </>
    );
  };

  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${hongKongBackdrop})` }}
    >
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      
      {/* Content with relative positioning */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
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
        <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-10">
          {/* Left Column: AI Chat Interface */}
          <div className="order-1">
            <PropertySearchChat />
          </div>

          {/* Right Column: Video Demo */}
          <div className="order-2">
            <VideoDemo />
          </div>
        </div>

        {/* Full Width Map - Below chat, above stats */}
        <div className="mt-8 lg:mt-12">
          <DummyHongKongMap
            properties={mockProperties}
            className="h-[400px] rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
