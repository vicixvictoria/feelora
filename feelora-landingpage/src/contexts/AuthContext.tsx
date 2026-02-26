import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Amplify } from 'aws-amplify';
import { amplifyConfig, therapistAmplifyConfig } from '@/config/amplify';
import { setApolloAccessToken } from '@/lib/apolloClient';

// --- CONFIGURATION ---
// Must Point to backend URL
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com';

// Refresh token before it expires (e.g., at 55 minutes of a 60 min token)
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
  groups?: string[]; //remove ? for better RBAC
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (type: 'user' | 'therapist', redirectPath?: string) => void;
  logout: (type: 'user' | 'therapist') => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  } catch (e) {
    console.error('Failed to decode token', e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  {
    /*Mock-User for testing without login flow. Remove this and uncomment the real state for production.*/
  }
  /*const [user, setUser] = useState<User | null>({
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test',
    familyName: 'User',
    groups: ['type:U'] // Matches the schema's requirement for matchingAlgorithm
  });
  const [accessToken, setAccessToken] = useState<string | null>('fake-token');
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); */

  //comment out for testing to not use real authentication flow
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initRef = useRef(false);

  // --- ACTIONS ---

  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setApolloAccessToken(null); // Clear Apollo token
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Helper function to set auth state from tokens
  const setAuthState = useCallback((access: string, idToken: string) => {
    setAccessToken(access);
    setApolloAccessToken(access); // Sync token to Apollo Client
    const parsedUser = parseUserFromToken(idToken); // Decode ID token for user info
    setUser(parsedUser);

    // --- UPDATED: Treat BOTH 'type:T' and 'type:P' as therapists ---
    // Check if the user is a confirmed therapist (type:T) OR a pending therapist (type:P)
    const isTherapist =
      parsedUser?.groups?.includes('type:T') || parsedUser?.groups?.includes('type:P');

    if (isTherapist) {
      // Both confirmed and pending therapists belong to the Therapist User Pool
      Amplify.configure(therapistAmplifyConfig);
      console.log('[Amplify] Configured for Therapist Pool (type:T or type:P)');
    } else {
      // Default to standard config for patients (type:U)
      Amplify.configure(amplifyConfig);
      console.log('[Amplify] Configured for Standard User Pool');
    }
  }, []);

  // 1. LOGIN: Redirects browser to Backend -> Cognito
  const login = useCallback((type: 'user' | 'therapist', redirectPath?: string) => {
    // Pre-configure ammplify so that the logout/login flow matches the intended client
    Amplify.configure(type === 'therapist' ? therapistAmplifyConfig : amplifyConfig); // Ensure correct Amplify config is set before login

    const currentPath = redirectPath || window.location.pathname;

    // Redirect to backend login endpoint - for testing use fullRedirectUrl, otheriwse use currentPath
    window.location.href = `${AUTH_API_URL}/auth/login?type=${type}&redirect=${encodeURIComponent(currentPath)}`;
  }, []);

  // 2. EXCHANGE: Swaps Session ID (from URL) for Tokens
  const exchangeSessionForTokens = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        const response = await fetch(`${AUTH_API_URL}/auth/exchange`, {
          method: 'POST',
          credentials: 'include', // Crucial: Sends cookies if any
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Session exchange failed');
        }

        const data = await response.json();
        setAuthState(data.accessToken, data.idToken);
        return true;
      } catch (err) {
        console.error('[Auth] Exchange error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        return false;
      }
    },
    [setAuthState],
  );

  // 3. REFRESH: Use HttpOnly cookie to get new Access Token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // Browser automatically attaches the HttpOnly 'refreshToken' cookie
      const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // If 401, cookie is invalid/expired -> User is logged out
        if (response.status === 401) {
          clearAuthState();
          return false;
        }
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setAuthState(data.accessToken, data.idToken);
      return true;
    } catch (err) {
      console.error('[Auth] Refresh error:', err);
      clearAuthState();
      return false;
    }
  }, [clearAuthState, setAuthState]);

  // Timer to silently refresh token before it expires
  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);
  }, [refreshToken]);

  // 4. LOGOUT
  const logout = useCallback(
    async (type: 'user' | 'therapist') => {
      try {
        // 1. Call Backend to clear the 'refreshToken' cookie
        await fetch(`${AUTH_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Sends the cookie to be deleted
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Logout failed error:', err);
        // Continue to redirect anyway so the user isn't stuck
      } finally {
        clearAuthState(); // 2. Clear frontend State (memory)

        // 3. Redirect to Cognito logout endpoint
        const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
        const clientId =
          type === 'therapist'
            ? import.meta.env.VITE_THERAPIST_POOL_CLIENT_ID
            : import.meta.env.VITE_USER_POOL_CLIENT_ID;
        const logoutUri = import.meta.env.VITE_AMPLIFY_URL || window.location.origin;

        const cognitoLogoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
        window.location.href = cognitoLogoutUrl;
      }
    },
    [clearAuthState],
  );

  const clearError = useCallback(() => setError(null), []);

  // --- INITIALIZATION (The "Engine") ---
  useEffect(() => {
    //setIsLoading(false); return; //bypass auth for testing. Remove this line to enable real authentication flow.

    if (initRef.current) return;
    initRef.current = true;

    async function initAuth() {
      setIsLoading(true);

      // Check URL for session (Callback from Cognito)
      const searchParams = new URLSearchParams(window.location.search);
      const sessionId = searchParams.get('session');
      const authError = searchParams.get('error');

      if (authError) {
        setError(decodeURIComponent(authError));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setIsLoading(false);
        return;
      }

      // #A: Returning from Login (Exchange Session)
      if (sessionId) {
        const success = await exchangeSessionForTokens(sessionId);

        // Clean URL: Remove session ID so it can't be reused/seen
        window.history.replaceState({}, '', window.location.pathname);

        if (success) {
          startRefreshTimer();
        }
      }
      // #B: Page Reload: Try Refresh Cookie
      else {
        const success = await refreshToken();
        if (success) {
          startRefreshTimer();
        }
      }

      setIsLoading(false);
    }

    initAuth();

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [exchangeSessionForTokens, refreshToken, startRefreshTimer]);

  const value = {
    user,
    accessToken,
    //isAuthenticated: true,  // For testing purposes, set this to true. In production, it should be !!user or a more robust check.
    isAuthenticated: !!user, // Simple boolean check
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
