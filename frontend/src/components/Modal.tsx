import { ReactNode, useEffect } from 'react';
import { Button } from './Button';

/**
 * Premium Modal Component
 * Reusable modal dialog with glassmorphism and smooth animations
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen && closeOnEscape) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-fade-in"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto animate-scale-in`}>
        <div className="glass-card-hover bg-dark-800/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-primary-500/10">
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-dark-700">
            <h2
              id="modal-title"
              className="text-xl sm:text-2xl font-bold text-dark-50 gradient-text"
            >
              {title}
            </h2>
            {showCloseButton && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="p-2 min-h-[auto] min-w-[auto] hover:bg-dark-700/50"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
