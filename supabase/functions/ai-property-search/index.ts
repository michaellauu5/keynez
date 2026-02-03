import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock properties for matching (in production, this would come from a database)
const MOCK_PROPERTIES = [
  { id: "1", name: "The Cullinan Tower 21", location: "West Kowloon", district: "Tsim Sha Tsui", price: 85000000, size: 1250, bedrooms: 3, bathrooms: 2, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<5 years", orientation: "South", developer: "Sun Hung Kai", features: ["Sea View", "New Build", "Gym"] },
  { id: "2", name: "One Island South", location: "Wong Chuk Hang", district: "Wong Chuk Hang", price: 42000000, size: 890, bedrooms: 2, bathrooms: 2, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "<10 years", orientation: "East", developer: "Swire Properties", features: ["Mountain View", "Pet Friendly", "Pool"] },
  { id: "3", name: "Mount Nicholson", location: "The Peak", district: "The Peak", price: 280000000, size: 3200, bedrooms: 5, bathrooms: 4, propertyType: "House", floorLevel: "Low (1-10)", buildingAge: "<5 years", orientation: "South", developer: "Wheelock", features: ["Sea View", "Garden", "Parking"] },
  { id: "4", name: "The Pavilia Hill", location: "North Point", district: "North Point", price: 35000000, size: 720, bedrooms: 2, bathrooms: 1, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<10 years", orientation: "East", developer: "New World Development", features: ["City View", "Renovated", "Gym"] },
  { id: "5", name: "Larvotto", location: "Ap Lei Chau", district: "Ap Lei Chau", price: 58000000, size: 1100, bedrooms: 3, bathrooms: 2, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "<10 years", orientation: "West", developer: "Cheung Kong", features: ["Sea View", "Balcony", "Pool"] },
  { id: "6", name: "Victoria Peak House", location: "The Peak", district: "The Peak", price: 450000000, size: 5500, bedrooms: 5, bathrooms: 5, propertyType: "House", floorLevel: "Low (1-10)", buildingAge: "<20 years", orientation: "South", developer: "Henderson Land", features: ["Sea View", "Garden", "Rooftop"] },
  { id: "7", name: "The Austin", location: "West Kowloon", district: "Tsim Sha Tsui", price: 25000000, size: 550, bedrooms: 1, bathrooms: 1, propertyType: "Studio", floorLevel: "Ultra High (40+)", buildingAge: "New Build", orientation: "North", developer: "Sun Hung Kai", features: ["City View", "New Build", "Gym"] },
  { id: "8", name: "Ultima", location: "Ho Man Tin", district: "Ho Man Tin", price: 120000000, size: 2100, bedrooms: 4, bathrooms: 3, propertyType: "Penthouse", floorLevel: "Ultra High (40+)", buildingAge: "<5 years", orientation: "South", developer: "Sino Land", features: ["Mountain View", "Pool", "Parking"] },
  { id: "9", name: "Grand Mayfair", location: "Mid-Levels", district: "Mid-Levels", price: 68000000, size: 1400, bedrooms: 3, bathrooms: 2, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<20 years", orientation: "West", developer: "Henderson Land", features: ["City View", "Pet Friendly", "Renovated"] },
  { id: "10", name: "Bel-Air Peak", location: "Pokfulam", district: "Pokfulam", price: 95000000, size: 1800, bedrooms: 4, bathrooms: 3, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "<10 years", orientation: "South", developer: "Kerry Properties", features: ["Sea View", "Garden", "Parking"] },
  { id: "11", name: "The Morgan", location: "Sheung Wan", district: "Sheung Wan", price: 32000000, size: 680, bedrooms: 2, bathrooms: 1, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<5 years", orientation: "North", developer: "Cheung Kong", features: ["City View", "Renovated", "Rooftop"] },
  { id: "12", name: "Park Mediterranean", location: "Ma On Shan", district: "Ma On Shan", price: 15000000, size: 620, bedrooms: 2, bathrooms: 1, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "New Build", orientation: "East", developer: "New World Development", features: ["Mountain View", "New Build", "Pool"] },
  { id: "13", name: "Kadooria Hill", location: "Ho Man Tin", district: "Ho Man Tin", price: 78000000, size: 1550, bedrooms: 3, bathrooms: 2, propertyType: "Apartment", floorLevel: "Low (1-10)", buildingAge: "<20 years", orientation: "South", developer: "Sino Land", features: ["Garden", "Pet Friendly", "Parking"] },
  { id: "14", name: "Repulse Bay Apartments", location: "Repulse Bay", district: "Repulse Bay", price: 145000000, size: 2400, bedrooms: 4, bathrooms: 3, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<10 years", orientation: "South", developer: "Wharf Holdings", features: ["Sea View", "Balcony", "Pool"] },
  { id: "15", name: "Island Crest", location: "Sai Ying Pun", district: "Sai Ying Pun", price: 22000000, size: 480, bedrooms: 1, bathrooms: 1, propertyType: "Studio", floorLevel: "Mid (11-25)", buildingAge: "<5 years", orientation: "West", developer: "Cheung Kong", features: ["City View", "Gym", "Renovated"] },
  { id: "16", name: "Dynasty Court", location: "Mid-Levels", district: "Mid-Levels", price: 55000000, size: 1200, bedrooms: 3, bathrooms: 2, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<20 years", orientation: "East", developer: "Henderson Land", features: ["Sea View", "Pool", "Gym"] },
  { id: "17", name: "Pacific View", location: "Tai Tam", district: "Tai Tam", price: 88000000, size: 1650, bedrooms: 4, bathrooms: 3, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "<10 years", orientation: "South", developer: "Swire Properties", features: ["Sea View", "Pet Friendly", "Garden"] },
  { id: "18", name: "The Belcher's", location: "Kennedy Town", district: "Kennedy Town", price: 28000000, size: 750, bedrooms: 2, bathrooms: 1, propertyType: "Apartment", floorLevel: "High (26-40)", buildingAge: "<20 years", orientation: "West", developer: "Cheung Kong", features: ["Sea View", "Pool", "Gym"] },
  { id: "19", name: "Tregunter Tower", location: "Mid-Levels", district: "Mid-Levels", price: 150000000, size: 2800, bedrooms: 4, bathrooms: 4, propertyType: "Penthouse", floorLevel: "Ultra High (40+)", buildingAge: "<20 years", orientation: "South", developer: "Swire Properties", features: ["Mountain View", "Garden", "Parking"] },
  { id: "20", name: "The Hermitage", location: "Tai Kok Tsui", district: "Tai Kok Tsui", price: 18000000, size: 520, bedrooms: 2, bathrooms: 1, propertyType: "Apartment", floorLevel: "Mid (11-25)", buildingAge: "New Build", orientation: "North", developer: "Sun Hung Kai", features: ["City View", "New Build", "Pool"] },
];

interface ExtractedCriteria {
  locations: string[];
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: string[];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
  features: string[];
  specialRequirements: string;
}

interface FilterState {
  propertyTypes: string[];
  priceRange: [number, number];
  locations: string[];
  bedrooms: string[];
  bathrooms: string[];
  sizeRange: [number, number];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json() as { query?: string; filters?: FilterState };
    const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Prefer Qwen API if available, otherwise fall back to Lovable AI Gateway
    const useQwen = !!QWEN_API_KEY;
    const apiKey = useQwen ? QWEN_API_KEY : LOVABLE_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key configured (QWEN_API_KEY or LOVABLE_API_KEY)");
    }

    console.log("Processing search query:", query);
    console.log("Applied filters:", filters);
    console.log("Using API:", useQwen ? "Qwen" : "Lovable AI Gateway");

    // Build extraction prompt
    const extractionPrompt = `You are a Hong Kong property search assistant. Analyze the user's search query and extract structured property search criteria.

User query: "${query || "No specific query, use filters only"}"

Extract the following criteria and return as JSON:
{
  "locations": ["array of Hong Kong district names mentioned, e.g., 'Mid-Levels', 'The Peak', 'Kowloon'"],
  "priceMin": number or null (in HKD, convert millions to full number e.g., "50 million" = 50000000),
  "priceMax": number or null (in HKD),
  "sizeMin": number or null (in sqft),
  "sizeMax": number or null (in sqft),
  "bedrooms": [array of bedroom counts as numbers, e.g., [3] for "3 bedroom"],
  "bathrooms": [array of bathroom counts as numbers],
  "propertyTypes": ["Apartment", "House", "Studio", "Penthouse", "Commercial"],
  "floorLevels": ["Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"],
  "buildingAge": ["New Build", "<5 years", "<10 years", "<20 years", "20+ years"],
  "orientations": ["North", "South", "East", "West"],
  "developers": ["developer names mentioned"],
  "features": ["array of features mentioned, e.g., 'sea view', 'pool', 'gym', 'parking', 'garden', 'pet friendly'"],
  "specialRequirements": "any other specific requirements mentioned"
}

Common Hong Kong districts: Central, Mid-Levels, The Peak, Wan Chai, Causeway Bay, Happy Valley, Repulse Bay, Tsim Sha Tsui, Mong Kok, Kowloon Tong, Ho Man Tin, Hung Hom, Sha Tin, Tai Po, Sai Kung, Ma On Shan

Return ONLY valid JSON, no markdown or explanation.`;

    let aiContent = "{}";
    
    if (useQwen) {
      // Call Qwen API (DashScope)
      const qwenResponse = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are a property search criteria extraction assistant. Return only valid JSON." },
            { role: "user", content: extractionPrompt },
          ],
        }),
      });

      if (!qwenResponse.ok) {
        const errorText = await qwenResponse.text();
        console.error("Qwen API error:", qwenResponse.status, errorText);
        throw new Error(`Qwen API error: ${qwenResponse.status}`);
      }

      const qwenData = await qwenResponse.json();
      aiContent = qwenData.choices?.[0]?.message?.content || "{}";
    } else {
      // Call Lovable AI Gateway
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a property search criteria extraction assistant. Return only valid JSON." },
            { role: "user", content: extractionPrompt },
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await aiResponse.text();
        console.error("AI Gateway error:", aiResponse.status, errorText);
        throw new Error(`AI Gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      aiContent = aiData.choices?.[0]?.message?.content || "{}";
    }

    // Parse AI response
    let extractedCriteria: ExtractedCriteria;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?|\n?```/g, "").trim();
      extractedCriteria = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      extractedCriteria = {
        locations: [],
        priceMin: null,
        priceMax: null,
        sizeMin: null,
        sizeMax: null,
        bedrooms: [],
        bathrooms: [],
        propertyTypes: [],
        floorLevels: [],
        buildingAge: [],
        orientations: [],
        developers: [],
        features: [],
        specialRequirements: "",
      };
    }

    // Merge with provided filters - filters take priority
    if (filters) {
      // Price range from filters
      if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000000)) {
        extractedCriteria.priceMin = filters.priceRange[0] || extractedCriteria.priceMin;
        extractedCriteria.priceMax = filters.priceRange[1] || extractedCriteria.priceMax;
      }
      
      // Size range from filters
      if (filters.sizeRange && (filters.sizeRange[0] > 0 || filters.sizeRange[1] < 5000)) {
        extractedCriteria.sizeMin = filters.sizeRange[0] || extractedCriteria.sizeMin;
        extractedCriteria.sizeMax = filters.sizeRange[1] || extractedCriteria.sizeMax;
      }
      
      // Bedrooms from filters
      if (filters.bedrooms?.length > 0) {
        const bedroomNumbers = filters.bedrooms.map((b: string) => {
          if (b === "Studio") return 0;
          if (b === "5+") return 5;
          return parseInt(b) || 0;
        });
        extractedCriteria.bedrooms = [...new Set([...extractedCriteria.bedrooms, ...bedroomNumbers])];
      }
      
      // Bathrooms from filters
      if (filters.bathrooms?.length > 0) {
        const bathroomNumbers = filters.bathrooms.map((b: string) => {
          if (b === "4+") return 4;
          return parseInt(b) || 0;
        });
        extractedCriteria.bathrooms = [...new Set([...extractedCriteria.bathrooms, ...bathroomNumbers])];
      }
      
      // Locations from filters
      if (filters.locations?.length > 0) {
        extractedCriteria.locations = [...new Set([...extractedCriteria.locations, ...filters.locations])];
      }
      
      // Property types from filters
      if (filters.propertyTypes?.length > 0) {
        extractedCriteria.propertyTypes = [...new Set([...extractedCriteria.propertyTypes, ...filters.propertyTypes])];
      }
      
      // Floor levels from filters
      if (filters.floorLevels?.length > 0) {
        extractedCriteria.floorLevels = [...new Set([...extractedCriteria.floorLevels, ...filters.floorLevels])];
      }
      
      // Building age from filters
      if (filters.buildingAge?.length > 0) {
        extractedCriteria.buildingAge = [...new Set([...extractedCriteria.buildingAge, ...filters.buildingAge])];
      }
      
      // Orientations from filters
      if (filters.orientations?.length > 0) {
        extractedCriteria.orientations = [...new Set([...extractedCriteria.orientations, ...filters.orientations])];
      }
      
      // Developers from filters
      if (filters.developers?.length > 0) {
        extractedCriteria.developers = [...new Set([...extractedCriteria.developers, ...filters.developers])];
      }
    }

    console.log("Extracted criteria:", extractedCriteria);

    // Filter and score properties
    let filteredProperties = [...MOCK_PROPERTIES];
    
    // Apply strict filters first
    if (extractedCriteria.propertyTypes.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        extractedCriteria.propertyTypes.some(pt => 
          p.propertyType.toLowerCase().includes(pt.toLowerCase())
        )
      );
    }
    
    if (extractedCriteria.floorLevels.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        extractedCriteria.floorLevels.includes(p.floorLevel)
      );
    }
    
    if (extractedCriteria.buildingAge.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        extractedCriteria.buildingAge.includes(p.buildingAge)
      );
    }
    
    if (extractedCriteria.orientations.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        extractedCriteria.orientations.includes(p.orientation)
      );
    }
    
    if (extractedCriteria.developers.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        extractedCriteria.developers.some(d => 
          p.developer.toLowerCase().includes(d.toLowerCase())
        )
      );
    }

    // Score and rank remaining properties
    const scoredProperties = filteredProperties.map((property) => {
      let score = 0;
      const matchReasons: string[] = [];

      // Location match (+30 points)
      if (extractedCriteria.locations.length > 0) {
        const locationMatches = extractedCriteria.locations.some(
          (loc) =>
            property.location.toLowerCase().includes(loc.toLowerCase()) ||
            property.district.toLowerCase().includes(loc.toLowerCase()) ||
            loc.toLowerCase().includes(property.location.toLowerCase())
        );
        if (locationMatches) {
          score += 30;
          matchReasons.push("Location match");
        }
      } else {
        score += 15; // Partial score if no location filter
      }

      // Price range (+25 points)
      const priceMin = extractedCriteria.priceMin || 0;
      const priceMax = extractedCriteria.priceMax || Infinity;
      if (property.price >= priceMin && property.price <= priceMax) {
        score += 25;
        matchReasons.push("Within budget");
      } else if (property.price < priceMin * 1.2 && property.price > priceMax * 0.8) {
        score += 10; // Partial score for close matches
        matchReasons.push("Close to budget");
      }

      // Size range (+15 points)
      const sizeMin = extractedCriteria.sizeMin || 0;
      const sizeMax = extractedCriteria.sizeMax || Infinity;
      if (property.size >= sizeMin && property.size <= sizeMax) {
        score += 15;
        matchReasons.push("Size match");
      }

      // Bedroom match (+20 points)
      if (extractedCriteria.bedrooms.length > 0) {
        if (extractedCriteria.bedrooms.includes(property.bedrooms)) {
          score += 20;
          matchReasons.push(`${property.bedrooms} bedrooms`);
        } else if (extractedCriteria.bedrooms.some((b) => Math.abs(b - property.bedrooms) === 1)) {
          score += 10;
          matchReasons.push("Similar bedroom count");
        }
      } else {
        score += 10;
      }
      
      // Bathroom match (+10 points)
      if (extractedCriteria.bathrooms.length > 0) {
        if (extractedCriteria.bathrooms.includes(property.bathrooms)) {
          score += 10;
          matchReasons.push(`${property.bathrooms} bathrooms`);
        }
      } else {
        score += 5;
      }

      // Feature matches (+5 points each, max 20)
      if (extractedCriteria.features.length > 0) {
        let featureScore = 0;
        const matchedFeatures: string[] = [];
        extractedCriteria.features.forEach((feature) => {
          if (property.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()))) {
            featureScore += 5;
            matchedFeatures.push(feature);
          }
        });
        score += Math.min(featureScore, 20);
        if (matchedFeatures.length > 0) {
          matchReasons.push(`Features: ${matchedFeatures.join(", ")}`);
        }
      }

      return {
        ...property,
        score,
        matchReason: matchReasons.join(" • ") || "General match",
      };
    });

    // Sort by score and take top 15
    const rankedProperties = scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((property, index) => ({
        rank: index + 1,
        id: property.id,
        name: property.name,
        location: property.location,
        price: property.price,
        size: property.size,
        bedrooms: property.bedrooms >= 5 ? "5+" : property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        propertyType: property.propertyType,
        floorLevel: property.floorLevel,
        buildingAge: property.buildingAge,
        orientation: property.orientation,
        developer: property.developer,
        features: property.features,
        relevanceScore: Math.round((property.score / 110) * 100), // Normalize to percentage
        matchReason: property.matchReason,
      }));

    // Generate search summary
    const searchSummary = generateSearchSummary(extractedCriteria, rankedProperties.length);

    // Generate filter summary for display
    const filterSummary = generateFilterSummary(extractedCriteria);

    return new Response(
      JSON.stringify({
        extractedCriteria,
        results: rankedProperties,
        searchSummary,
        filterSummary,
        totalCount: rankedProperties.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Search failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateSearchSummary(criteria: ExtractedCriteria, resultCount: number): string {
  const parts: string[] = [];

  if (criteria.locations.length > 0) {
    parts.push(`in ${criteria.locations.join(" or ")}`);
  }

  if (criteria.priceMax && criteria.priceMax < 200000000) {
    parts.push(`under HK$${(criteria.priceMax / 1000000).toFixed(0)}M`);
  }

  if (criteria.bedrooms.length > 0) {
    parts.push(`${criteria.bedrooms.join(" or ")} bedrooms`);
  }

  if (criteria.features.length > 0) {
    parts.push(`with ${criteria.features.slice(0, 2).join(" and ")}`);
  }

  const summary = parts.length > 0 ? `Found ${resultCount} properties ${parts.join(", ")}` : `Found ${resultCount} matching properties`;

  return summary;
}

function generateFilterSummary(criteria: ExtractedCriteria): string {
  const parts: string[] = [];
  
  if (criteria.bedrooms.length > 0) {
    parts.push(`${criteria.bedrooms.join("/")} bed`);
  }
  
  if (criteria.locations.length > 0) {
    parts.push(criteria.locations.slice(0, 2).join(", "));
  }
  
  if (criteria.priceMax && criteria.priceMax < 200000000) {
    parts.push(`<$${(criteria.priceMax / 1000000).toFixed(0)}M`);
  }
  
  if (criteria.propertyTypes.length > 0) {
    parts.push(criteria.propertyTypes.slice(0, 2).join(", "));
  }
  
  if (criteria.features.length > 0) {
    parts.push(criteria.features.slice(0, 2).join(", "));
  }
  
  return parts.length > 0 ? `Showing properties: ${parts.join(", ")}` : "";
}
