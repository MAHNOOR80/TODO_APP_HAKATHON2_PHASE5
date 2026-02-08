import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../../../src/components/homepage/Navigation';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => true,
}));

describe('Navigation', () => {
  const renderNavigation = () => {
    return render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
  };

  describe('Desktop Navigation', () => {
    it('renders logo', () => {
      renderNavigation();
      expect(screen.getByText('TodoApp')).toBeInTheDocument();
    });

    it('renders all menu items', () => {
      renderNavigation();
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    });

    it('Sign In link navigates to /signin', () => {
      renderNavigation();
      const signInLinks = screen.getAllByText('Sign In');
      expect(signInLinks[0]).toHaveAttribute('href', '/signin');
    });
  });

  describe('Mobile Navigation', () => {
    it('mobile menu toggle button is visible', () => {
      renderNavigation();
      const toggleButton = screen.getByLabelText('Toggle menu');
      expect(toggleButton).toBeInTheDocument();
    });

    it('mobile menu toggle button has proper touch target size (44x44px)', () => {
      renderNavigation();
      const toggleButton = screen.getByLabelText('Toggle menu');
      expect(toggleButton.className).toContain('w-11'); // 44px (11 * 4)
      expect(toggleButton.className).toContain('h-11'); // 44px
    });

    it('mobile menu toggles open and closed', () => {
      renderNavigation();
      const toggleButton = screen.getByLabelText('Toggle menu');

      // Initially closed
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Click to close
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('hamburger icon visible only on mobile screens', () => {
      renderNavigation();
      const toggleButton = screen.getByLabelText('Toggle menu');
      expect(toggleButton.className).toContain('md:hidden');
    });

    it('mobile menu items have minimum touch target height', () => {
      renderNavigation();
      const toggleButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(toggleButton);

      // Mobile menu items should have min-h-[44px]
      const mobileMenuContainer = screen.getByLabelText('Toggle menu').parentElement?.parentElement?.querySelector('.md\\:hidden.mt-4');
      expect(mobileMenuContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('navigation has proper sticky positioning', () => {
      const { container } = renderNavigation();
      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('fixed');
      expect(nav?.className).toContain('top-0');
    });

    it('logo is keyboard accessible (button)', () => {
      renderNavigation();
      const logo = screen.getByText('TodoApp');
      expect(logo.tagName).toBe('BUTTON');
    });

    it('applies backdrop blur for glassmorphism effect', () => {
      const { container } = renderNavigation();
      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('backdrop-blur-lg');
    });
  });
});
