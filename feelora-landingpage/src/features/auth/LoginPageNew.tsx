import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/buttonLanding';

interface LoginPageProps {
  /** User type: 'user' or 'therapist ' */
  userType?: 'user' | 'therapist';
}

/**
 * Login page - redirects to Cognito Hosted UI via backend
 *
 * This page provides:
 * - Social login button (Google via Cognito Hosted UI)
 * - Error display if authentication failed
 * - Redirect to other user type login
 */
function LoginPage({ userType = 'user' }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, error, login, clearError } = useAuth();
  const { t } = useTranslation();

  // Get redirect path from URL params
  const redirectPath = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath]);

  // Handle login button click
  const handleLogin = () => {
    clearError();
    login(userType, redirectPath);
  };

  // Handle redirect to other login type
  const handleSwitchUserType = () => {
    if (userType === 'user') {
      navigate('/loginTherapist');
    } else {
      navigate('/login');
    }
  };

  // Show loading while checking existing session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            {t('login.loading')}
          </h2>
        </div>
      </div>
    );
  }

  const displayError = error || urlError;
  const isTherapist = userType === 'therapist';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t('login.error.title')}
                </h3>
                <p className="mt-1 text-sm text-red-700">{displayError}</p>
              </div>
              <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Switch User Type Button */}
          <div className="flex justify-center mb-6">
            <Button onClick={handleSwitchUserType} variant="outline" className="text-sm">
              {isTherapist ? t('login.redeirectButton.therapist') : t('login.redeirectButton')}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('login.signIn')}
              </span>
            </div>
          </div>

          {/* Login Button - Redirects to Cognito Hosted UI (supports Google + Email/Password) */}
          <Button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 py-6"
          >
            <span className="font-medium">
              {t('login.continueSignIn')}
            </span>
          </Button>

          <p className="mt-4 text-center text-xs text-gray-500">
            {t('login.signInHint')}
          </p>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500">
            {t('login.termsPrefix')}
            <a href="/privacy" className="text-primary hover:underline">
              {t('footer.legal.privacy')}
            </a>
            {t('login.termsAnd')}
            <a href="/legal" className="text-primary hover:underline">
              {t('footer.legal.terms')}
            </a>
          </p>
        </div>

        {/* Info Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isTherapist ? t('login.info.therapist') : t('login.info.user')}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
