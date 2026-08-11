'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { lxcWebUrl } from './lxc-api-base';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'driver'
  | 'student'
  | 'teacher'
  | 'parent'
  | 'admin'
  | 'superadmin'
  | 'account'
  | 'transport'
  | 'forum_user'

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  schoolId?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** "loading" | "authenticated" | "unauthenticated" — mirrors NextAuth status shape */
  status: 'loading' | 'authenticated' | 'unauthenticated';
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_KEY = '@lxc_ai_user';
const TOKEN_KEY = '@lxc_ai_token';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
      }
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  /**
   * login — mirrors mobile app's auth-context.
   * Hits POST /api/auth/mobile-sign-in on the web app (port 3000) which
   * validates credentials against the same DB and returns a 7-day JWT.
  */
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch(lxcWebUrl('/api/auth/mobile-sign-in'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    if (!data.accessToken || !data.user) {
      throw new Error('Invalid response from server.');
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role as UserRole,
      name: data.user.name,
      schoolId: data.user.schoolId ?? null,
    };

    try {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch {
      /* ignore storage errors */
    }

    setToken(data.accessToken);
    setUser(authUser);
    setStatus('authenticated');
    return authUser;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, token, login, logout }),
    [user, status, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * getStoredToken — server-safe helper for API calls that need the bearer token.
 * Returns null during SSR.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
