/**
 * Premium Spinner Component
 * Reusable loading spinner with glassmorphism and gradient effects
 */

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'default', className = '' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    default: 'spinner',
    gradient: 'animate-spin rounded-full border-2 border-transparent border-t-primary-500',
    pulse: 'animate-pulse rounded-full bg-primary-500/20',
  };

  const spinnerClasses = [
    sizeClasses[size],
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={spinnerClasses}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
