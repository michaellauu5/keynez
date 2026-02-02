import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PropertyListingsSection } from "@/components/landing/PropertyListingsSection";

const Index = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PropertyListingsSection />
      </main>
    </>
  );
};

export default Index;
