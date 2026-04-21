import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/landing/HeroSection";
import { PropertyListingsSection } from "@/components/landing/PropertyListingsSection";
import { FilterSyncProvider } from "@/contexts/FilterSyncContext";
import heroLivingRoom from "@/assets/hero-living-room.png";

const Index = () => {
  return (
    <Layout>
      <FilterSyncProvider>
        <div
          className="relative min-h-screen"
          style={{
            backgroundImage: `url(${heroLivingRoom})`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-background" style={{ position: "fixed", zIndex: 0 }} />
          <div className="relative z-10">
            <HeroSection />
            <PropertyListingsSection />
          </div>
        </div>
      </FilterSyncProvider>
    </Layout>
  );
};

export default Index;
