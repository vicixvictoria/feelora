import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { CheckboxField } from '@aws-amplify/ui-react';
import { therapistAmplifyConfig } from '../config/amplify';import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/buttonLanding';

// You can re-use the components and formFields logic, 
// or define a therapist-specific one if the fields differ.

const therapistComponents = { 
  // ... your existing components logic (e.g., for SignUp terms)
  SignUp: {
    FormFields() {
      // Re-use default Authenticator.SignUp.FormFields and your custom CheckboxField
      return (
        <>
          <Authenticator.SignUp.FormFields />
          {/* ... your CheckboxField implementation ... */}
        </>
      );
    },
  },
};

// You can re-use the formFields object as it mainly handles labels/placeholders
// const therapistFormFields = { /* ... your formFields object ... */ };

function TherapistLoginPage() { // Renamed the function
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    Amplify.configure(therapistAmplifyConfig);
  }, []);
  
  // Assume formFields is copied/imported from the main file for simplicity
  const formFields = { /* ... your formFields object for labels/placeholders ... */ };

  // Function for redirecting via Button
  const handleOutsideRedirect = () => {
    navigate('/login'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {/* New title for therapist login/signup */}
            {t('login.title')} 
          </h1>
          {/* ... subtitles ... */}
        </div>

        <div className="flex justify-center mb-6">
          {/* Button to redirect user if they are a therapist*/}
           <Button
              onClick={handleOutsideRedirect}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t('login.redeirectButton.therapist')}
            </Button>
          </div>

        <React.StrictMode>
          <Authenticator
            // 2. Use the therapist-specific component and form fields
            socialProviders={['google']}
            initialState={'signUp'} // Maybe default to signUp for therapists?
            signUpAttributes={['name', 'family_name']}
            formFields={formFields}
            components={therapistComponents}
          >
            {/* ... rest of your Authenticator child function ... */}
            {({ user, signOut }) => {
              if (!user) return null;
              // ... user signed in state ...
            }}
          </Authenticator>
        </React.StrictMode>
      </div>
    </div>
  );
}

export default TherapistLoginPage;