import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { signup } from '../services/auth.api';
import { SignupFormData } from '../types/auth.types';

/**
 * Premium Signup Page
 * User registration form with glassmorphism and gradient effects
 */

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
      });

      login(user);
      navigate('/dashboard');
    } catch (error: any) {
      setApiError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-50 mb-2">
            <span className="gradient-text">TaskFlow</span>
          </h1>
          <p className="text-dark-400">Your productivity companion</p>
        </div>

        <div className="glass-card-hover p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-dark-50 mb-2">
              Create your account
            </h2>
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {apiError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 animate-shake">
                <p className="text-red-400 text-sm">{apiError}</p>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              autoComplete="email"
              variant="default"
              size="md"
            />

            <Input
              label="Name (optional)"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoComplete="name"
              variant="default"
              size="md"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              autoComplete="new-password"
              variant="default"
              size="md"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              variant="default"
              size="md"
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              size="lg"
              className="mt-4"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-dark-500 text-sm">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
