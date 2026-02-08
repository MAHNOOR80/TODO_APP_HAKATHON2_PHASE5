import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const floatingAnimation = shouldReduceMotion
    ? {}
    : {
        animate: {
          y: [-10, 10, -10],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1] as const,
          },
        },
      };

  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-hero-gradient"
    >
      {/* Floating Background Shapes */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"
        {...floatingAnimation}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"
        animate={
          shouldReduceMotion
            ? {}
            : {
                y: [10, -10, 10],
                transition: {
                  duration: 8,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1] as const,
                },
              }
        }
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 backdrop-blur-sm border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium">
            <Sparkles size={16} className="text-primary-400" />
            Premium Task Management
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Organize Your Life,{' '}
          <span className="bg-button-gradient bg-clip-text text-transparent">
            One Task at a Time
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-dark-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Experience the power of modern task management. Stay organized, track
          progress, and achieve your goals with our beautifully designed todo app.
        </motion.p>

        {/* CTA Buttons - Touch-friendly on mobile (44x44px minimum) */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA - Get Started */}
          <Link
            to="/signup"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[44px] bg-button-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-glow transition-all duration-200 hover:scale-105 w-full sm:w-auto"
          >
            Get Started Free
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          {/* Secondary CTA - Sign In */}
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[44px] bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-200 font-semibold rounded-lg hover:bg-dark-700/50 hover:border-dark-500 hover:text-white transition-all duration-200 w-full sm:w-auto"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Trust Indicators (optional) */}
        <motion.div
          variants={fadeInUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-dark-400"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Setup in 2 minutes</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
