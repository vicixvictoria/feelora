/**
 * Re-export useAuth from AuthContext for backwards compatibility
 *
 * This file now simply re-exports the useAuth hook from the AuthContext.
 * The new auth flow uses:
 * - Backend API for OAuth token exchange
 * - HttpOnly cookies for refresh tokens
 * - In-memory storage for access tokens
 */

export { useAuth } from '@/contexts/AuthContext';
