import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Feature data array
  const features = [
    {
      icon: CheckCircle2,
      title: 'Smart Task Management',
      description:
        'Create, organize, and prioritize tasks effortlessly. Stay on top of your to-do list with intelligent task suggestions and categorization.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description:
        'Visualize your productivity with detailed analytics and progress tracking. Monitor completion rates and identify patterns in your workflow.',
    },
    {
      icon: Calendar,
      title: 'Deadline Management',
      description:
        'Never miss a deadline again. Set due dates, receive timely reminders, and prioritize tasks based on urgency and importance.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description:
        'Experience blazing-fast performance with instant task creation, real-time updates, and seamless synchronization across all your devices.',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-20 px-6 bg-gradient-to-b from-dark-900 to-dark-800"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={
            isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: shouldReduceMotion ? 0 : 20 }
          }
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-button-gradient bg-clip-text text-transparent">
              Stay Organized
            </span>
          </h2>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Powerful features designed to help you manage tasks efficiently and achieve your goals faster.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
