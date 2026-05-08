import { useState, useEffect } from 'react';
import FeeloraLogo from '@/assets/logo_feelora.png';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import { usePersistedQuestionnaire } from '@/hooks/use-persisted-questionnaire';
import WelcomeStep from '../components/questionnaire/steps/Step1_TWelcome.tsx';
import PersonalDataStep from '../components/questionnaire/steps/Step2_TPersonalData';
import ContactInfoStep from '../components/questionnaire/steps/Step3_TContactInfo';
import QualificationsStep from '../components/questionnaire/steps/Step4_TQualifications';
import ExperienceStep from '../components/questionnaire/steps/Step5_TExperience';
import SpecialtiesStep from '../components/questionnaire/steps/Step6_TSpecialties';
import LanguagesStep from '../components/questionnaire/steps/Step7_TLanguages';
import TherapySchoolStep from '../components/questionnaire/steps/Step8_TTherapySchool';
import TherapyMethodsStep from '../components/questionnaire/steps/Step9_TTherapyMethods';
import TherapySettingStep from '../components/questionnaire/steps/Step10_TTherapySetting';
import TherapyFormatStep from '../components/questionnaire/steps/Step11_TTherapyFormat';
import TherapyDurationStep from '../components/questionnaire/steps/Step12_TTherapyDuration';
import SessionFrequencyStep from '../components/questionnaire/steps/Step13_TSessionFrequency';
import PatientGenderStep from '../components/questionnaire/steps/Step14_TPatientGender';
import ValuesPreferencesStep from '../components/questionnaire/steps/Step15_TValuesPreferences';
import PriceRangeStep from '../components/questionnaire/steps/Step15-1-TPriceRange';
import AdditionalInfoStep from '../components/questionnaire/steps/Step16_TAdditionalInfo';
import AvailabilityStep from '../components/questionnaire/steps/Step17_TAvailability';
import SummaryStep from '../components/questionnaire/steps/Step18_TSummary';
import CompletionStep from '../components/questionnaire/steps/Step19_TCompletion';
import { Loader2 } from 'lucide-react';

import { therapistService } from '../api/therapist-service';
import { TherapistQuestionnaireData } from '../types/questionnaire-therapist';
import { useAuth } from '@/contexts/AuthContext';

// Initial empty data structure for the questionnaire
const initialData: TherapistQuestionnaireData = {
  personalData: {},
  contactInfo: {},
  qualifications: {
    degree: '',
    institution: '',
    licenseNumber: '',
    idUpload: null,
  },
  experience: [],
  specialties: { selected: [], other: '' },
  languages: { selected: [], other: [] },
  therapySchool: { selected: [], other: '' },
  therapyMethods: '',
  therapySetting: [],
  therapyFormat: [],
  therapyDuration: '',
  sessionFrequency: [],
  patientGender: [],
  valuesPreferences: { selected: [], other: '' },
  priceRange: { kassenvertrag: false, hasPrice: false, priceDetails: '' },
  additionalInfo: '',
  availability: [],
};

const TherapistQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to block rendering while checking backend status
  const [isCheckingStatus, setIsCheckingStatus] = useState(true); 
  
  const { logout } = useAuth();

  const { data, currentStep, setCurrentStep, updateField, clearProgress } =
    usePersistedQuestionnaire<TherapistQuestionnaireData>('feelora_therapist_v1', initialData); 

  const totalSteps = 19; // Welcome + 18 questions

  // --- CHECK EXISTING QUESTIONNAIRE STATUS ON MOUNT ---
  useEffect(() => {
    let mounted = true;

    const checkQuestionnaireStatus = async () => {
      try {
        // check if user clicked restart questionnaire - if yes, skip backend check and start fresh
        if (localStorage.getItem('feelora_force_restart') === 'true') {
          if (mounted) setIsCheckingStatus(false);
          return; 
        }

        const existingData = await therapistService.getQuestionnaire();
        
        // If the backend returned a questionnaire, they already completed it. --> Jump directly to the completion step
        if (mounted && existingData && existingData.Questionnaire) {
          setCurrentStep(19);
        }
      } catch (error) {
        console.log('No existing questionnaire found, starting fresh or from local cache.');
      } finally {
        if (mounted) {
          setIsCheckingStatus(false);
        }
      }
    };

    checkQuestionnaireStatus();

    return () => {
      mounted = false; // Cleanup to prevent state updates if unmounted
    };
  }, [setCurrentStep]);

  // Allow going to the next step
  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Allow going back to the previous step
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Allow jumping to a specific step (used for editing from summary)
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const restart = () => {
    clearProgress(); 
    localStorage.setItem('feelora_force_restart', 'true'); 
    localStorage.removeItem('feelora_profile_created'); 
    setCurrentStep(0);
    window.location.reload();
  };

  // Final Submission Logic
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting therapist data:', data);

      const result = await therapistService.submitQuestionnaire(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Final Submission successful!', result.savedData);

      clearProgress();
      localStorage.removeItem('feelora_force_restart'); 
      localStorage.removeItem('feelora_profile_created'); 
      goNext();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Intermediate Profile Creation Logic
  const handleCreateTherapistProfile = () => {
    // 1. Instantly move to the next page so the user doesn't wait
    goNext();

    // 2. Perform the API call asynchronously in the background
    const createProfileAsync = async () => {
      try {
        const hasCreated = localStorage.getItem('feelora_profile_created') === 'true';

        if (!hasCreated) {
          console.log('Creating therapist profile...');
          const response = await therapistService.createTherapistProfile(data);
          
          localStorage.setItem('feelora_profile_created', 'true');
          console.log('Therapist profile created successfully!', response);
        } else {
          console.log('Updating existing therapist profile...');
          
          const formattedAddress = [
            data.contactInfo?.street,
            data.contactInfo?.zip,
            data.contactInfo?.city,
          ]
            .filter(Boolean)
            .join(', ');

          await therapistService.updateProfile({
            Name: data.personalData?.firstName || '',
            Surname: data.personalData?.lastName || '',
            Gender: data.personalData?.gender || '',
            BirthDate: data.personalData?.bday ? new Date(data.personalData.bday).getTime() / 1000 : null,
            City: data.contactInfo?.city || '',
            Address: formattedAddress || '',
            Languages: data.languages?.selected || [],
            Availability: data.availability || [],
            Specialties: data.specialties?.selected || [],
            Title: data.personalData?.title || '',
            JobTitle: data.personalData?.job || '', 
            HasInsurance: data.priceRange?.kassenvertrag || false,
            PriceRange: data.priceRange?.priceDetails || '',
          });
          console.log('Therapist profile updated successfully!');
        }
      } catch (error) {
        console.error('Error creating/updating therapist profile:', error);
        alert('Es gab einen Fehler beim Speichern deines Profils. Bitte überprüfe deine Daten.');
        // 3. If it fails, force them back to step 17 (Availability)
        setCurrentStep(17);
      }
    };

    createProfileAsync();
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-question-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
            onConsentError={() => setCurrentStep(0)} 
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
          <ContactInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.contactInfo}
            onDataChange={(newData) => updateField('contactInfo', newData)}
          />
        );
      case 3:
        return (
          <QualificationsStep
            onNext={goNext}
            onBack={goBack}
            data={data.qualifications}
            onDataChange={(newData) => updateField('qualifications', newData)}
          />
        );
      case 4:
        return (
          <ExperienceStep
            onNext={goNext}
            onBack={goBack}
            data={data.experience}
            onDataChange={(newData) => updateField('experience', newData)}
          />
        );
      case 5:
        return (
          <SpecialtiesStep
            onNext={goNext}
            onBack={goBack}
            data={data.specialties}
            onDataChange={(newData) => updateField('specialties', newData)}
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
          <TherapyMethodsStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyMethods}
            onDataChange={(newData) => updateField('therapyMethods', newData)}
          />
        );
      case 9:
        return (
          <TherapySettingStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySetting}
            onDataChange={(newData) => updateField('therapySetting', newData)}
          />
        );
      case 10:
        return (
          <TherapyFormatStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyFormat}
            onDataChange={(newData) => updateField('therapyFormat', newData)}
          />
        );
      case 11:
        return (
          <TherapyDurationStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyDuration}
            onDataChange={(newData) => updateField('therapyDuration', newData)}
          />
        );
      case 12:
        return (
          <SessionFrequencyStep
            onNext={goNext}
            onBack={goBack}
            data={data.sessionFrequency}
            onDataChange={(newData) => updateField('sessionFrequency', newData)}
          />
        );
      case 13:
        return (
          <PatientGenderStep
            onNext={goNext}
            onBack={goBack}
            data={data.patientGender}
            onDataChange={(newData) => updateField('patientGender', newData)}
          />
        );
      case 14:
        return (
          <ValuesPreferencesStep
            onNext={goNext}
            onBack={goBack}
            data={data.valuesPreferences}
            onDataChange={(newData) => updateField('valuesPreferences', newData)}
          />
        );
      case 15:
        return (
          <PriceRangeStep
            onNext={goNext}
            onBack={goBack}
            data={data.priceRange || {}}
            onDataChange={(newData) => updateField('priceRange', newData)}
          />
        );
      case 16:
        return (
          <AdditionalInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.additionalInfo}
            onDataChange={(newData) => updateField('additionalInfo', newData)}
          />
        );
      case 17:
        return (
          <AvailabilityStep
            onNext={handleCreateTherapistProfile} 
            onBack={goBack}
            data={data.availability}
            onDataChange={(newData) => updateField('availability', newData)}
          />
        );
      case 18:
        return (
          <SummaryStep
            onNext={handleSubmit} 
            onBack={goBack}
            onEdit={goToStep}
            data={data}
            isLoading={isSubmitting} 
          />
        );
      case 19:
        return (
          <CompletionStep
            onRestart={restart}
            onHome={async () => {
              clearProgress();
              await logout('therapist');
            }}
          />
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

export default TherapistQuestionnaire;