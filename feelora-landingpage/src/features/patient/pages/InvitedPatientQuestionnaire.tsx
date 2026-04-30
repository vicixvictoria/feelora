import { useState, useEffect } from 'react';
import FeeloraLogo from '@/assets/logo_feelora.png';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import { usePersistedQuestionnaire } from '@/hooks/use-persisted-questionnaire';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import WelcomeStep from '../components/invitedQuestionnaire/Step1_Welcome.tsx';
import PersonalDataStep from '../components/invitedQuestionnaire/Step2_PersonalData';
import ContactInfoStep from '../components/invitedQuestionnaire/Step3_ContactInformation.tsx';

import { patientService } from '../api/patient-service';


interface InvitedData {
  personalData: Record<string, string>;
  contactInfo: Record<string, string>;
}

const initialData: InvitedData = {
  personalData: {},
  contactInfo: {},
};

const InvitedPatientQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isLoadingInviter, setIsLoadingInviter] = useState(true);
  
  const navigate = useNavigate();

  // DIFFERENT storage key so it doesn't mess with the normal questionnaire!
  const { data, currentStep, setCurrentStep, updateField, clearProgress } =
    usePersistedQuestionnaire<InvitedData>('feelora_invited_patient_v1', initialData);

  const totalSteps = 3; 

  //  Fetch the Therapist's Details on Load ---
  useEffect(() => {
    const fetchInviter = async () => {
      try {
        const inviteId = localStorage.getItem('pending_invite_id');
        if (!inviteId) {
          // If they somehow got here without a link, kick them to the normal flow
          navigate('/patient/questionnaire');
          return;
        }

        // Fetch the details of the therapist who invited them
        const inviterDetails = await patientService.getInviterDetails(inviteId);
        
        // Save the name to show a nice custom welcome message in Step 1
        setInviterName(`${inviterDetails.Title || ''} ${inviterDetails.Name} ${inviterDetails.Surname}`);
      } catch (error) {
        console.error("Failed to load inviter details", error);
        alert("Einladungslink ungültig oder abgelaufen.");
      } finally {
        setIsLoadingInviter(false);
      }
    };

    fetchInviter();
  }, [navigate]);

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If we are on the last step (Contact Info), submit!
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // --- The Custom Submission Logic ---
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const inviteId = localStorage.getItem('pending_invite_id');
      if (!inviteId) throw new Error("Missing Invite ID");

      // Create the basic patient profile in the backend
      await patientService.createPatientProfile({
        personalData: data.personalData,
        contactInfo: data.contactInfo,
        // Fill the rest with empty arrays/defaults since they skipped the matching steps
        languages: { selected: [], other: [] },
        availability: [], 
      });

      // Fetch the inviter ID using the session ID
      const inviterDetails = await patientService.getInviterDetails(inviteId);

      // Force the match
      await patientService.saveMatch(inviterDetails.Id);

      // Clean up and send to dashboard
      clearProgress();
      localStorage.removeItem('pending_invite_id');
      navigate('/patient'); // Go straight to their new dashboard!

    } catch (error: unknown) {
      console.error(error);
      alert("Es gab einen Fehler bei der Registrierung.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInviter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        //  pass inviterName as a prop to WelcomeStep --> optional lets see
        return <WelcomeStep onNext={goNext} onBack={goBack} inviterName={inviterName} />;
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
        // need on next triggers handle submit
        return (
          <ContactInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.contactInfo}
            onDataChange={(newData) => updateField('contactInfo', newData)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-question-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {currentStep > 0 && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps - 1} />
        )}
        <div className="w-full max-w-4xl">
          {renderStep()}
        </div>
      </div>
      <div className="flex justify-end p-6">
        <img src={FeeloraLogo} alt="Feelora Logo" className="h-16 w-50" />
      </div>
    </div>
  );
};

export default InvitedPatientQuestionnaire;