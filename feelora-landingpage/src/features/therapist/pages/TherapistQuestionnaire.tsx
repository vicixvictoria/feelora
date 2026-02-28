import { useState } from 'react';
import FeeloraLogo from '@/assets/logo_feelora.png';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import { usePersistedQuestionnaire } from '@/hooks/usePersistedQuestionnaire';
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
import AdditionalInfoStep from '../components/questionnaire/steps/Step16_TAdditionalInfo';
import AvailabilityStep from '../components/questionnaire/steps/Step17_TAvailability';
import SummaryStep from '../components/questionnaire/steps/Step18_TSummary';
import CompletionStep from '../components/questionnaire/steps/Step19_TCompletion';

import { therapistService } from '../api/therapistService';
import { TherapistQuestionnaireData } from '../types/questionnaireT';

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
  additionalInfo: '',
  availability: [],
};

const TherapistQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsIntermediateLoading] = useState(false);

  // The usePersistedQuestionnaire hook combines state management with localStorage persistence, ensuring that user progress is saved across sessions and page reloads. It provides a clean API for updating questionnaire data and navigating between steps.
  const { data, currentStep, setCurrentStep, updateField, clearProgress } =
    usePersistedQuestionnaire<TherapistQuestionnaireData>('feelora_therapist_v1', initialData); // The storage key "feelora_therapist_v1" is used to namespace the data in localStorage, allowing for easy updates to the data structure in the future without conflicts.

  const totalSteps = 18; // Welcome + 17 questions

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
    clearProgress(); // Clear local storage AND state
    setCurrentStep(0);
    // Since state is tied to localStorage, reload to reset everything
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
  const handleCreateTherapistProfile = async () => {
    setIsIntermediateLoading(true);
    try {
      console.log('Creating therapist profile...');
      const response = await therapistService.createTherapistProfile(data);
      console.log('Therapist profile created successfully!', response);

      goNext();
    } catch (error) {
      console.error('Error creating therapist profile:', error);
    } finally {
      setIsIntermediateLoading(false);
    }
  };

  // Render the current step based on currentStep state
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={goNext} onBack={goBack} />;
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
          <AdditionalInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.additionalInfo}
            onDataChange={(newData) => updateField('additionalInfo', newData)}
          />
        );
      case 16:
        return (
          <AvailabilityStep
            onNext={handleCreateTherapistProfile} // Intermediate submission to create profile before final questionnaire submission
            onBack={goBack}
            data={data.availability}
            onDataChange={(newData) => updateField('availability', newData)}
          />
        );
      case 17:
        return (
          <SummaryStep
            onNext={handleSubmit} // This will handle the final submission of the questionnaire
            onBack={goBack}
            onEdit={goToStep}
            data={data}
            isLoading={isSubmitting} // Passes loading state to UI
          />
        );
      case 18:
        return <CompletionStep onRestart={restart} />;
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
        <img src={FeeloraLogo} alt="Feelora Logo" className="h-21 w-28" />
      </div>
    </div>
  );
};

export default TherapistQuestionnaire;
