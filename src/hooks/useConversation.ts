import { useState, useCallback, useRef } from 'react';
import { PropertyResult } from '@/components/landing/PropertyResultsTable';
import { WebSearchResult } from '@/components/landing/WebSearchResultsTable';
import { FilterState } from '@/components/landing/FilterToggleBar';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  filterChanges?: Partial<FilterState>;
  resultCount?: number;
  isFollowUp?: boolean;
}

export interface ConversationState {
  messages: ChatMessage[];
  lastResults: PropertyResult[];
  lastWebResults: WebSearchResult[];
  currentFilters: FilterState;
  lastQuery: string;
  currentPage: number;
  totalAvailable: number;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  preferredLocations: string[];
  budgetRange: [number, number] | null;
  preferredBedrooms: string[];
  preferredFeatures: string[];
}

export interface FollowUpIntent {
  type: 'show_more' | 'expand_price' | 'change_bedrooms' | 'property_detail' | 
        'remove_filter' | 'cheaper_options' | 'change_location' | 'general_refinement' | 'unknown';
  params: Record<string, any>;
  originalQuery: string;
}

const MAX_HISTORY = 10;

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  preferredLocations: [],
  budgetRange: null,
  preferredBedrooms: [],
  preferredFeatures: [],
};

export function useConversation(defaultFilters: FilterState) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastResults, setLastResults] = useState<PropertyResult[]>([]);
  const [lastWebResults, setLastWebResults] = useState<WebSearchResult[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState>(defaultFilters);
  const [lastQuery, setLastQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  const resultsPerPage = 15;

  // Add a user message
  const addUserMessage = useCallback((content: string, isFollowUp = false) => {
    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      isFollowUp,
    };
    
    setMessages(prev => {
      const updated = [...prev, message];
      // Keep only last MAX_HISTORY messages
      return updated.slice(-MAX_HISTORY);
    });
    
    return message;
  }, []);

  // Add an assistant message
  const addAssistantMessage = useCallback((
    content: string, 
    resultCount?: number,
    filterChanges?: Partial<FilterState>
  ) => {
    const message: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      resultCount,
      filterChanges,
    };
    
    setMessages(prev => {
      const updated = [...prev, message];
      return updated.slice(-MAX_HISTORY);
    });
    
    return message;
  }, []);

  // Update results (both AI and web)
  const updateResults = useCallback((
    results: PropertyResult[], 
    webResults: WebSearchResult[],
    query: string,
    total: number
  ) => {
    setLastResults(results);
    setLastWebResults(webResults);
    setLastQuery(query);
    setTotalAvailable(total);
    setCurrentPage(1);
    
    // Extract user preferences from search results
    if (results.length > 0) {
      const locations = new Set<string>();
      results.forEach(r => {
        if (r.location) locations.add(r.location);
      });
      
      setUserPreferences(prev => ({
        ...prev,
        preferredLocations: [...new Set([...prev.preferredLocations, ...Array.from(locations).slice(0, 3)])].slice(0, 5),
      }));
    }
  }, []);

  // Update filters with tracking
  const updateFilters = useCallback((newFilters: FilterState | ((prev: FilterState) => FilterState)) => {
    setCurrentFilters(prev => {
      const updated = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      return updated;
    });
  }, []);

  // Detect follow-up intent from user message
  const detectFollowUpIntent = useCallback((message: string, hasResults: boolean): FollowUpIntent => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Show more / pagination
    if (/show\s*(me\s*)?(more|additional|next|another)/i.test(message) || 
        /more\s*options/i.test(message) ||
        /load\s*more/i.test(message)) {
      return { type: 'show_more', params: {}, originalQuery: message };
    }
    
    // Expand price range
    const expandPriceMatch = message.match(/expand.*(?:price|budget|rent).*?(\$?\d+[kKmM]?)/i) ||
                             message.match(/(?:price|budget|rent).*?to\s*(\$?\d+[kKmM]?)/i) ||
                             message.match(/up\s*to\s*(\$?\d+[kKmM]?)/i);
    if (expandPriceMatch) {
      const priceStr = expandPriceMatch[1].replace(/[$,]/g, '');
      let price = parseFloat(priceStr);
      if (/k/i.test(priceStr)) price *= 1000;
      if (/m/i.test(priceStr)) price *= 1000000;
      return { type: 'expand_price', params: { newMax: price }, originalQuery: message };
    }
    
    // Change bedrooms
    const bedroomMatch = message.match(/(\d+)\s*bed(?:room)?s?\s*instead/i) ||
                         message.match(/what\s*about\s*(\d+)\s*bed/i) ||
                         message.match(/change.*to\s*(\d+)\s*bed/i) ||
                         message.match(/show.*(\d+)\s*bed/i);
    if (bedroomMatch) {
      return { type: 'change_bedrooms', params: { bedrooms: parseInt(bedroomMatch[1]) }, originalQuery: message };
    }
    
    // Property detail request - by number or name
    const detailByNumberMatch = message.match(/(?:tell\s*me\s*(?:more\s*)?about|details?\s*(?:on|for|about)?|show\s*me)\s*#?(\d+)/i) ||
                                 message.match(/#(\d+)/);
    if (detailByNumberMatch) {
      return { type: 'property_detail', params: { index: parseInt(detailByNumberMatch[1]) }, originalQuery: message };
    }
    
    // Property detail by name - check if any result name is mentioned
    if (hasResults) {
      const detailByNameMatch = message.match(/(?:tell\s*me\s*(?:more\s*)?about|details?\s*(?:on|for|about)?|show\s*me)\s*(.+)/i);
      if (detailByNameMatch) {
        const buildingName = detailByNameMatch[1].trim();
        if (buildingName.length > 3) {
          return { type: 'property_detail', params: { name: buildingName }, originalQuery: message };
        }
      }
    }
    
    // Remove filter requirement
    if (/remove.*(?:balcony|terrace|garden|pool|gym|parking|pet|view)/i.test(message) ||
        /without.*(?:balcony|terrace|garden|pool|gym|parking|pet|view)/i.test(message) ||
        /don'?t\s*need.*(?:balcony|terrace|garden|pool|gym|parking|pet|view)/i.test(message)) {
      const featureMatch = message.match(/(balcony|terrace|garden|pool|gym|parking|pet|sea\s*view|mountain\s*view|city\s*view)/i);
      return { 
        type: 'remove_filter', 
        params: { feature: featureMatch ? featureMatch[1] : null }, 
        originalQuery: message 
      };
    }
    
    // Cheaper options
    if (/cheap(?:er)?/i.test(message) || 
        /lower\s*price/i.test(message) ||
        /less\s*expensive/i.test(message) ||
        /budget/i.test(message)) {
      return { type: 'cheaper_options', params: {}, originalQuery: message };
    }
    
    // Change location
    const locationMatch = message.match(/(?:any\s*(?:units?\s*)?in|what\s*about|show\s*me\s*(?:properties\s*)?in|search\s*in)\s+([A-Za-z\s]+?)(?:\?|$|,|\s+with|\s+under)/i);
    if (locationMatch) {
      return { type: 'change_location', params: { location: locationMatch[1].trim() }, originalQuery: message };
    }
    
    // General refinement if we have context
    if (hasResults && (
        /more\s*expensive/i.test(message) ||
        /larger|bigger/i.test(message) ||
        /smaller/i.test(message) ||
        /newer/i.test(message) ||
        /higher\s*floor/i.test(message) ||
        /lower\s*floor/i.test(message)
    )) {
      return { type: 'general_refinement', params: { refinement: message }, originalQuery: message };
    }
    
    return { type: 'unknown', params: {}, originalQuery: message };
  }, []);

  // Get property by reference (number or name)
  const getPropertyByReference = useCallback((ref: { index?: number; name?: string }) => {
    if (ref.index !== undefined) {
      // Index is 1-based from user perspective
      const idx = ref.index - 1;
      if (idx >= 0 && idx < lastResults.length) {
        return lastResults[idx];
      }
      if (idx >= 0 && idx < lastWebResults.length) {
        return lastWebResults[idx];
      }
    }
    
    if (ref.name) {
      const lowerName = ref.name.toLowerCase();
      // Check AI results first
      const aiMatch = lastResults.find(r => 
        r.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(r.name.toLowerCase())
      );
      if (aiMatch) return aiMatch;
      
      // Check web results
      const webMatch = lastWebResults.find(r => 
        r.buildingName.toLowerCase().includes(lowerName) ||
        lowerName.includes(r.buildingName.toLowerCase())
      );
      if (webMatch) return webMatch;
    }
    
    return null;
  }, [lastResults, lastWebResults]);

  // Generate follow-up suggestions based on context
  const generateSuggestions = useCallback((results: PropertyResult[], filters: FilterState): string[] => {
    const suggestions: string[] = [];
    
    if (results.length >= 15) {
      suggestions.push("Show me more options");
    }
    
    if (filters.priceRange[1] < 100000000) {
      suggestions.push("I can show more expensive options if needed");
    }
    
    if (results.length > 0) {
      suggestions.push("Would you like details on any specific building?");
    }
    
    if (filters.locations.length > 0) {
      suggestions.push("Would you like to see units in nearby areas?");
    }
    
    if (filters.bedrooms.length > 0) {
      const currentBed = parseInt(filters.bedrooms[0]) || 2;
      suggestions.push(`What about ${currentBed + 1} bedrooms instead?`);
    }
    
    return suggestions.slice(0, 3);
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setLastResults([]);
    setLastWebResults([]);
    setLastQuery('');
    setCurrentPage(1);
    setTotalAvailable(0);
    setSelectedPropertyId(null);
  }, []);

  // Get conversation history for AI context
  const getConversationContext = useCallback(() => {
    return messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  return {
    // State
    messages,
    lastResults,
    lastWebResults,
    currentFilters,
    lastQuery,
    currentPage,
    totalAvailable,
    userPreferences,
    selectedPropertyId,
    resultsPerPage,
    
    // Actions
    addUserMessage,
    addAssistantMessage,
    updateResults,
    updateFilters,
    detectFollowUpIntent,
    getPropertyByReference,
    generateSuggestions,
    clearConversation,
    getConversationContext,
    loadMore,
    setSelectedPropertyId,
    
    // Computed
    hasHistory: messages.length > 0,
    hasResults: lastResults.length > 0 || lastWebResults.length > 0,
    canLoadMore: currentPage * resultsPerPage < totalAvailable,
  };
}
