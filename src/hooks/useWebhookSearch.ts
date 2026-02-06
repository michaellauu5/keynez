import { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '@/translations';

// Webhook configuration
const WEBHOOK_URL = 'https://properly.app.n8n.cloud/webhook-test/keynez_agent_input';
const TIMEOUT_MS = 60000; // 60 seconds

export interface WebhookFilters {
  property_type: string[];
  transaction_type: 'Rent' | 'Buy';
  location: string[];
  price_range: {
    min: number | null;
    max: number | null;
    currency: 'HKD';
  };
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: {
    min: number | null;
    max: number | null;
  };
  floor_level: string[];
  building_age: string[];
  orientation: string[];
  developer: string[];
  special_features: string[];
  furnished: boolean | null;
  pet_friendly: boolean | null;
  parking: boolean | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  message: string;
}

export interface WebhookRequest {
  user_message: string;
  filters: WebhookFilters;
  language: Language;
  conversation_id: string;
  timestamp: string;
  is_followup?: boolean;
  previous_results_count?: number;
  followup_intent?: string;
  conversation_history?: ConversationMessage[];
}

export interface WebhookPropertyResult {
  building_name: string;
  monthly_rent?: number;
  sale_price?: number;
  bedrooms: number | string;
  bathrooms: number | string;
  size_sqft: number | null;
  floor_level: string;
  outdoor_space: string;
  special_features: string[];
  agent_name: string;
  agent_contact: string;
  reference: string;
  source_url: string;
  match_score: number;
}

export interface AgentRecommendation {
  name: string;
  specialization: string;
  contact: string;
}

export interface WebhookResponse {
  success: boolean;
  results_count: number;
  results: WebhookPropertyResult[];
  insights: string[];
  agent_recommendations: AgentRecommendation[];
  error?: string;
}

// Loading messages that rotate during search
const LOADING_MESSAGES = [
  "Searching 28hse.com for listings...",
  "Checking Squarefoot database...",
  "Scanning Spacious listings...",
  "Searching Midland Realty...",
  "Checking Centaline properties...",
  "Gathering results from OneDay...",
  "Analyzing and ranking properties...",
  "Preparing your personalized results...",
];

// Generate a UUID for conversation tracking
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create conversation ID from session storage
function getConversationId(): string {
  let conversationId = sessionStorage.getItem('keynez_conversation_id');
  if (!conversationId) {
    conversationId = generateUUID();
    sessionStorage.setItem('keynez_conversation_id', conversationId);
  }
  return conversationId;
}

// Reset conversation ID
function resetConversationId(): string {
  const newId = generateUUID();
  sessionStorage.setItem('keynez_conversation_id', newId);
  return newId;
}

export interface UseWebhookSearchReturn {
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  results: WebhookPropertyResult[];
  insights: string[];
  agentRecommendations: AgentRecommendation[];
  resultsCount: number;
  conversationId: string;
  executeSearch: (request: Omit<WebhookRequest, 'conversation_id' | 'timestamp'>) => Promise<WebhookResponse | null>;
  resetSearch: () => void;
  retryLastSearch: () => Promise<WebhookResponse | null>;
}

export function useWebhookSearch(): UseWebhookSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WebhookPropertyResult[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [agentRecommendations, setAgentRecommendations] = useState<AgentRecommendation[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [conversationId, setConversationId] = useState<string>(() => getConversationId());
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<Omit<WebhookRequest, 'conversation_id' | 'timestamp'> | null>(null);

  // Rotate loading messages
  useEffect(() => {
    if (isLoading) {
      let index = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      
      loadingIntervalRef.current = setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[index]);
      }, 2500); // Rotate every 2.5 seconds
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

  const executeSearch = useCallback(async (
    request: Omit<WebhookRequest, 'conversation_id' | 'timestamp'>
  ): Promise<WebhookResponse | null> => {
    // Store for potential retry
    lastRequestRef.current = request;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, TIMEOUT_MS);

    const fullRequest: WebhookRequest = {
      ...request,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullRequest),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data: WebhookResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      setInsights(data.insights || []);
      setAgentRecommendations(data.agent_recommendations || []);
      setResultsCount(data.results_count || 0);
      setError(null);

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Search is taking longer than expected. Please try again or refine your filters.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Unable to connect to search service. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const resetSearch = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear all state
    setIsLoading(false);
    setError(null);
    setResults([]);
    setInsights([]);
    setAgentRecommendations([]);
    setResultsCount(0);
    lastRequestRef.current = null;
    
    // Reset conversation ID for new session
    const newId = resetConversationId();
    setConversationId(newId);
  }, []);

  const retryLastSearch = useCallback(async (): Promise<WebhookResponse | null> => {
    if (!lastRequestRef.current) {
      setError('No previous search to retry.');
      return null;
    }
    return executeSearch(lastRequestRef.current);
  }, [executeSearch]);

  return {
    isLoading,
    loadingMessage,
    error,
    results,
    insights,
    agentRecommendations,
    resultsCount,
    conversationId,
    executeSearch,
    resetSearch,
    retryLastSearch,
  };
}
