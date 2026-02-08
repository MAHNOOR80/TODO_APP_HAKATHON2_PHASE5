import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  showImage?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  showImage = true
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-scale-in">
      {showImage && (
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 rounded-full flex items-center justify-center mb-6 glass-card">
          {icon || (
            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </div>
      )}
      <h3 className="text-lg font-medium text-dark-300 mb-2">{title}</h3>
      <p className="text-dark-400 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}