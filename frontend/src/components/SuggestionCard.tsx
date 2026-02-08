/**
 * SuggestionCard Component
 * Displays a single agent suggestion with actions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import React from 'react';
import { Suggestion, SuggestionType } from '../services/suggestions.api';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDismiss: (id: string) => void;
  onViewTask?: (taskId: string) => void;
  isLoading?: boolean;
}

const suggestionTypeConfig: Record<
  SuggestionType,
  { label: string; icon: string; color: string }
> = {
  overdue_reminder: {
    label: 'Overdue',
    icon: '⏰',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  prioritization: {
    label: 'Priority',
    icon: '📊',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  schedule_adjustment: {
    label: 'Schedule',
    icon: '📅',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  neglected_task: {
    label: 'Neglected',
    icon: '💤',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  general_insight: {
    label: 'Insight',
    icon: '💡',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onDismiss,
  onViewTask,
  isLoading = false,
}) => {
  const typeConfig = suggestionTypeConfig[suggestion.suggestionType];

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
        suggestion.dismissed ? 'opacity-60' : ''
      } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}
          >
            <span>{typeConfig.icon}</span>
            <span>{typeConfig.label}</span>
          </span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(suggestion.createdAt)}
          </span>
        </div>
        {!suggestion.dismissed && (
          <button
            onClick={() => onDismiss(suggestion.id)}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Dismiss suggestion"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Message */}
      <p className="text-gray-700 text-sm mb-3">{suggestion.message}</p>

      {/* Task Link */}
      {suggestion.task && onViewTask && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onViewTask(suggestion.task!.id)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            View Task: {suggestion.task.title}
          </button>
          {suggestion.task.completed && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Completed
            </span>
          )}
        </div>
      )}

      {/* Dismissed indicator */}
      {suggestion.dismissed && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Dismissed
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
