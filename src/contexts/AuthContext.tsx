import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBaseUrl } from '@/lib/directus';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (tokens: { access_token: string; refresh_token?: string }) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'directus_access_token';
const REFRESH_KEY = 'directus_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const response = await fetch(`${getBaseUrl()}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (tokens: { access_token: string; refresh_token?: string }) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    }
    fetchUser();
    
    // Redirigir al admin después del login
    navigate('/admin');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}