import { MapPin, Construction } from "lucide-react";

export function MapView() {
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
      {/* Placeholder Map Background */}
      <div className="absolute inset-0 opacity-30">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Hong Kong Island outline (simplified) */}
          <path
            d="M100,400 Q200,350 300,380 Q400,400 500,370 Q600,340 700,380 L700,500 L100,500 Z"
            fill="hsl(var(--primary))"
            opacity="0.2"
          />
          {/* Kowloon outline */}
          <path
            d="M150,300 Q300,280 450,300 Q550,320 650,290 L650,340 Q550,360 450,340 Q300,320 150,340 Z"
            fill="hsl(var(--primary))"
            opacity="0.15"
          />
          {/* New Territories */}
          <path
            d="M50,100 Q200,80 400,120 Q600,100 750,150 L750,280 Q600,260 400,280 Q200,260 50,280 Z"
            fill="hsl(var(--primary))"
            opacity="0.1"
          />
          
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 60}
              x2="800"
              y2={i * 60}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 80}
              y1="0"
              x2={i * 80}
              y2="600"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}
        </svg>
      </div>

      {/* Sample Pin Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { x: "20%", y: "60%", label: "Central" },
          { x: "35%", y: "55%", label: "Wan Chai" },
          { x: "50%", y: "50%", label: "TST" },
          { x: "65%", y: "45%", label: "Kowloon Tong" },
          { x: "40%", y: "30%", label: "Sha Tin" },
          { x: "25%", y: "70%", label: "Happy Valley" },
        ].map((pin, i) => (
          <div
            key={i}
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{ left: pin.x, top: pin.y }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium shadow-lg mb-1">
                {pin.label}
              </div>
              <MapPin className="h-6 w-6 text-primary drop-shadow-md" fill="hsl(var(--primary))" />
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="text-center space-y-4 p-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/20">
            <Construction className="h-8 w-8 text-accent-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Interactive Map Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We're working on an interactive map view with property pins, 
            neighborhood insights, and nearby amenities.
          </p>
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Hong Kong SAR
      </div>
    </div>
  );
}
