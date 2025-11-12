"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'attendee' | 'presenter' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  iat?: number;
  exp?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const decoded = jwtDecode<User>(token);
      
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('[useAuth] Token expirado');
        document.cookie = 'auth-token=; Max-Age=0; path=/;';
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('[useAuth] Usuario autenticado:', decoded);
      setUser(decoded);
      setLoading(false);
    } catch (error) {
      console.error('[useAuth] Error al verificar autenticación:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Limpiar el token
      document.cookie = 'auth-token=; Max-Age=0; path=/;';
      localStorage.removeItem('authToken');
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('[useAuth] Error al cerrar sesión:', error);
      document.cookie = 'auth-token=; Max-Age=0; path=/;';
      localStorage.removeItem('authToken');
      setUser(null);
      router.push('/login');
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    checkAuth,
  };
}