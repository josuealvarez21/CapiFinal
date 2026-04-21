"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('capi_token');
        if (savedToken) {
          setToken(savedToken);
          setUser({ email: 'usuario@ejemplo.com' }); // Placeholder
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (newToken: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('capi_token', newToken);
      }
      setToken(newToken);
      setUser({ email: 'usuario@ejemplo.com' }); // Placeholder
      
      // Give state a tiny moment to settle before redirecting
      setTimeout(() => {
        router.replace('/');
      }, 10);
    } catch (err) {
      console.error("Error saving token:", err);
    }
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('capi_token');
      }
      setToken(null);
      setUser(null);
      router.replace('/login');
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
