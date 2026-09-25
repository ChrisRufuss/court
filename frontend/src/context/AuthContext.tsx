import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lexanalyze_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      full_name: 'Advocate Rajesh Sharma',
      email: 'r.sharma@lexanalyze.law',
      role: 'Senior Advocate'
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('lexanalyze_token') || 'demo_jwt_token_2026';
  });

  const login = async (email: string, pass: string) => {
    const mockUser: User = {
      id: 1,
      full_name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Senior Advocate'
    };
    setUser(mockUser);
    setToken('demo_jwt_token_2026');
    localStorage.setItem('lexanalyze_user', JSON.stringify(mockUser));
    localStorage.setItem('lexanalyze_token', 'demo_jwt_token_2026');
  };

  const register = async (name: string, email: string, pass: string) => {
    const newUser: User = {
      id: 2,
      full_name: name,
      email,
      role: 'Advocate'
    };
    setUser(newUser);
    setToken('demo_jwt_token_2026');
    localStorage.setItem('lexanalyze_user', JSON.stringify(newUser));
    localStorage.setItem('lexanalyze_token', 'demo_jwt_token_2026');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lexanalyze_user');
    localStorage.removeItem('lexanalyze_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
