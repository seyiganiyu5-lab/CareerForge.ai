'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AuthState, AuthResponse, LoginCredentials, SignupData, OnboardingData } from './types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<AuthResponse>;
  googleSignIn: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const isGET = !(options?.method && options.method !== 'GET' && options.method !== 'HEAD');
  const response = await fetch(url, {
    credentials: 'include',
    headers: isGET ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  return data;
}

// Cache session for 5 minutes to avoid refetching on every navigation
const SESSION_CACHE_TTL = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const lastFetchRef = useRef<number>(0);
  const hasFetchedRef = useRef(false);

  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now();
    // Skip if we recently fetched and not forcing
    if (!force && hasFetchedRef.current && (now - lastFetchRef.current) < SESSION_CACHE_TTL) {
      // Even when cached, still verify the current auth state is consistent
      return;
    }

    try {
      // Only show loading on the very first fetch (no cached data yet)
      if (!hasFetchedRef.current) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      lastFetchRef.current = now;
      hasFetchedRef.current = true;
      const data = await fetchAPI<{ user: AuthState['user'] } | { error: string }>('/api/auth/session');
      if ('user' in data && data.user) {
        setState({ user: data.user, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate session initialization on mount
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await fetchAPI<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.success && data.user) {
      // Invalidate session cache so the next refreshSession does a fresh check
      lastFetchRef.current = 0;
      hasFetchedRef.current = false;
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    }
    return data;
  }, []);

  const signup = useCallback(async (signupData: SignupData): Promise<AuthResponse> => {
    const data = await fetchAPI<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
    if (data.success && data.user) {
      // Invalidate session cache so the next refreshSession does a fresh check
      lastFetchRef.current = 0;
      hasFetchedRef.current = false;
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setState({ user: null, isLoading: false, isAuthenticated: false });
    lastFetchRef.current = 0;
    hasFetchedRef.current = false;
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return fetchAPI('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    return fetchAPI('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    return fetchAPI('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    return fetchAPI('/api/auth/verify-email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }, []);

  const completeOnboarding = useCallback(async (onboardingData: OnboardingData): Promise<AuthResponse> => {
    const data = await fetchAPI<AuthResponse>('/api/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
    if (data.success && data.user) {
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    }
    return data;
  }, []);

  const googleSignIn = useCallback((): void => {
    window.location.href = '/api/auth/google';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        completeOnboarding,
        googleSignIn,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}