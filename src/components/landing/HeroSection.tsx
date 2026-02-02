import { PropertySearchChat } from "./PropertySearchChat";
import { VideoDemo } from "./VideoDemo";

export function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 text-center lg:mb-12">
          <h1 className="font-sans text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            Find Your Perfect Property in{" "}
            <span className="text-accent">Hong Kong</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Powered by AI. Search in plain language and discover properties that match your lifestyle.
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
      </div>
    </section>
  );
}
