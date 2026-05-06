import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PropertyListingsSection } from "@/components/landing/PropertyListingsSection";
import { RotatingBackground } from "@/components/landing/RotatingBackground";

// HK-specific hero images. Drop the matching files into /public.
const HERO_IMAGES = [
  "/hero-mid-levels.jpg",
  "/hero-kowloon-street.jpg",
  "/hero-hk-harbor.jpg",
];

const Index = () => {
  return (
    <Layout>
      <div className="relative min-h-screen">
        <RotatingBackground images={HERO_IMAGES} intervalMs={8000} />

        {/* Dark gradient overlay for text legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"
          style={{ position: 'fixed', zIndex: 0 }}
        />

        <div className="relative z-10">
          <HeroSection />
          <HowItWorks />
          <PropertyListingsSection />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
