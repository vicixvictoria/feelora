import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

// Auth API base URL
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com/';

// Token refresh interval (55 minutes - refresh before 60 min expiry)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  family_name?: string;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  exp: number;
  iat: number;
}

interface User {
  id: string;
  email?: string;
  name?: string;
  familyName?: string;
  username?: string;
  groups?: string[];
}

interface AuthContextType {
  // State
  user: User | null;
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (type: 'user' | 'therapist', redirectPath?: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Parse user info from JWT token
 */
function parseUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      familyName: decoded.family_name,
      username: decoded['cognito:username'],
      groups: decoded['cognito:groups'],
    };
  } catch {
    console.error('Failed to decode token');
    return null;
  }
}

/**
 * Check if token is expired (with 1 minute buffer)
 */
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime - 60000; // 1 minute buffer
  } catch {
    return true;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initRef = useRef(false); // Prevent double initialization

  /**
   * Clear all auth state
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIdToken(null);
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Set auth state from tokens
   */
  const setAuthState = useCallback((access: string, id: string) => {
    setAccessToken(access);
    setIdToken(id);
    const parsedUser = parseUserFromToken(id);
    setUser(parsedUser);
  }, []);

  /**
   * Refresh the access token using the HttpOnly refresh cookie
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token expired, clear state
          clearAuthState();
          return false;
        }
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setAuthState(data.accessToken, data.idToken);
      return true;
    } catch (err) {
      console.error('Token refresh error:', err);
      clearAuthState();
      return false;
    }
  }, [clearAuthState, setAuthState]);

  /**
   * Start the token refresh timer
   */
  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);
  }, [refreshToken]);

  /**
   * Exchange session ID for tokens (called after OAuth callback)
   */
  const exchangeSessionForTokens = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      console.log('[Auth] Calling exchange API:', `${AUTH_API_URL}/auth/exchange`);
      const response = await fetch(`${AUTH_API_URL}/auth/exchange`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: sessionId }),
      });

      console.log('[Auth] Exchange response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Auth] Exchange error:', errorData);
        throw new Error(errorData.error || 'Session exchange failed');
      }

      const data = await response.json();
      console.log('[Auth] Exchange success, got tokens');
      setAuthState(data.accessToken, data.idToken);
      startRefreshTimer();
      return true;
    } catch (err) {
      console.error('[Auth] Session exchange error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return false;
    }
  }, [setAuthState, startRefreshTimer]);

  /**
   * Initialize auth state on mount
   * Try to refresh token using existing HttpOnly cookie
   */
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initRef.current) return;
    initRef.current = true;

    async function initAuth() {
      setIsLoading(true);
      console.log('[Auth] Initializing auth...');
      
      // Check for session in URL (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      const authError = urlParams.get('error');
      
      console.log('[Auth] URL params - session:', sessionId?.substring(0, 8), 'error:', authError);
      
      if (authError) {
        setError(decodeURIComponent(authError));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setIsLoading(false);
        return;
      }
      
      if (sessionId) {
        console.log('[Auth] Exchanging session for tokens...');
        // Exchange session ID for tokens
        const success = await exchangeSessionForTokens(sessionId);
        console.log('[Auth] Exchange result:', success);
        // Clean URL regardless of result
        window.history.replaceState({}, '', window.location.pathname);
        if (success) {
          setIsLoading(false);
          return;
        }
      }
      
      // Try to refresh using existing cookie
      console.log('[Auth] Trying to refresh with cookie...');
      const success = await refreshToken();
      console.log('[Auth] Refresh result:', success);
      if (success) {
        startRefreshTimer();
      }
      
      setIsLoading(false);
    }

    initAuth();

    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [exchangeSessionForTokens, refreshToken, startRefreshTimer]);

  /**
   * Redirect to login
   */
  const login = useCallback((type: 'user' | 'therapist', redirectPath?: string) => {
    const currentPath = redirectPath || window.location.pathname;
    const loginUrl = `${AUTH_API_URL}/auth/login?type=${type}&redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }, []);

  /**
   * Logout - clear cookies and state
   */
  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    idToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get just the access token (for API calls)
 */
export function useAccessToken(): string | null {
  const { accessToken } = useAuth();
  return accessToken;
}

/**
 * Hook to check if user is in a specific group
 */
export function useHasGroup(group: string): boolean {
  const { user } = useAuth();
  return user?.groups?.includes(group) ?? false;
}
