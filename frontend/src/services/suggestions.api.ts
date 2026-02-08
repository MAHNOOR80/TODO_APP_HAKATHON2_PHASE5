/**
 * Suggestions API Service
 * Frontend API calls for agent suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { api } from './api';

export type SuggestionType =
  | 'overdue_reminder'
  | 'prioritization'
  | 'schedule_adjustment'
  | 'neglected_task'
  | 'general_insight';

export interface Suggestion {
  id: string;
  userId: string;
  taskId: string | null;
  suggestionType: SuggestionType;
  message: string;
  metadata: Record<string, unknown>;
  dismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
  task?: {
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    completed: boolean;
  };
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  total: number;
  limit: number;
  offset: number;
}

export interface SuggestionCounts {
  total: number;
  byType: Record<SuggestionType, number>;
}

export interface SuggestionQueryParams {
  limit?: number;
  offset?: number;
  type?: SuggestionType;
  dismissed?: boolean;
}

/**
 * Get suggestions for the authenticated user
 */
export async function getSuggestions(
  params: SuggestionQueryParams = {}
): Promise<SuggestionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  if (params.type) searchParams.set('type', params.type);
  if (params.dismissed !== undefined) searchParams.set('dismissed', params.dismissed.toString());

  const query = searchParams.toString();
  const url = query ? `/suggestions?${query}` : '/suggestions';

  const response = await api.get<SuggestionsResponse>(url);
  return response;
}

/**
 * Get a single suggestion by ID
 */
export async function getSuggestionById(id: string): Promise<Suggestion> {
  const response = await api.get<Suggestion>(`/suggestions/${id}`);
  return response;
}

/**
 * Dismiss a suggestion
 */
export async function dismissSuggestion(id: string): Promise<Suggestion> {
  const response = await api.post<Suggestion>(`/suggestions/${id}/dismiss`);
  return response;
}

/**
 * Delete a suggestion
 */
export async function deleteSuggestion(id: string): Promise<void> {
  await api.delete(`/suggestions/${id}`);
}

/**
 * Get suggestion counts by type
 */
export async function getSuggestionCounts(): Promise<SuggestionCounts> {
  const response = await api.get<SuggestionCounts>('/suggestions/counts');
  return response;
}

/**
 * Get user preferences including autonomous agents setting
 */
export async function getUserPreferences(): Promise<{
  preferences: { autonomousAgentsEnabled: boolean };
  user: { id: string; email: string; name: string };
}> {
  const response = await api.get<{
    preferences: { autonomousAgentsEnabled: boolean };
    user: { id: string; email: string; name: string }
  }>('/user/preferences');
  return response;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(preferences: {
  autonomousAgentsEnabled?: boolean;
}): Promise<{
  preferences: { autonomousAgentsEnabled: boolean };
  user: { id: string; email: string; name: string };
}> {
  const response = await api.patch<{
    preferences: { autonomousAgentsEnabled: boolean };
    user: { id: string; email: string; name: string }
  }>('/user/preferences', preferences);
  return response;
}

/**
 * Toggle autonomous agents setting
 */
export async function toggleAutonomousAgents(): Promise<{
  autonomousAgentsEnabled: boolean;
  message: string;
}> {
  const response = await api.post<{
    autonomousAgentsEnabled: boolean;
    message: string;
  }>('/user/preferences/toggle-agents');
  return response;
}
