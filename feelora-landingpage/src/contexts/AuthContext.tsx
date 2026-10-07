// PORTFOLIO DEMO MODE: the auth backend and Cognito are offline. The real
// login / session exchange / token refresh / logout flow is commented out
// below (not deleted); the demo AuthProvider at the bottom of this file logs
// in the demo accounts instead — any /therapist/* URL is Dr. Eva Eddison and
// any /patient/* URL is Nina Newton.
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { Amplify } from 'aws-amplify';
// import { amplifyConfig, therapistAmplifyConfig } from '@/config/amplify';
// import i18n from '@/i18n/config';
import { setApolloAccessToken } from '@/lib/apollo-client';
import { db, setDemoRole } from '@/mocks/demo-store';
import { EVA_ID, NINA_ID } from '@/mocks/demo-data';

// // --- CONFIGURATION ---
// // Must Point to backend URL
// const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com';
// const AUTH_TYPE_STORAGE_KEY = 'feelora_auth_type';
//
// // Refresh token before it expires (e.g., at 55 minutes of a 60 min token)
// const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;
//
// interface DecodedToken {
//   sub: string;
//   email?: string;
//   name?: string;
//   family_name?: string;
//   'cognito:username'?: string;
//   'cognito:groups'?: string[];
//   exp: number;
//   iat: number;
// }

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
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (type: 'user' | 'therapist', redirectPath?: string) => void;
  logout: (type: 'user' | 'therapist') => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

type AuthType = 'user' | 'therapist';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// function parseUserFromToken(token: string): User | null {
//   try {
//     const decoded = jwtDecode<DecodedToken>(token);
//     return {
//       id: decoded.sub,
//       email: decoded.email,
//       name: decoded.name,
//       familyName: decoded.family_name,
//       username: decoded['cognito:username'],
//       groups: decoded['cognito:groups'],
//     };
//   } catch (e) {
//     console.error('Failed to decode token', e);
//     return null;
//   }
// }
//
// function getAuthTypeFromGroups(groups?: string[]): AuthType {
//   const isTherapist = groups?.includes('type:T') || groups?.includes('type:P');
//   return isTherapist ? 'therapist' : 'user';
// }
//
// function getAuthTypeFromPath(pathname: string): AuthType | null {
//   if (pathname.startsWith('/therapist') || pathname === '/loginTherapist') {
//     return 'therapist';
//   }
//   if (pathname.startsWith('/patient') || pathname === '/login') {
//     return 'user';
//   }
//   return null;
// }
//
// const IS_LOCAL_AUTH = import.meta.env.VITE_AUTH_MODE === 'local';
//
// function buildLocalMockUser(): User {
//   const groups = (import.meta.env.VITE_LOCAL_USER_GROUPS || 'type:U')
//     .split(',')
//     .map((g: string) => g.trim());
//   return {
//     id: 'local-dev-user',
//     email: 'dev@localhost',
//     name: 'Local',
//     familyName: 'Dev',
//     username: 'local-dev',
//     groups,
//   };
// }
//
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   // Local auth mode: skip OAuth, use mock user + test token from env
//   if (IS_LOCAL_AUTH) {
//     const mockUser = buildLocalMockUser();
//     const testToken = import.meta.env.VITE_TEST_AUTH_TOKEN || 'local-dev-token';
//     setApolloAccessToken(testToken);
//
//     const value: AuthContextType = {
//       user: mockUser,
//       accessToken: testToken,
//       idToken: testToken,
//       isAuthenticated: true,
//       isLoading: false,
//       error: null,
//       login: () => {},
//       logout: async () => {
//         window.location.reload();
//       },
//       refreshToken: async () => true,
//       clearError: () => {},
//     };
//
//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
//   }
//
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [idToken, setIdToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const initRef = useRef(false);
//   const authTypeRef = useRef<AuthType>('user');
//
//   // --- ACTIONS ---
//
//   const clearAuthState = useCallback(() => {
//     setUser(null);
//     setAccessToken(null);
//     setIdToken(null);
//     setApolloAccessToken(null); // Clear Apollo token
//     if (refreshTimerRef.current) {
//       clearInterval(refreshTimerRef.current);
//       refreshTimerRef.current = null;
//     }
//   }, []);
//
//   // Helper function to set auth state from tokens
//   const setAuthState = useCallback((access: string, idTokenStr: string) => {
//     setAccessToken(access);
//     setIdToken(idTokenStr);
//     setApolloAccessToken(access); // Sync token to Apollo Client
//     const parsedUser = parseUserFromToken(idTokenStr); // Decode ID token for user info
//     setUser(parsedUser);
//
//     const authType = getAuthTypeFromGroups(parsedUser?.groups);
//     authTypeRef.current = authType;
//     sessionStorage.setItem(AUTH_TYPE_STORAGE_KEY, authType);
//
//     // --- UPDATED: Treat BOTH 'type:T' and 'type:P' as therapists ---
//     // Check if the user is a confirmed therapist (type:T) OR a pending therapist (type:P)
//     const isTherapist =
//       parsedUser?.groups?.includes('type:T') || parsedUser?.groups?.includes('type:P');
//
//     if (isTherapist) {
//       // Both confirmed and pending therapists belong to the Therapist User Pool
//       Amplify.configure(therapistAmplifyConfig);
//       console.log('[Amplify] Configured for Therapist Pool (type:T or type:P)');
//     } else {
//       // Default to standard config for patients (type:U)
//       Amplify.configure(amplifyConfig);
//       console.log('[Amplify] Configured for Standard User Pool');
//     }
//   }, []);
//
//   // 1. LOGIN: Redirects browser to Backend -> Cognito
//   const login = useCallback((type: 'user' | 'therapist', redirectPath?: string) => {
//     authTypeRef.current = type;
//     sessionStorage.setItem(AUTH_TYPE_STORAGE_KEY, type);
//
//     // Pre-configure ammplify so that the logout/login flow matches the intended client
//     Amplify.configure(type === 'therapist' ? therapistAmplifyConfig : amplifyConfig); // Ensure correct Amplify config is set before login
//
//     const currentPath = redirectPath || window.location.pathname;
//     const lang = (i18n.resolvedLanguage || i18n.language || 'de').slice(0, 2);
//
//     // Redirect to backend login endpoint - for testing use fullRedirectUrl, otheriwse use currentPath
//     window.location.href = `${AUTH_API_URL}/auth/login?type=${type}&redirect=${encodeURIComponent(currentPath)}&lang=${encodeURIComponent(lang)}`;
//   }, []);
//
//   // 2. EXCHANGE: Swaps Session ID (from URL) for Tokens
//   const exchangeSessionForTokens = useCallback(
//     async (sessionId: string): Promise<boolean> => {
//       try {
//         const response = await fetch(`${AUTH_API_URL}/auth/exchange`, {
//           method: 'POST',
//           credentials: 'include', // Crucial: Sends cookies if any
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ sessionId }),
//         });
//
//         if (!response.ok) {
//           const err = await response.json().catch(() => ({}));
//           throw new Error(err.error || 'Session exchange failed');
//         }
//
//         const data = await response.json();
//         setAuthState(data.accessToken, data.idToken);
//         return true;
//       } catch (err) {
//         console.error('[Auth] Exchange error:', err);
//         setError(err instanceof Error ? err.message : 'Authentication failed');
//         return false;
//       }
//     },
//     [setAuthState],
//   );
//
//   // 3. REFRESH: Use HttpOnly cookie to get new Access Token
//   const refreshToken = useCallback(async (): Promise<boolean> => {
//     try {
//       // Browser automatically attaches the HttpOnly 'refreshToken' cookie
//       const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type: authTypeRef.current }),
//       });
//
//       if (!response.ok) {
//         // If 401, cookie is invalid/expired -> User is logged out
//         if (response.status === 401) {
//           clearAuthState();
//           return false;
//         }
//         throw new Error('Token refresh failed');
//       }
//
//       const data = await response.json();
//       setAuthState(data.accessToken, data.idToken);
//       return true;
//     } catch (err) {
//       console.error('[Auth] Refresh error:', err);
//       clearAuthState();
//       return false;
//     }
//   }, [clearAuthState, setAuthState]);
//
//   // Timer to silently refresh token before it expires
//   const startRefreshTimer = useCallback(() => {
//     if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
//     refreshTimerRef.current = setInterval(() => {
//       refreshToken();
//     }, TOKEN_REFRESH_INTERVAL);
//   }, [refreshToken]);
//
//   // 4. LOGOUT
//   const logout = useCallback(
//     async (type: 'user' | 'therapist') => {
//       authTypeRef.current = type;
//       sessionStorage.setItem(AUTH_TYPE_STORAGE_KEY, type);
//
//       try {
//         // 1. Call Backend to clear the 'refreshToken' cookie
//         await fetch(`${AUTH_API_URL}/auth/logout`, {
//           method: 'POST',
//           credentials: 'include', // Sends the cookie to be deleted
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type }),
//         });
//       } catch (err) {
//         console.error('Logout failed error:', err);
//         // Continue to redirect anyway so the user isn't stuck
//       } finally {
//         clearAuthState(); // 2. Clear frontend State (memory)
//
//         // 3. Redirect to Cognito logout endpoint
//         const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
//         const clientId =
//           type === 'therapist'
//             ? import.meta.env.VITE_THERAPIST_POOL_CLIENT_ID
//             : import.meta.env.VITE_USER_POOL_CLIENT_ID;
//         const logoutUri = import.meta.env.VITE_AMPLIFY_URL || window.location.origin;
//
//         const cognitoLogoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
//         window.location.href = cognitoLogoutUrl;
//       }
//     },
//     [clearAuthState],
//   );
//
//   const clearError = useCallback(() => setError(null), []);
//
//   // --- INITIALIZATION (The "Engine") ---
//   useEffect(() => {
//     if (initRef.current) return;
//     initRef.current = true;
//
//     async function initAuth() {
//       setIsLoading(true);
//
//       const authTypeFromStorage = sessionStorage.getItem(AUTH_TYPE_STORAGE_KEY) as AuthType | null;
//       const authTypeFromPath = getAuthTypeFromPath(window.location.pathname);
//       if (authTypeFromStorage === 'user' || authTypeFromStorage === 'therapist') {
//         authTypeRef.current = authTypeFromStorage;
//       } else if (authTypeFromPath) {
//         authTypeRef.current = authTypeFromPath;
//       }
//
//       // Check URL for session (Callback from Cognito)
//       const searchParams = new URLSearchParams(window.location.search);
//       const sessionId = searchParams.get('session');
//       const authError = searchParams.get('error');
//
//       if (authError) {
//         setError(decodeURIComponent(authError));
//         // Clean URL
//         window.history.replaceState({}, '', window.location.pathname);
//         setIsLoading(false);
//         return;
//       }
//
//       // #A: Returning from Login (Exchange Session)
//       if (sessionId) {
//         const success = await exchangeSessionForTokens(sessionId);
//
//         // Clean URL: Remove session ID so it can't be reused/seen
//         window.history.replaceState({}, '', window.location.pathname);
//
//         if (success) {
//           startRefreshTimer();
//         }
//       }
//       // #B: Page Reload: Try Refresh Cookie
//       else {
//         const success = await refreshToken();
//         if (success) {
//           startRefreshTimer();
//         }
//       }
//
//       setIsLoading(false);
//     }
//
//     initAuth();
//
//     return () => {
//       if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
//     };
//   }, [exchangeSessionForTokens, refreshToken, startRefreshTimer]);
//
//   const value = {
//     user,
//     accessToken,
//     idToken,
//     isAuthenticated: !!user,
//     isLoading,
//     error,
//     login,
//     logout,
//     refreshToken,
//     clearError,
//   };
//
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// --- Demo AuthProvider (portfolio mode — no auth backend) --- //

const DEMO_ROLE_STORAGE_KEY = 'feelora_demo_role';

const demoUserFor = (type: AuthType): User => {
  if (type === 'therapist') {
    return {
      id: EVA_ID,
      email: db.therapist.Email,
      name: db.therapist.Name,
      familyName: db.therapist.Surname,
      username: 'eva.eddison',
      groups: ['type:T'],
    };
  }
  const nina = db.patients[NINA_ID]!;
  return {
    id: NINA_ID,
    email: nina.Email,
    name: nina.Name,
    familyName: nina.Surname,
    username: 'nina.newton',
    groups: ['type:U'],
  };
};

const roleFromPath = (pathname: string): AuthType | null => {
  if (pathname.startsWith('/therapist')) return 'therapist';
  if (pathname.startsWith('/patient')) return 'user';
  return null;
};

const readStoredRole = (): AuthType | null => {
  try {
    const stored = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY);
    return stored === 'user' || stored === 'therapist' ? stored : null;
  } catch {
    return null;
  }
};

const writeStoredRole = (role: AuthType | null) => {
  try {
    if (role) sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
    else sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g. private mode) — the role just won't survive a reload.
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [storedRole, setStoredRole] = useState<AuthType | null>(readStoredRole);

  // Deep links decide who is logged in, so every screen can be opened
  // directly for screenshots; on public pages the last demo login sticks.
  const pathRole = roleFromPath(pathname);
  const authType = pathRole ?? storedRole;

  useEffect(() => {
    if (pathRole && pathRole !== storedRole) {
      setStoredRole(pathRole);
      writeStoredRole(pathRole);
    }
  }, [pathRole, storedRole]);

  // Synced during render (like setApolloAccessToken in the real provider) so
  // the demo services already know who is asking in the children's effects.
  setDemoRole(authType === 'therapist' ? 'therapist' : authType === 'user' ? 'patient' : null);
  setApolloAccessToken(authType ? 'demo-access-token' : null);

  const login = useCallback(
    (type: AuthType, _redirectPath?: string) => {
      setStoredRole(type);
      writeStoredRole(type);
      navigate(type === 'therapist' ? '/therapist' : '/patient');
    },
    [navigate],
  );

  const logout = useCallback(
    async (_type: AuthType) => {
      setStoredRole(null);
      writeStoredRole(null);
      navigate('/');
    },
    [navigate],
  );

  const value = useMemo<AuthContextType>(() => {
    const token = authType ? 'demo-access-token' : null;
    return {
      user: authType ? demoUserFor(authType) : null,
      accessToken: token,
      idToken: authType ? 'demo-id-token' : null,
      isAuthenticated: authType !== null,
      isLoading: false,
      error: null,
      login,
      logout,
      refreshToken: async () => authType !== null,
      clearError: () => {},
    };
  }, [authType, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
