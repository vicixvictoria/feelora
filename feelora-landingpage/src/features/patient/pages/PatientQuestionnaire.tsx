import { useState, useEffect } from 'react'; 
import FeeloraLogo from '@/assets/logo_feelora.png';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import { usePersistedQuestionnaire } from '@/hooks/use-persisted-questionnaire';
import Preregistration from '../components/questionnaire/steps/Step_Preregsitration'; //comment out for pilot test
//import WelcomeStep from '../components/questionnaire/steps/Step1_PWelcome'; //comment in for pilot test
import PersonalDataStep from '../components/questionnaire/steps/Step2_PPersonalData';
import ContactInfoStep from '../components/questionnaire/steps/Step3_PContactInfo';
import MentalHealthStep from '../components/questionnaire/steps/Step4_PMentalHealth';
import TimeframeStep from '../components/questionnaire/steps/Step5_PTimeframe';
import PreviousTherapyStep from '../components/questionnaire/steps/Step6_PPreviousTherapy';
import LanguagesStep from '../components/questionnaire/steps/Step7_PLanguages';
import TherapySchoolStep from '../components/questionnaire/steps/Step8_PTherapySchool';
import TherapySettingStep from '../components/questionnaire/steps/Step9_PTherapySetting';
import TherapyFormatStep from '../components/questionnaire/steps/Step10_PTherapyFormat';
import TherapyDurationStep from '../components/questionnaire/steps/Step11_PTherapyDuration';
import SessionFrequencyStep from '../components/questionnaire/steps/Step12_PSessionFrequency';
import PatientGenderStep from '../components/questionnaire/steps/Step13_PTherapistGender';
import ValuesPreferencesStep from '../components/questionnaire/steps/Step14_PValuesPreferences';
import AdditionalInfoStep from '../components/questionnaire/steps/Step16_PAdditionalInfo';
import AvailabilityStep from '../components/questionnaire/steps/Step15_PAvailability';
import SummaryStep from '../components/questionnaire/steps/Step17_PSummary';
import TherapistMatchStep from '../components/questionnaire/steps/Step18_TherapistMatch';
import { AlgorithmMatch } from '../types/profiles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

import { patientService } from '../api/patient-service';
import { QuestionnaireData } from '../types/questionnaire';

const initialData: QuestionnaireData = {
  personalData: {},
  contactInfo: {},
  mentalHealth: { selected: [], other: '' },
  timeframe: [],
  previousTherapy: { selected: [], other: '', neverHadTherapy: false },
  languages: { selected: [], other: [] },
  therapySchool: { selected: [], other: '' },
  therapySetting: [],
  therapyFormat: [],
  therapyDuration: '',
  sessionFrequency: [],
  therapistGender: [],
  valuesPreferences: { selected: [], other: '' },
  additionalInfo: '',
  availability: [],
};

// --- Helper to check for the cookie (Case-Insensitive) ---
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  let parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  
  parts = value.split(`; ${name.toLowerCase()}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  
  return null;
};

const PatientQuestionnaire = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ==========================================
  // redirect catcher for invited patients
  // ==========================================
  useEffect(() => {
    const hasInviteCookie = getCookie('invitationId');
    if (hasInviteCookie) {
      // They landed on the big questionnaire, but they have the cookie!
      // Instantly bounce them to the short one.
      navigate('/patient/invited', { replace: true });
    }
  }, [navigate]);
  // ==========================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedProfiles, setMatchedProfiles] = useState<AlgorithmMatch[]>([]);

  const { data, currentStep, setCurrentStep, updateField, clearProgress } =
    usePersistedQuestionnaire<QuestionnaireData>('feelora_patient_v2', initialData);

  const totalSteps = 18;

  const goNext = () => {
    if (currentStep === 14) {
      patientService.pingMatchingAlgorithm();
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting data:', data);
      const result = await patientService.submitQuestionnaire(data);

      if (result.success && result.matches && result.matches.length > 0) {
        console.log('Algorithm returned full profiles:', result.matches);
        setMatchedProfiles(result.matches);
        goNext();
      } else {
        console.log('No matches found. Redirecting to profile...');
        clearProgress();
        navigate('/patient/profile');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error during questionnaire submission:', error);
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTherapist = async (therapistId: string) => {
    try {
      console.log('Accepting Therapist ID:', therapistId);
      const isSuccess = await patientService.saveMatch(therapistId);

      if (isSuccess) {
        clearProgress();
        navigate('/patient');
      } else {
        alert('Etwas ist schiefgelaufen. Bitte versuche es noch einmal.');
      }
    } catch {
      alert('Es gab einen Fehler beim Speichern des Matches.');
    }
  };

  const handleCreatePatientProfile = () => {
    goNext();

    const createProfileAsync = async () => {
      try {
        const payload = {
          Name: data.personalData.firstName,
          Surname: data.personalData.lastName,
          BirthDate: data.personalData.bday,
          Gender: data.personalData.gender,
          City: data.contactInfo.city,
          Languages: data.languages,
          Availability: data.availability,
        };
        console.log('Creating patient profile with payload:', payload);
        
        const response = await patientService.createPatientProfile(data); 
        console.log('Patient profile created successfully!', response);
      } catch (error) {
        console.error('Error creating patient profile:', error);
      }
    };

    createProfileAsync();
  };

  const handleLogout = () => {
    clearProgress();
    logout('user');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Preregistration onNext={handleLogout} onBack={handleLogout} />; //Patient Pilot test login: change Preregsitration to  WelcomeStep and in the imports use WelcomneStep but comment out Preregsitration
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
          <ContactInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.contactInfo}
            onDataChange={(newData) => updateField('contactInfo', newData)}
          />
        );
      case 3:
        return (
          <MentalHealthStep
            onNext={goNext}
            onBack={goBack}
            data={data.mentalHealth}
            onDataChange={(newData) => updateField('mentalHealth', newData)}
          />
        );
      case 4:
        return (
          <TimeframeStep
            onNext={goNext}
            onBack={goBack}
            data={data.timeframe}
            onDataChange={(newData) => updateField('timeframe', newData)}
          />
        );
      case 5:
        return (
          <PreviousTherapyStep
            onNext={goNext}
            onBack={goBack}
            data={data.previousTherapy}
            onDataChange={(newData) => updateField('previousTherapy', newData)}
          />
        );
      case 6:
        return (
          <LanguagesStep
            onNext={goNext}
            onBack={goBack}
            data={data.languages}
            onDataChange={(newData) => updateField('languages', newData)}
          />
        );
      case 7:
        return (
          <TherapySchoolStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySchool}
            onDataChange={(newData) => updateField('therapySchool', newData)}
          />
        );
      case 8:
        return (
          <TherapySettingStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySetting}
            onDataChange={(newData) => updateField('therapySetting', newData)}
          />
        );
      case 9:
        return (
          <TherapyFormatStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyFormat}
            onDataChange={(newData) => updateField('therapyFormat', newData)}
          />
        );
      case 10:
        return (
          <TherapyDurationStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyDuration}
            onDataChange={(newData) => updateField('therapyDuration', newData)}
          />
        );
      case 11:
        return (
          <SessionFrequencyStep
            onNext={goNext}
            onBack={goBack}
            data={data.sessionFrequency}
            onDataChange={(newData) => updateField('sessionFrequency', newData)}
          />
        );
      case 12:
        return (
          <PatientGenderStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapistGender}
            onDataChange={(newData) => updateField('therapistGender', newData)}
          />
        );
      case 13:
        return (
          <ValuesPreferencesStep
            onNext={goNext}
            onBack={goBack}
            data={data.valuesPreferences}
            onDataChange={(newData) => updateField('valuesPreferences', newData)}
          />
        );
      case 14:
        return (
          <AvailabilityStep
            onNext={handleCreatePatientProfile}
            onBack={goBack}
            data={data.availability}
            onDataChange={(newData) => updateField('availability', newData)} 
          />
        );
      case 15:
        return (
          <AdditionalInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.additionalInfo}
            onDataChange={(newData) => updateField('additionalInfo', newData)}
          />
        );
      case 16:
        return (
          <SummaryStep
            onNext={handleSubmit}
            onBack={goBack}
            onEdit={goToStep}
            data={data}
            isLoading={isSubmitting}
          />
        );
      case 17:
        return (
          <TherapistMatchStep
            therapists={matchedProfiles}
            onAccept={handleAcceptTherapist}
            onBack={goBack} 
          />
        );
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

export default PatientQuestionnaire;