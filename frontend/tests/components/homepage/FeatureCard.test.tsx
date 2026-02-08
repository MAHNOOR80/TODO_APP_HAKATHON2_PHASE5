import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zap } from 'lucide-react';
import { FeatureCard } from '../../../src/components/homepage/FeatureCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => true,
}));

describe('FeatureCard', () => {
  const mockProps = {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with instant task creation.',
  };

  it('renders icon, title, and description', () => {
    render(<FeatureCard {...mockProps} />);

    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
    expect(screen.getByText(/Experience blazing-fast performance/i)).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<FeatureCard {...mockProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-dark-800/50');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('border-dark-700');
  });

  it('makes icon decorative with aria-hidden', () => {
    const { container } = render(<FeatureCard {...mockProps} />);

    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('applies hover effect classes', () => {
    const { container } = render(<FeatureCard {...mockProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:border-primary-500/50');
    expect(card.className).toContain('transition-colors');
  });
});
