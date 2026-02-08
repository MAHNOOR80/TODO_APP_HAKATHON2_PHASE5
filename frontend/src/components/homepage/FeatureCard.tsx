import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors duration-200"
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.02,
              boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)',
            }
      }
      transition={{ duration: 0.2 }}
    >
      {/* Icon Container */}
      <div className="w-12 h-12 bg-button-gradient rounded-lg flex items-center justify-center mb-4">
        <Icon size={24} className="text-white" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-dark-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}
