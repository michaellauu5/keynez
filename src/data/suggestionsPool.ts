// Pool of suggestion prompts including Chinese queries
export const SUGGESTION_PROMPTS = [
  // English suggestions
  "2 BR North Point $15-21k",
  "3 bedroom Mid-Levels sea view",
  "Studio Causeway Bay furnished",
  "Pet friendly Kowloon under $20k",
  "4 BR Peak with garden",
  "High floor apartment Tsim Sha Tsui",
  "New build Tseung Kwan O",
  "Family home near MTR station",
  "Sea view apartment under $30k",
  "Renovated 2BR Central",
  
  // Chinese suggestions (as requested)
  "地鐵站上蓋",           // MTR station connected
  "明廁明廚",             // Window in bathroom and kitchen
  "業主盤",               // Direct from landlord
  "東/南朝向",            // East/South facing
  "有露台",               // Has balcony/terrace
  "連車位",               // With parking
  "九龍城區校網",         // Kowloon City school district
  "有工人房",             // Has helper's room
  "高樓層開揚景觀",       // High floor open view
  "交通便利（近港鐵、巴士/小巴站）", // Convenient transport
  "<10年樓齡",            // Building age under 10 years
  "近超市街市",           // Near supermarket/market
  "低噪音污染",           // Low noise pollution
  "使用面積>7成",         // Usable area > 70%
];

// Mode-specific suggestions
export const RENT_SUGGESTIONS = [
  "2 BR North Point $15-21k",
  "Studio Causeway Bay under $18k",
  "Pet friendly apartment $20k",
  "地鐵站上蓋",
  "明廁明廚",
  "業主盤",
  "有露台",
  "高樓層開揚景觀",
  "交通便利（近港鐵、巴士/小巴站）",
  "近超市街市",
];

export const BUY_SUGGESTIONS = [
  "3 BR Mid-Levels under $50M",
  "Family home The Peak with garden",
  "Investment studio Causeway Bay",
  "New development Tseung Kwan O",
  "連車位",
  "九龍城區校網",
  "有工人房",
  "<10年樓齡",
  "使用面積>7成",
  "東/南朝向",
];

// Get random suggestions
export function getRandomSuggestions(mode: 'rent' | 'buy', count: number = 4): string[] {
  const pool = mode === 'rent' ? RENT_SUGGESTIONS : BUY_SUGGESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get all suggestions for a mode
export function getAllSuggestions(mode: 'rent' | 'buy'): string[] {
  return mode === 'rent' ? RENT_SUGGESTIONS : BUY_SUGGESTIONS;
}
