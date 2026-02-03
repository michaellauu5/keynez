import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hong Kong property website sources
const PROPERTY_SOURCES = [
  { name: "28hse", domain: "28hse.com", displayName: "28Hse" },
  { name: "house730", domain: "house730.com", displayName: "House730" },
  { name: "squarefoot", domain: "squarefoot.com.hk", displayName: "Squarefoot" },
  { name: "spacious", domain: "spacious.hk", displayName: "Spacious" },
  { name: "oneday", domain: "oneday.com.hk", displayName: "OneDay" },
  { name: "midland", domain: "midland.com.hk", displayName: "Midland" },
  { name: "centaline", domain: "centaline.com.hk", displayName: "Centaline" },
  { name: "propertyhk", domain: "property.hk", displayName: "Property.hk" },
  { name: "okay", domain: "okay.com", displayName: "Okay.com" },
];

interface SearchFilters {
  location?: string;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  features?: string[];
  propertyType?: string;
}

interface WebSearchResult {
  id: string;
  buildingName: string;
  monthlyRent: number | null;
  salePrice: number | null;
  bedrooms: string;
  bathrooms: string;
  size: number | null;
  floorLevel: string;
  outdoorSpace: string[];
  features: string[];
  agentName: string;
  agentContact: string;
  refNumber: string;
  sourceUrl: string;
  sourceName: string;
  sourceDisplayName: string;
  location: string;
  matchScore: number;
  rawSnippet: string;
}

// Build search query from user input and filters
function buildSearchQuery(userQuery: string, filters: SearchFilters): string {
  const parts: string[] = [];
  
  // Add location
  if (filters.location) {
    parts.push(filters.location);
  }
  
  // Add bedrooms
  if (filters.bedrooms) {
    parts.push(`${filters.bedrooms} bedroom`);
  }
  
  // Add price range
  if (filters.priceMin || filters.priceMax) {
    if (filters.priceMin && filters.priceMax) {
      parts.push(`$${filters.priceMin}-$${filters.priceMax}`);
    } else if (filters.priceMax) {
      parts.push(`under $${filters.priceMax}`);
    } else if (filters.priceMin) {
      parts.push(`from $${filters.priceMin}`);
    }
  }
  
  // Add features
  if (filters.features && filters.features.length > 0) {
    parts.push(filters.features.join(" "));
  }
  
  // Add property type
  if (filters.propertyType) {
    parts.push(filters.propertyType);
  }
  
  // Combine with user query
  const baseQuery = userQuery || parts.join(" ");
  return `Hong Kong rental ${baseQuery}`;
}

// Parse price from text
function parsePrice(text: string): number | null {
  if (!text) return null;
  
  // Remove currency symbols and commas
  const cleaned = text.replace(/[HK$,\s]/gi, "");
  
  // Check for Chinese characters (萬 = 10,000, 千 = 1,000)
  if (cleaned.includes("萬") || cleaned.includes("万")) {
    const num = parseFloat(cleaned.replace(/萬|万/g, ""));
    return num * 10000;
  }
  
  // Check for K (thousands)
  if (cleaned.toLowerCase().includes("k")) {
    const num = parseFloat(cleaned.replace(/k/gi, ""));
    return num * 1000;
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Parse size from text
function parseSize(text: string): number | null {
  if (!text) return null;
  
  // Look for numbers followed by sq ft, sqft, ft², 呎, 尺
  const match = text.match(/(\d+(?:,\d+)?)\s*(?:sq\.?\s*ft\.?|sqft|ft²|呎|尺)/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""));
  }
  
  return null;
}

// Extract bedroom count from text
function extractBedrooms(text: string): string {
  // Look for bedroom patterns
  const patterns = [
    /(\d+)\s*(?:bed|bedroom|br|房|房間)/i,
    /(\d+)[-\s]?(?:room|rooms)/i,
    /studio/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes("studio")) return "Studio";
      return match[1];
    }
  }
  
  return "-";
}

// Extract features from text
function extractFeatures(text: string): string[] {
  const features: string[] = [];
  const lowerText = text.toLowerCase();
  
  const featurePatterns = [
    { pattern: /balcon/i, name: "Balcony" },
    { pattern: /terrace/i, name: "Terrace" },
    { pattern: /rooftop|flat roof/i, name: "Rooftop" },
    { pattern: /garden/i, name: "Garden" },
    { pattern: /sea\s*view/i, name: "Sea View" },
    { pattern: /mountain\s*view/i, name: "Mountain View" },
    { pattern: /city\s*view/i, name: "City View" },
    { pattern: /pool|游泳/i, name: "Pool" },
    { pattern: /gym|健身/i, name: "Gym" },
    { pattern: /parking|車位/i, name: "Parking" },
    { pattern: /pet\s*(?:friendly|allowed)|寵物/i, name: "Pet Friendly" },
    { pattern: /furnished|傢俱/i, name: "Furnished" },
    { pattern: /renovated|翻新/i, name: "Renovated" },
    { pattern: /separate\s*kitchen|獨立廚房/i, name: "Separate Kitchen" },
    { pattern: /helper|工人房/i, name: "Helper's Room" },
  ];
  
  for (const { pattern, name } of featurePatterns) {
    if (pattern.test(text)) {
      features.push(name);
    }
  }
  
  return features;
}

// Extract outdoor space types
function extractOutdoorSpace(text: string): string[] {
  const spaces: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (/balcon/i.test(text)) spaces.push("Balcony");
  if (/terrace/i.test(text)) spaces.push("Terrace");
  if (/rooftop|flat\s*roof/i.test(text)) spaces.push("Rooftop");
  if (/garden|花園/i.test(text)) spaces.push("Garden");
  if (/yard|露台/i.test(text)) spaces.push("Yard");
  
  return spaces.length > 0 ? spaces : ["-"];
}

// Extract floor level
function extractFloorLevel(text: string): string {
  const patterns = [
    { pattern: /high\s*floor|高層/i, level: "High" },
    { pattern: /mid(?:dle)?\s*floor|中層/i, level: "Mid" },
    { pattern: /low\s*floor|低層/i, level: "Low" },
    { pattern: /(\d+)(?:\/F|F|樓)/i, level: null }, // Will extract floor number
  ];
  
  for (const { pattern, level } of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (level) return level;
      // Parse floor number
      const floorNum = parseInt(match[1]);
      if (floorNum >= 30) return "High";
      if (floorNum >= 15) return "Mid";
      return "Low";
    }
  }
  
  return "-";
}

// Process Firecrawl search results
function processSearchResults(
  firecrawlData: any,
  source: typeof PROPERTY_SOURCES[0],
  query: string
): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  
  if (!firecrawlData?.data || !Array.isArray(firecrawlData.data)) {
    console.log(`No data from ${source.name}`);
    return results;
  }
  
  for (const item of firecrawlData.data.slice(0, 10)) {
    const text = `${item.title || ""} ${item.description || ""} ${item.markdown || ""}`;
    
    // Extract building name from title
    let buildingName = item.title || "Unknown Property";
    // Clean up the title
    buildingName = buildingName.replace(/租|售|出租|出售|for\s*rent|for\s*sale/gi, "").trim();
    buildingName = buildingName.split(/[-–|]/)[0].trim();
    if (buildingName.length > 50) {
      buildingName = buildingName.substring(0, 50) + "...";
    }
    
    const monthlyRent = parsePrice(text);
    const size = parseSize(text);
    const bedrooms = extractBedrooms(text);
    const features = extractFeatures(text);
    const outdoorSpace = extractOutdoorSpace(text);
    const floorLevel = extractFloorLevel(text);
    
    // Extract location from title/description
    const hkDistricts = [
      "Central", "Mid-Levels", "The Peak", "Wan Chai", "Causeway Bay",
      "Happy Valley", "Repulse Bay", "Stanley", "Tai Tam", "Pokfulam",
      "Tsim Sha Tsui", "Mong Kok", "Kowloon Tong", "Ho Man Tin",
      "Sha Tin", "Tai Po", "Sai Kung", "Ma On Shan", "Tuen Mun",
      "Yuen Long", "Tung Chung", "Discovery Bay", "North Point",
      "Quarry Bay", "Tai Koo", "Sai Ying Pun", "Kennedy Town",
      "中環", "半山", "山頂", "灣仔", "銅鑼灣", "跑馬地", "淺水灣",
      "尖沙咀", "旺角", "九龍塘", "何文田", "沙田", "大埔", "西貢",
    ];
    
    let location = "-";
    for (const district of hkDistricts) {
      if (text.includes(district)) {
        location = district;
        break;
      }
    }
    
    // Calculate match score based on query terms
    const queryTerms = query.toLowerCase().split(/\s+/);
    const lowerText = text.toLowerCase();
    let matchScore = 0;
    for (const term of queryTerms) {
      if (term.length > 2 && lowerText.includes(term)) {
        matchScore += 10;
      }
    }
    
    results.push({
      id: `${source.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buildingName,
      monthlyRent,
      salePrice: null,
      bedrooms,
      bathrooms: "-",
      size,
      floorLevel,
      outdoorSpace,
      features,
      agentName: "-",
      agentContact: "-",
      refNumber: item.url?.split("/").pop()?.substring(0, 10) || "-",
      sourceUrl: item.url || "",
      sourceName: source.name,
      sourceDisplayName: source.displayName,
      location,
      matchScore: Math.min(100, 50 + matchScore),
      rawSnippet: (item.description || "").substring(0, 200),
    });
  }
  
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json() as { 
      query: string; 
      filters?: SearchFilters 
    };
    
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Web search not configured. Please connect Firecrawl." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Web search query:", query);
    console.log("Filters:", filters);

    // Build search query
    const searchQuery = buildSearchQuery(query, filters || {});
    console.log("Constructed search query:", searchQuery);

    // Track sources being searched
    const sourcesSearched: string[] = [];
    const allResults: WebSearchResult[] = [];
    const errors: string[] = [];

    // Select top 3 sources to search (to stay within rate limits)
    const sourcesToSearch = PROPERTY_SOURCES.slice(0, 3);

    // Search each source in parallel
    const searchPromises = sourcesToSearch.map(async (source) => {
      try {
        console.log(`Searching ${source.displayName}...`);
        sourcesSearched.push(source.displayName);
        
        // Use Firecrawl search with site filter
        const siteQuery = `${searchQuery} site:${source.domain}`;
        
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: siteQuery,
            limit: 10,
            lang: "en",
            scrapeOptions: {
              formats: ["markdown"],
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Firecrawl error for ${source.name}:`, response.status, errorText);
          errors.push(`${source.displayName}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        console.log(`Got ${data?.data?.length || 0} results from ${source.displayName}`);
        
        return processSearchResults(data, source, query);
      } catch (error) {
        console.error(`Error searching ${source.name}:`, error);
        errors.push(`${source.displayName}: ${error instanceof Error ? error.message : 'Failed'}`);
        return [];
      }
    });

    // Wait for all searches to complete
    const resultsArrays = await Promise.all(searchPromises);
    
    // Flatten results
    for (const results of resultsArrays) {
      allResults.push(...results);
    }

    // Deduplicate by building name similarity
    const seenNames = new Set<string>();
    const deduplicatedResults = allResults.filter((result) => {
      const normalizedName = result.buildingName.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seenNames.has(normalizedName)) {
        return false;
      }
      seenNames.add(normalizedName);
      return true;
    });

    // Sort by match score
    deduplicatedResults.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 20 results
    const finalResults = deduplicatedResults.slice(0, 20);

    console.log(`Returning ${finalResults.length} results from ${sourcesSearched.length} sources`);

    return new Response(
      JSON.stringify({
        success: true,
        results: finalResults,
        sourcesSearched,
        totalFound: finalResults.length,
        query: searchQuery,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Web search error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Web search failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
