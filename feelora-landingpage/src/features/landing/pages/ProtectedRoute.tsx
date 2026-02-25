import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional: Required group membership */
  requiredGroup?: string;
  /** Optional: Redirect path if not authenticated (default: /login) */
  redirectTo?: string;
}

/**
 * ProtectedRoute component - wraps routes that require authentication
 *
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 *
 * With group check:
 * <Route path="/therapist-dashboard" element={
 *   <ProtectedRoute requiredGroup="T">
 *     <TherapistDashboard />
 *   </ProtectedRoute>
 * } />
 */
function ProtectedRoute({ children, requiredGroup, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login with return path
  if (!isAuthenticated) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?redirect=${returnPath}`} replace />;
  }

  // Check group membership if required
  if (requiredGroup && !user?.groups?.includes(requiredGroup)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <a
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
