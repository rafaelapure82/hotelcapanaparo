'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (newData: any) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const { data } = await api.post('/auth/login', { email, password: pass });
    const { access_token, user } = data;
    
    Cookies.set('auth_token', access_token, { expires: 7 });
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    setToken(access_token);
    setUser(user);
    
    // Redirect based on role
    if (user.roles.includes('admin') || user.roles.includes('partner')) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const register = async (regData: any) => {
    const { data } = await api.post('/auth/register', regData);
    const { access_token, user } = data;
    
    Cookies.set('auth_token', access_token, { expires: 7 });
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    setToken(access_token);
    setUser(user);
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const updateUser = (newData: any) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
