import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/landing/HeroSection";
import { PropertyListingsSection } from "@/components/landing/PropertyListingsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PropertyListingsSection />
    </Layout>
  );
};

export default Index;
