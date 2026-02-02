import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock properties for matching (in production, this would come from a database)
const MOCK_PROPERTIES = [
  { id: "1", name: "The Cullinan Tower 21", location: "West Kowloon", district: "Tsim Sha Tsui", price: 85000000, size: 1250, bedrooms: 3, features: ["Sea View", "New Build", "Gym"] },
  { id: "2", name: "One Island South", location: "Wong Chuk Hang", district: "Wong Chuk Hang", price: 42000000, size: 890, bedrooms: 2, features: ["Mountain View", "Pet Friendly", "Pool"] },
  { id: "3", name: "Mount Nicholson", location: "The Peak", district: "The Peak", price: 280000000, size: 3200, bedrooms: 5, features: ["Sea View", "Garden", "Parking"] },
  { id: "4", name: "The Pavilia Hill", location: "North Point", district: "North Point", price: 35000000, size: 720, bedrooms: 2, features: ["City View", "Renovated", "Gym"] },
  { id: "5", name: "Larvotto", location: "Ap Lei Chau", district: "Ap Lei Chau", price: 58000000, size: 1100, bedrooms: 3, features: ["Sea View", "Balcony", "Pool"] },
  { id: "6", name: "Victoria Peak House", location: "The Peak", district: "The Peak", price: 450000000, size: 5500, bedrooms: 5, features: ["Sea View", "Garden", "Rooftop"] },
  { id: "7", name: "The Austin", location: "West Kowloon", district: "Tsim Sha Tsui", price: 25000000, size: 550, bedrooms: 1, features: ["City View", "New Build", "Gym"] },
  { id: "8", name: "Ultima", location: "Ho Man Tin", district: "Ho Man Tin", price: 120000000, size: 2100, bedrooms: 4, features: ["Mountain View", "Pool", "Parking"] },
  { id: "9", name: "Grand Mayfair", location: "Mid-Levels", district: "Mid-Levels", price: 68000000, size: 1400, bedrooms: 3, features: ["City View", "Pet Friendly", "Renovated"] },
  { id: "10", name: "Bel-Air Peak", location: "Pokfulam", district: "Pokfulam", price: 95000000, size: 1800, bedrooms: 4, features: ["Sea View", "Garden", "Parking"] },
  { id: "11", name: "The Morgan", location: "Sheung Wan", district: "Sheung Wan", price: 32000000, size: 680, bedrooms: 2, features: ["City View", "Renovated", "Rooftop"] },
  { id: "12", name: "Park Mediterranean", location: "Ma On Shan", district: "Ma On Shan", price: 15000000, size: 620, bedrooms: 2, features: ["Mountain View", "New Build", "Pool"] },
  { id: "13", name: "Kadooria Hill", location: "Ho Man Tin", district: "Ho Man Tin", price: 78000000, size: 1550, bedrooms: 3, features: ["Garden", "Pet Friendly", "Parking"] },
  { id: "14", name: "Repulse Bay Apartments", location: "Repulse Bay", district: "Repulse Bay", price: 145000000, size: 2400, bedrooms: 4, features: ["Sea View", "Balcony", "Pool"] },
  { id: "15", name: "Island Crest", location: "Sai Ying Pun", district: "Sai Ying Pun", price: 22000000, size: 480, bedrooms: 1, features: ["City View", "Gym", "Renovated"] },
  { id: "16", name: "Dynasty Court", location: "Mid-Levels", district: "Mid-Levels", price: 55000000, size: 1200, bedrooms: 3, features: ["Sea View", "Pool", "Gym"] },
  { id: "17", name: "Pacific View", location: "Tai Tam", district: "Tai Tam", price: 88000000, size: 1650, bedrooms: 4, features: ["Sea View", "Pet Friendly", "Garden"] },
  { id: "18", name: "The Belcher's", location: "Kennedy Town", district: "Kennedy Town", price: 28000000, size: 750, bedrooms: 2, features: ["Sea View", "Pool", "Gym"] },
  { id: "19", name: "Tregunter Tower", location: "Mid-Levels", district: "Mid-Levels", price: 150000000, size: 2800, bedrooms: 4, features: ["Mountain View", "Garden", "Parking"] },
  { id: "20", name: "The Hermitage", location: "Tai Kok Tsui", district: "Tai Kok Tsui", price: 18000000, size: 520, bedrooms: 2, features: ["City View", "New Build", "Pool"] },
];

interface ExtractedCriteria {
  locations: string[];
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  bedrooms: number[];
  features: string[];
  specialRequirements: string;
}

interface PropertyResult {
  rank: number;
  id: string;
  name: string;
  location: string;
  price: number;
  size: number;
  bedrooms: string;
  features: string[];
  relevanceScore: number;
  matchReason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing search query:", query);
    console.log("Applied filters:", filters);

    // Call Lovable AI to extract search criteria from natural language
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
  "features": ["array of features mentioned, e.g., 'sea view', 'pool', 'gym', 'parking', 'garden', 'pet friendly'"],
  "specialRequirements": "any other specific requirements mentioned"
}

Common Hong Kong districts: Central, Mid-Levels, The Peak, Wan Chai, Causeway Bay, Happy Valley, Repulse Bay, Tsim Sha Tsui, Mong Kok, Kowloon Tong, Ho Man Tin, Hung Hom, Sha Tin, Tai Po, Sai Kung, Ma On Shan

Return ONLY valid JSON, no markdown or explanation.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
    const aiContent = aiData.choices?.[0]?.message?.content || "{}";
    
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
        features: [],
        specialRequirements: "",
      };
    }

    // Merge with provided filters
    if (filters) {
      if (filters.priceRange) {
        extractedCriteria.priceMin = extractedCriteria.priceMin || filters.priceRange[0] || null;
        extractedCriteria.priceMax = extractedCriteria.priceMax || filters.priceRange[1] || null;
      }
      if (filters.sizeRange) {
        extractedCriteria.sizeMin = extractedCriteria.sizeMin || filters.sizeRange[0] || null;
        extractedCriteria.sizeMax = extractedCriteria.sizeMax || filters.sizeRange[1] || null;
      }
      if (filters.bedrooms?.length > 0) {
        const bedroomNumbers = filters.bedrooms.map((b: string) => {
          if (b === "5+") return 5;
          return parseInt(b) || 0;
        });
        extractedCriteria.bedrooms = [...new Set([...extractedCriteria.bedrooms, ...bedroomNumbers])];
      }
      if (filters.locations?.length > 0) {
        extractedCriteria.locations = [...new Set([...extractedCriteria.locations, ...filters.locations])];
      }
    }

    console.log("Extracted criteria:", extractedCriteria);

    // Score and rank properties
    const scoredProperties = MOCK_PROPERTIES.map((property) => {
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
        features: property.features,
        relevanceScore: Math.round((property.score / 100) * 100), // Normalize to percentage
        matchReason: property.matchReason,
      }));

    // Generate search summary
    const searchSummary = generateSearchSummary(extractedCriteria, rankedProperties.length);

    return new Response(
      JSON.stringify({
        extractedCriteria,
        results: rankedProperties,
        searchSummary,
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

  if (criteria.priceMax) {
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
