 import { AIChatRequest, AIChatResponse } from '../types/ai.types';

  /**
   * AI API Service
   * Handles communication with the backend AI chat endpoint
   */
  class AIApiService {
    private baseUrl: string;

    constructor() {
      this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5004/api/v1'; // Fixed port
    }

    /**
     * Send a chat message to the AI backend
     */
    async sendMessage(request: AIChatRequest): Promise<AIChatResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for session-based auth
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 401 || response.status === 403) {
            // Authentication failed - session expired or invalid
            return {
              success: false,
              error: {
                code: 'AUTH_ERROR',
                message: 'Authentication required. Please sign in again.'
              }
            };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AIChatResponse = await response.json();
        return data;
      } catch (error) {
        console.error('AI API Error:', error);
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Failed to connect to AI service'
          }
        };
      }
    }

    /**
     * New method to match the expected 'chat' method
     */
    async chat(request: AIChatRequest): Promise<AIChatResponse> {
      return this.sendMessage(request);
    }
  }

  export const aiApiService = new AIApiService();