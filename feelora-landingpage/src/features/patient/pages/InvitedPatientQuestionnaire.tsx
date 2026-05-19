import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import FeeloraLogo from '@/assets/logo_feelora.png';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import { usePersistedQuestionnaire } from '@/hooks/use-persisted-questionnaire';

import WelcomeStep from '../components/questionnaire/steps/Step1_PWelcome'; 
import PersonalDataStep from '../components/questionnaire/steps/Step2_PPersonalData';
import ContactInfoStep from '../components/questionnaire/steps/Step3_PContactInfo';
import { patientService } from '../api/patient-service';
import { Loader2 } from 'lucide-react';

// --- Cookie Helper Functions ---
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const initialInvitedData = {
  personalData: {},
  contactInfo: {},
};

const InvitedPatientQuestionnaire = () => {
  const navigate = useNavigate();

  // Read the cookie for invitation ID
  const invitationId = getCookie('invitationId');

  const [inviterDetails, setInviterDetails] = useState<any>(null);
  const [isLoadingInviter, setIsLoadingInviter] = useState(true);
  const [inviterError, setInviterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, currentStep, setCurrentStep, updateField, clearProgress } =
    usePersistedQuestionnaire<any>('feelora_invited_patient_v1', initialInvitedData);

  const totalSteps = 3;

  // --- Fetch Inviter Details on Load ---
  useEffect(() => {
    const fetchInviter = async () => {
      if (!invitationId) {
        setInviterError('Keine Einladungs-ID im Cookie gefunden.');
        setIsLoadingInviter(false);
        return;
      }

      try {
        const details = await patientService.getInviterDetails(invitationId);
        setInviterDetails(details);
      } catch (error) {
        console.error('Failed to load inviter:', error);
        setInviterError('Einladung ungültig oder abgelaufen.');
      } finally {
        setIsLoadingInviter(false);
      }
    };

    fetchInviter();
  }, [invitationId]);

  const goNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // --- Final Submission Logic ---
  const handleCompleteOnboarding = async () => {
    if (isSubmitting || !inviterDetails) return;
    setIsSubmitting(true);

    try {
      await patientService.createPatientProfile(data);
      const isSuccess = await patientService.saveMatch(inviterDetails.Id);

      if (isSuccess) {
        // Clear local storage AND delete the cookie so it doesn't run again!
        clearProgress();
        deleteCookie('invitationId');
        navigate('/patient/dashboard'); 
      } else {
        throw new Error('Fehler beim Zuweisen des Therapeuten.');
      }
    } catch (error: any) {
      console.error('Error completing invited onboarding:', error);
      alert(error.message || 'Es ist ein Fehler aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInviter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-question-bg">
        <Loader2 className="w-10 h-10 animate-spin text-purple" />
      </div>
    );
  }

  if (inviterError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-question-bg text-center p-4">
        <h2 className="text-2xl font-bold text-destructive mb-2">Oops!</h2>
        <p className="text-muted-foreground">{inviterError}</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep 
            onNext={goNext} 
            onBack={goBack} 
            onError={() => goToStep(0)}
            inviterName={`${inviterDetails?.Title ? inviterDetails.Title + ' ' : ''}${inviterDetails?.Name} ${inviterDetails?.Surname}`} 
          />
        );
      case 1:
        return (
          <PersonalDataStep
            onNext={goNext}
            onBack={goBack}
            data={data.personalData}
            onDataChange={(newData) => updateField('personalData', newData)}
          />
        );
      case 2:
        return (
          <div className="relative">
            <ContactInfoStep
              onNext={handleCompleteOnboarding}
              onBack={goBack}
              data={data.contactInfo}
              onDataChange={(newData) => updateField('contactInfo', newData)}
            />
            {isSubmitting && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-xl">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-question-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {currentStep > 0 && currentStep < totalSteps && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps - 1} />
        )}
        <div className="w-full max-w-4xl">{renderStep()}</div>
      </div>
      <div className="flex justify-end p-6">
        <img src={FeeloraLogo} alt="Feelora Logo" className="h-15 w-58" />
      </div>
    </div>
  );
};

export default InvitedPatientQuestionnaire;