import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navigation } from '../components/homepage/Navigation';
import { HeroSection } from '../components/homepage/HeroSection';
import { FeaturesSection } from '../components/homepage/FeaturesSection';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to /dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
