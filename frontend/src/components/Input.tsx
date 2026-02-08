import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * Premium Input Component
 * Reusable input field with glassmorphism styling
 */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    variant = 'default',
    size = 'md',
    className = '',
    icon,
    iconPosition = 'left',
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm px-4 py-2',
      md: 'text-base px-4 py-3',
      lg: 'text-lg px-4 py-4',
    };

    const variantClasses = {
      default: 'input-base',
      outline: 'w-full px-4 py-3 rounded-xl border border-dark-600 bg-transparent text-dark-50 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      filled: 'w-full px-4 py-3 rounded-xl bg-dark-800/80 text-dark-50 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border border-transparent',
    };

    const inputClasses = [
      variantClasses[variant],
      sizeClasses[size],
      error ? 'border-danger-500 focus:ring-danger-500' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-dark-400">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-dark-400">{icon}</span>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-dark-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
