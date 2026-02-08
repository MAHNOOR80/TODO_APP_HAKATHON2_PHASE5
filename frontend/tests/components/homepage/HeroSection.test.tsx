import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from '../../../src/components/homepage/HeroSection';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useReducedMotion: () => true, // Always return true in tests to disable animations
}));

describe('HeroSection', () => {
  const renderHeroSection = () => {
    return render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
  };

  describe('Content Rendering', () => {
    it('renders headline with correct text', () => {
      renderHeroSection();

      const headline = screen.getByText(/Organize Your Life/i);
      expect(headline).toBeInTheDocument();
      expect(headline.tagName).toBe('H1');
    });

    it('renders headline with gradient text', () => {
      renderHeroSection();

      const gradientText = screen.getByText(/One Task at a Time/i);
      expect(gradientText).toBeInTheDocument();
    });

    it('renders subheading with correct text', () => {
      renderHeroSection();

      const subheading = screen.getByText(/Experience the power of modern task management/i);
      expect(subheading).toBeInTheDocument();
    });

    it('renders premium badge', () => {
      renderHeroSection();

      const badge = screen.getByText(/Premium Task Management/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('renders "Get Started Free" CTA button', () => {
      renderHeroSection();

      const getStartedButton = screen.getByRole('link', { name: /Get Started Free/i });
      expect(getStartedButton).toBeInTheDocument();
    });

    it('"Get Started" button navigates to /signup', () => {
      renderHeroSection();

      const getStartedButton = screen.getByRole('link', { name: /Get Started Free/i });
      expect(getStartedButton).toHaveAttribute('href', '/signup');
    });

    it('renders "Sign In" CTA button', () => {
      renderHeroSection();

      const signInButton = screen.getByRole('link', { name: /^Sign In$/i });
      expect(signInButton).toBeInTheDocument();
    });

    it('"Sign In" button navigates to /signin', () => {
      renderHeroSection();

      const signInButton = screen.getByRole('link', { name: /^Sign In$/i });
      expect(signInButton).toHaveAttribute('href', '/signin');
    });

    it('applies correct styling to primary CTA button', () => {
      renderHeroSection();

      const getStartedButton = screen.getByRole('link', { name: /Get Started Free/i });
      expect(getStartedButton.className).toContain('bg-button-gradient');
      expect(getStartedButton.className).toContain('hover:scale-105');
    });
  });

  describe('Accessibility', () => {
    it('respects reduced motion preference', () => {
      // useReducedMotion is mocked to return true
      renderHeroSection();

      // Component should render without animation errors
      const headline = screen.getByText(/Organize Your Life/i);
      expect(headline).toBeInTheDocument();
    });

    it('has proper semantic HTML structure', () => {
      renderHeroSection();

      // Check for section element
      const section = screen.getByRole('region', { hidden: true });
      expect(section).toBeInTheDocument();
    });

    it('displays trust indicators', () => {
      renderHeroSection();

      expect(screen.getByText(/Free forever plan/i)).toBeInTheDocument();
      expect(screen.getByText(/No credit card required/i)).toBeInTheDocument();
      expect(screen.getByText(/Setup in 2 minutes/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies responsive text size classes', () => {
      renderHeroSection();

      const headline = screen.getByText(/Organize Your Life/i);
      expect(headline.className).toContain('text-5xl'); // Mobile
      expect(headline.className).toContain('md:text-6xl'); // Tablet
      expect(headline.className).toContain('lg:text-7xl'); // Desktop
    });

    it('applies responsive button layout classes', () => {
      renderHeroSection();

      const buttonContainer = screen.getByRole('link', { name: /Get Started Free/i }).parentElement;
      expect(buttonContainer?.className).toContain('flex-col');
      expect(buttonContainer?.className).toContain('sm:flex-row');
    });
  });

  describe('Visual Elements', () => {
    it('renders with hero gradient background', () => {
      renderHeroSection();

      const section = screen.getByRole('region', { hidden: true });
      expect(section.className).toContain('bg-hero-gradient');
    });

    it('renders with proper spacing and padding', () => {
      renderHeroSection();

      const section = screen.getByRole('region', { hidden: true });
      expect(section.className).toContain('px-6');
      expect(section.className).toContain('py-20');
    });
  });
});
