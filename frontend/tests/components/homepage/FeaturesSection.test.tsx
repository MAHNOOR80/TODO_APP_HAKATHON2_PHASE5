import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../../../src/components/homepage/FeaturesSection';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useReducedMotion: () => true,
  useInView: () => true,
}));

describe('FeaturesSection', () => {
  it('renders section heading', () => {
    render(<FeaturesSection />);

    expect(screen.getByText(/Everything You Need to/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay Organized/i)).toBeInTheDocument();
  });

  it('renders all 4 feature cards', () => {
    render(<FeaturesSection />);

    expect(screen.getByText('Smart Task Management')).toBeInTheDocument();
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Deadline Management')).toBeInTheDocument();
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesSection />);

    expect(screen.getByText(/Create, organize, and prioritize tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Visualize your productivity/i)).toBeInTheDocument();
    expect(screen.getByText(/Never miss a deadline/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience blazing-fast performance/i)).toBeInTheDocument();
  });

  it('has id="features" for navigation', () => {
    const { container } = render(<FeaturesSection />);

    const section = container.querySelector('#features');
    expect(section).toBeInTheDocument();
  });

  it('applies responsive grid layout classes', () => {
    const { container } = render(<FeaturesSection />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('renders section subheading', () => {
    render(<FeaturesSection />);

    expect(
      screen.getByText(/Powerful features designed to help you manage tasks/i)
    ).toBeInTheDocument();
  });
});
