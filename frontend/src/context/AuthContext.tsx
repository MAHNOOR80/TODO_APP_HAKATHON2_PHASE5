import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { getCurrentUser } from '../services/auth.api';

/**
 * Authentication Context
 * Manages user authentication state across the app
 */

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to block rendering

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[AuthContext] Checking for existing session...');
        // Ensure getCurrentUser() in your API service has credentials: 'include'
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log('[AuthContext] Session found, user:', currentUser.email);
          setUser(currentUser);
        } else {
           console.log('[AuthContext] No session found (user is null)');
           setUser(null);
        }
      } catch (error) {
        console.log('[AuthContext] No valid session found', error);
        setUser(null);
      } finally {
        // Crucial: Stop loading whether we found a user or failed
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: User) => {
    console.log('[AuthContext] User logged in:', userData.email);
    setUser(userData);
  };

  const logout = () => {
    console.log('[AuthContext] User logged out');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  // --- CRITICAL FIX: PREVENT RENDERING UNTIL SESSION CHECK IS DONE ---
  // This prevents ProtectedRoute from redirecting you to login before we know who you are.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900 text-dark-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}