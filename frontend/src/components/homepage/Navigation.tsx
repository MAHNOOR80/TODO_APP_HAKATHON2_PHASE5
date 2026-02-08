import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Smooth scroll utility function with reduced motion support
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Home', href: '#top', isRoute: false },
    { label: 'Features', href: '#features', isRoute: false },
    { label: 'Sign In', href: '/signin', isRoute: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleScrollToSection('top')}
            className="text-2xl font-bold bg-button-gradient bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            TodoApp
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-dark-200 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleScrollToSection(item.href.replace('#', ''))}
                  className="text-dark-200 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          {/* Mobile Menu Toggle - Touch-friendly 44x44px */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-dark-200 hover:text-white transition-colors w-11 h-11 flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu with Slide Animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden mt-4 py-4 border-t border-dark-700"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: [0.4, 0, 0.2, 1] as const,
              }}
            >
              <div className="flex flex-col gap-4">
                {menuItems.map((item) =>
                  item.isRoute ? (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-dark-200 hover:text-white transition-colors py-2 min-h-[44px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => handleScrollToSection(item.href.replace('#', ''))}
                      className="text-dark-200 hover:text-white transition-colors text-left py-2 min-h-[44px] flex items-center"
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
