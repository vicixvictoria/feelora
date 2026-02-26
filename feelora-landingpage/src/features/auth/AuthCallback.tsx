import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * AuthCallback page - handles the redirect from the OAuth backend
 *
 * Flow:
 * 1. Backend redirects here with ?session_id=xxx
 * 2. AuthContext automatically exchanges session_id for tokens
 * 3. This page shows loading state and redirects to intended destination
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    // Wait for auth to complete
    if (isLoading) return;

    // Get the redirect path from URL or default to home
    const redirectPath = searchParams.get('redirect') || '/';

    if (isAuthenticated) {
      // Success - redirect to intended destination
      navigate(redirectPath, { replace: true });
    } else if (error) {
      // Error - redirect to login with error
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      // No session found - redirect to login
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, error, navigate, searchParams]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          {error ? 'Authentication failed...' : 'Completing sign in...'}
        </h2>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default AuthCallback;
