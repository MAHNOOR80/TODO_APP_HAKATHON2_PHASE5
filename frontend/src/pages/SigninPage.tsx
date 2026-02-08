import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { signin } from '../services/auth.api';
import { SigninFormData } from '../types/auth.types';

/**
 * Signin Page
 * User login form
 */

export function SigninPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<SigninFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<SigninFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<SigninFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const user = await signin({
        email: formData.email,
        password: formData.password,
      });

      login(user);
      navigate('/dashboard');
    } catch (error: any) {
      setApiError(error.message || 'Invalid email or password');
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
              Welcome back
            </h2>
            <p className="text-dark-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign up
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
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              autoComplete="current-password"
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-dark-500 text-sm">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
