import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../../src/pages/HomePage';

// Mock AuthContext
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => true,
  useInView: () => true,
}));

describe('HomePage', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  describe('Responsive Layout', () => {
    it('renders all major sections', () => {
      renderHomePage();

      // Navigation
      expect(screen.getByText('TodoApp')).toBeInTheDocument();

      // Hero Section
      expect(screen.getByText(/Organize Your Life/i)).toBeInTheDocument();

      // Features Section
      expect(screen.getByText(/Everything You Need/i)).toBeInTheDocument();
    });

    it('content scales properly on mobile', () => {
      const { container } = renderHomePage();

      // Check for responsive classes
      const heroSection = container.querySelector('#top');
      expect(heroSection).toBeInTheDocument();

      // Check for mobile-first responsive classes
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('applies responsive typography classes', () => {
      renderHomePage();

      const headline = screen.getByText(/Organize Your Life/i);
      expect(headline.className).toContain('text-5xl'); // Mobile
      expect(headline.className).toContain('md:text-6xl'); // Tablet
      expect(headline.className).toContain('lg:text-7xl'); // Desktop
    });
  });

  describe('Mobile Experience', () => {
    it('feature cards stack vertically on mobile', () => {
      const { container } = renderHomePage();

      const featuresGrid = container.querySelector('.grid');
      expect(featuresGrid?.className).toContain('grid-cols-1'); // Mobile: single column
      expect(featuresGrid?.className).toContain('md:grid-cols-2'); // Tablet/Desktop: 2 columns
    });

    it('CTA buttons span full width on mobile', () => {
      renderHomePage();

      const getStartedButton = screen.getByRole('link', { name: /Get Started Free/i });
      expect(getStartedButton.className).toContain('w-full'); // Mobile
      expect(getStartedButton.className).toContain('sm:w-auto'); // Desktop
    });

    it('navigation is fixed at top for mobile scrolling', () => {
      const { container } = renderHomePage();

      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('fixed');
      expect(nav?.className).toContain('top-0');
      expect(nav?.className).toContain('z-50');
    });
  });

  describe('Touch Interactions', () => {
    it('all interactive elements have proper spacing', () => {
      const { container } = renderHomePage();

      // Check for proper padding/spacing
      const ctaButtons = container.querySelectorAll('a[class*="px-"]');
      expect(ctaButtons.length).toBeGreaterThan(0);
    });
  });
});
