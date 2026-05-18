import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// --- Helper to check for the cookie ---
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

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
  // We bring in 'user' so we can verify they are actually a patient
  const { isAuthenticated, isLoading, error, user } = useAuth(); 

  useEffect(() => {
    // Wait for auth to complete
    if (isLoading) return;

    // Get the redirect path from URL or default to home
    const redirectPath = searchParams.get('redirect') || '/';

    if (isAuthenticated) {
      // ==========================================
      //  TRAFFIC COP (INVITED PATIENT CHECK)
      // ==========================================
      const hasInviteCookie = getCookie('InvitationId');
      
      // Ensure they are a patient (type:U) or don't have therapist groups
      const isPatient = user?.groups?.includes('type:U') || (!user?.groups?.includes('type:T') && !user?.groups?.includes('type:P'));

      if (hasInviteCookie && isPatient) {
        // ✅ They clicked an invite link --> Route them to the short questionnaire
        navigate('/patient/invited', { replace: true });
      } else {
        // Standard user --> Send them to the normal questionnaire
        navigate(redirectPath, { replace: true });
      }
      // ==========================================

    } else if (error) {
      // Error - redirect to login with error
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      // No session found - redirect to login
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, error, navigate, searchParams, user]);

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