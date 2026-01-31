import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RequireAuthProps {
  allowedType: 'user' | 'therapist';
}

export function RequireAuth({ allowedType }: RequireAuthProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading session...</div>
      </div>
    );
  }

  // 1. Not Logged In -> Redirect to appropriate Login
  if (!isAuthenticated || !user) {
    const loginTarget = allowedType === 'therapist' ? '/loginTherapist' : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // Helper: Check if user is a therapist
  // Checks against AWS Cognito group name, case-insensitive --> ensure your AWS Cognito group name matches exactly
  const isTherapistUser = user.groups?.some(g => 
    g.toLowerCase() === 'therapists' || g.toLowerCase() === 'therapist'
  );

  // 2. BLOCK PATIENTS from Therapist Routes
  if (allowedType === 'therapist' && !isTherapistUser) {
    // Patients go back to patient dashboard
    return <Navigate to="/patient" replace />;
  }

  // 3. BLOCK THERAPISTS from Patient Routes 
  if (allowedType === 'user' && isTherapistUser) {
    // Therapists go back to therapist dashboard
    return <Navigate to="/therapist" replace />;
  }

  // 4. Access Granted
  return <Outlet />;
}