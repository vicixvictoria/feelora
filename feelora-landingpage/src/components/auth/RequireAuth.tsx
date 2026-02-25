import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RequireAuthProps {
  allowedType: 'user' | 'therapist';
}

// This component protects routes based on authentication status and user type (patient vs therapist).
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

  // 2. Parse the exact AWS Cognito groups based on the backend schema
  const groups = user.groups || [];
  const isPatient = groups.includes('type:U');
  const isConfirmedTherapist = groups.includes('type:T');
  const isPendingTherapist = groups.includes('type:P');

  // 3. THERAPIST ROUTES LOGIC
  if (allowedType === 'therapist') {
    // Block Patients
    if (isPatient) {
      return <Navigate to="/patient" replace />;
    }

    // Handle Pending Therapists (type:P)
    if (isPendingTherapist) {
      // If they are on the questionnaire page, let them access it
      if (location.pathname === '/therapist/questionnaire') {
        return <Outlet />;
      }
      // If they try to type in /therapist/dashboard, trap them in the questionnaire
      return <Navigate to="/therapist/questionnaire" replace />;
    }

    // Handle Confirmed Therapists (type:T)
    if (isConfirmedTherapist) {
      // They have full access to all /therapist routes
      return <Outlet />;
    }
  }

  // 4. PATIENT ROUTES LOGIC
  if (allowedType === 'user') {
    // Block Therapists (Both confirmed and pending)
    if (isConfirmedTherapist) {
      return <Navigate to="/therapist" replace />;
    }
    if (isPendingTherapist) {
      return <Navigate to="/therapist/questionnaire" replace />;
    }

    // Handle Patients (type:U)
    if (isPatient) {
      return <Outlet />;
    }
  }

  // 5. Fallback for users with missing or unassigned groups
  return <Navigate to="/" replace />;
}