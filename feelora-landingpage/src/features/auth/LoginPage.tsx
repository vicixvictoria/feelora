import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { CheckboxField } from '@aws-amplify/ui-react';
import { amplifyConfig } from '../config/amplify';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/buttonLanding';
import { useLanguage } from '@/contexts/LanguageContext';

const components = {
  SignUp: {
    FormFields() {
      return (
        <>
          {/* Re-use default Authenticator.SignUp.FormFields */}
          <Authenticator.SignUp.FormFields />

          {/* Append & require Terms and Conditions field to sign up */}
          <CheckboxField
            name="termsofservice"
            value="yes"
            label={
              <span>
                I agree with the{' '}
                <a
                  href="/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms and Conditions
                </a>
              </span>
            }
            required={true}
            isRequired={true}
          />
        </>
      );
    },
  },
};


interface LoginPageProps {
  initialState?: 'signIn' | 'signUp';
}

function LoginPage({ initialState = 'signIn' }: LoginPageProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    Amplify.configure(amplifyConfig);
  }, []);
  
  //Moved to use langauge hook - but rerendering is missing with useMemo hook
  const formFields = {
  signIn: {
    username: {
      label: t('login.email'),
      placeholder: t('login.email.placeholder'),
      isRequired: true,
    },
    password: {
      label: t('login.password'),
      placeholder: t('login.password.placeholder'),
      isRequired: false,
    },
  },
  signUp: {
    name: {
      label: t('login.name'),
      placeholder: t('login.name.placeholder'),
      isRequired: true,
      order: 1,
    },
    family_name: {
      label: t('login.surname'),
      placeholder: t('login.surname.placeholder'),
      isRequired: true,
      order: 2,
    },
    email: {
      label: t('login.email'),
      placeholder: t('login.email.placeholder'),
      isRequired: true,
      order: 3,
    },
    password: {
      label: t('login.password'),
      placeholder: t('login.password.placeholder'),
      isRequired: false,
      order: 4,
    },
    confirm_password: {
      label: t('login.password.confirm'),
      placeholder: t('login.password.confirm.placeholder'),
      order: 5,
    },
  },
  forceNewPassword: {
    password: {
      label: t('login.newpassword'),
      placeholder: t('login.newpassword.placeholder'),
    },
  },
  forgotPassword: {
    username: {
      label: t('login.email'),
      placeholder: t('login.email.placeholder'),
      isRequired: true,
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      label: t('login.confirmation'),
      placeholder:  t('login.confirmation.placeholder'),
      isRequired: false,
    },
    password: {
      label: t('login.newpassword'),
      placeholder: t('login.newpassword.placeholder'),
      isRequired: true,
    },
    confirm_password: {
      label: t('login.password.confirm'),
      placeholder: t('login.password.confirm.placeholder'),
      isRequired: true,
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: 'Feelora',
      totpUsername: 'feelora_user',
    },
    confirmation_code: {
      label: t('login.confirmation'),
      placeholder: t('login.confirmation.placeholder'),
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: t('login.confirmation'),
      placeholder: t('login.confirmation.placeholder'),
      isRequired: false,
    },
  },
  setupEmail: {
    email: {
      label: t('login.email'),
      placeholder: t('login.email.placeholder'),
    },
  },
};

  // Function for redirecting via Button
  const handleOutsideRedirect = () => {
    navigate('/loginTherapist'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {initialState === 'signIn' ? t('login.title') : 'Join Feelora'}
          </h1>
          <p className="text-gray-600">
            {initialState === 'signIn'
              ? t('login.subtitle')
              : 'Create your account to get started'}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          {/* Button to redirect user if they are a therapist*/}
           <Button
              onClick={handleOutsideRedirect}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t('login.redeirectButton')}
            </Button>
          </div>

        <React.StrictMode>
          <Authenticator
            socialProviders={['google']}
            initialState={initialState}
            signUpAttributes={['name', 'family_name']}
            formFields={formFields}
            components={components}
          >
            {({ user, signOut }) => {
              if (!user) return null;
              
              return (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome, {user.signInDetails?.loginId}!
                    </h2>
                    <p className="text-gray-600">{t('login.redeirectButton')}</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Sign out
                    </button>
                  </div>

                  {/* Debug info - remove in production */}
                  {import.meta.env.DEV && (
                    <details className="mt-6">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        Debug: User Info
                      </summary>
                      <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            }}
          </Authenticator>
        </React.StrictMode>
      </div>
    </div>
  );
}

export default LoginPage;
