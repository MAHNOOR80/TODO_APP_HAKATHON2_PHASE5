/**
 * SuggestionsContainer Component
 * Container for managing and displaying suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import React, { useState } from 'react';
import { SuggestionCard } from '../components/SuggestionCard';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionType } from '../services/suggestions.api';

interface SuggestionsContainerProps {
  onViewTask?: (taskId: string) => void;
}

const suggestionTypes: { value: SuggestionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overdue_reminder', label: 'Overdue' },
  { value: 'prioritization', label: 'Priority' },
  { value: 'neglected_task', label: 'Neglected' },
  { value: 'general_insight', label: 'Insights' },
];

export const SuggestionsContainer: React.FC<SuggestionsContainerProps> = ({
  onViewTask,
}) => {
  const [selectedType, setSelectedType] = useState<SuggestionType | 'all'>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  const {
    suggestions,
    counts,
    total,
    isLoading,
    error,
    hasMore,
    fetchSuggestions,
    dismissSuggestion,
    loadMore,
    refresh,
  } = useSuggestions({
    dismissed: showDismissed,
    type: selectedType === 'all' ? undefined : selectedType,
  });

  const handleTypeChange = (type: SuggestionType | 'all') => {
    setSelectedType(type);
    fetchSuggestions({
      offset: 0,
      type: type === 'all' ? undefined : type,
      dismissed: showDismissed,
    });
  };

  const handleDismissedToggle = () => {
    const newShowDismissed = !showDismissed;
    setShowDismissed(newShowDismissed);
    fetchSuggestions({
      offset: 0,
      type: selectedType === 'all' ? undefined : selectedType,
      dismissed: newShowDismissed,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Suggestions</h2>
          <p className="text-sm text-gray-500">
            {counts ? `${counts.total} active suggestions` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
        >
          <span className="flex items-center gap-1">
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {suggestionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
              {counts && type.value !== 'all' && (
                <span className="ml-1 opacity-75">
                  ({counts.byType[type.value as SuggestionType] || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Show dismissed toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={handleDismissedToggle}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show dismissed
        </label>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && suggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No suggestions yet
          </h3>
          <p className="text-gray-500">
            {showDismissed
              ? 'No dismissed suggestions to show.'
              : 'Our AI agents are monitoring your tasks and will provide suggestions when needed.'}
          </p>
        </div>
      )}

      {/* Suggestions list */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onDismiss={dismissSuggestion}
            onViewTask={onViewTask}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : `Load more (${total - suggestions.length} remaining)`}
          </button>
        </div>
      )}

      {/* Summary counts */}
      {counts && counts.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>
              <strong className="text-gray-700">{counts.byType.overdue_reminder}</strong> overdue
            </span>
            <span>
              <strong className="text-gray-700">{counts.byType.prioritization}</strong> priority
            </span>
            <span>
              <strong className="text-gray-700">{counts.byType.neglected_task}</strong> neglected
            </span>
            <span>
              <strong className="text-gray-700">{counts.byType.general_insight}</strong> insights
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsContainer;
