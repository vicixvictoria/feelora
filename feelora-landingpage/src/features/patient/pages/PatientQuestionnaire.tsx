import { useState } from "react";
import FeeloraLogo from "@/assets/logo_feelora.png";
import ProgressBar from "@/components/questionnaire/ProgressBar";
import { usePersistedQuestionnaire } from "@/hooks/usePersistedQuestionnaire";
import WelcomeStep from "../components/questionnaire/steps/Step1_PWelcome.tsx";
import PersonalDataStep from "../components/questionnaire/steps/Step2_PPersonalData";
import ContactInfoStep from "../components/questionnaire/steps/Step3_PContactInfo.tsx";
import MentalHealthStep from "../components/questionnaire/steps/Step4_PMentalHealth";
import TimeframeStep from "../components/questionnaire/steps/Step5_PTimeframe.tsx";
import PreviousTherapyStep from "../components/questionnaire/steps/Step6_PPreviousTherapy.tsx";
import LanguagesStep from "../components/questionnaire/steps/Step7_PLanguages.tsx";
import TherapySchoolStep from "../components/questionnaire/steps/Step8_PTherapySchool.tsx";
import TherapySettingStep from "../components/questionnaire/steps/Step9_PTherapySetting.tsx";
import TherapyFormatStep from "../components/questionnaire/steps/Step10_PTherapyFormat.tsx";
import TherapyDurationStep from "../components/questionnaire/steps/Step11_PTherapyDuration.tsx";
import SessionFrequencyStep from "../components/questionnaire/steps/Step12_PSessionFrequency.tsx";
import PatientGenderStep from "../components/questionnaire/steps/Step13_PTherapistGender.tsx";
import ValuesPreferencesStep from "../components/questionnaire/steps/Step14_PValuesPreferences.tsx";
import AdditionalInfoStep from "../components/questionnaire/steps/Step15_PAdditionalInfo.tsx";
import AvailabilityStep from "../components/questionnaire/steps/Step16_PAvailability.tsx";
import SummaryStep from "../components/questionnaire/steps/Step17_PSummary.tsx";
import CompletionStep from "../components/questionnaire/steps/Step18_PCompletion.tsx";

import { patientService } from '../api/patientService';
import { QuestionnaireData } from '../types/questionnaire';



/*interface QuestionnaireData {
  personalData: Record<string, string>;
  contactInfo: Record<string, string>;
  mentalHealth: { selected: string[]; other: string };
  timeframe: string[];
  previousTherapy: { selected: string[]; other: string; neverHadTherapy: boolean };
  languages: { selected: string[]; other: string };
  therapySchool: { selected: string[]; other: string };
  //therapyMethods: string;
  therapySetting: string[];
  therapyFormat: string[];
  therapyDuration: string;
  sessionFrequency: string[];
  therapistGender: string[];
  valuesPreferences: { selected: string[]; other: string };
  additionalInfo: string;
  availability: string[];
}*/

const initialData: QuestionnaireData = {
  personalData: {},
  contactInfo: {},
  mentalHealth: { selected: [], other: "" },
  timeframe: [],
  previousTherapy: { selected: [], other: "", neverHadTherapy: false },
  languages: { selected: [], other: "" },
  therapySchool: { selected: [], other: "" },
  //therapyMethods: "",
  therapySetting: [],
  therapyFormat: [],
  therapyDuration: "",
  sessionFrequency: [],
  therapistGender: [],
  valuesPreferences: { selected: [], other: "" },
  additionalInfo: "",
  availability: [],
};

const PatientQuestionnaire = () => {
  /*const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>(initialData);*/

  const [isSubmitting, setIsSubmitting] = useState(false); // Loading State

// The usePersistedQuestionnaire hook combines state management with localStorage persistence, ensuring that user progress is saved across sessions and page reloads. It provides a clean API for updating questionnaire data and navigating between steps.
  const { 
    data, 
    currentStep, 
    setCurrentStep, 
    updateField, 
    clearProgress 
  } = usePersistedQuestionnaire<QuestionnaireData>("feelora_patient_v2", initialData); // The storage key "feelora_patient_v2" is used to namespace the data in localStorage, allowing for easy updates to the data structure in the future without conflicts.


  const totalSteps = 18; // Welcome + 17 questions

  const goNext = () => {
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

  const restart = () => {
    clearProgress(); // Clear local storage AND state
    setCurrentStep(0);
    // Since state is tied to localStorage, reload to reset everything
    window.location.reload();
  };

  // Define the submission logic here, which will be called from the SummaryStep when the user confirms their answers. This function should send the data to your backend API and handle any responses or errors accordingly.
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double clicks

    setIsSubmitting(true);
    try {
      // 1. Send data to backend
      console.log("Submitting data:", data);
      // 1. Call the API
      await patientService.submitQuestionnaire(data);
      console.log("Final Submission successful!", data);

      // 2. Clear the local storage, that data is safe in DB
      clearProgress();

      // 3. Move to the completion step
      goNext(); 
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to save your answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onDataChange={(newData) => updateField("personalData", newData)}
          />
        );
      case 2:  
        return (
          <ContactInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.contactInfo}
            onDataChange={(newData) => updateField("contactInfo", newData)}
          />
        );
        case 3:
        return (
          <MentalHealthStep
            onNext={goNext}
            onBack={goBack}
            data={data.mentalHealth}
            onDataChange={(newData) => updateField("mentalHealth", newData)}
          />
        );
        case 4:
        return (
          <TimeframeStep
            onNext={goNext}
            onBack={goBack}
            data={data.timeframe}
            onDataChange={(newData) => updateField("timeframe", newData)}
          />
        );
        case 5:
        return (
          <PreviousTherapyStep
            onNext={goNext}
            onBack={goBack}
            data={data.previousTherapy}
            onDataChange={(newData) => updateField("previousTherapy", newData)}
          />
        );
        case 6:
        return (
          <LanguagesStep
            onNext={goNext}
            onBack={goBack}
            data={data.languages}
            onDataChange={(newData) => updateField("languages", newData)}
          />
        );
        case 7:
        return (
          <TherapySchoolStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySchool}
            onDataChange={(newData) => updateField("therapySchool", newData)}
          />
        );
        case 8:
        return (
          <TherapySettingStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySetting}
            onDataChange={(newData) => updateField("therapySetting", newData)}
          />
        );
        case 9:
        return (
          <TherapyFormatStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyFormat}
            onDataChange={(newData) => updateField("therapyFormat", newData)}
          />
        );
        case 10:
        return (
          <TherapyDurationStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyDuration}
            onDataChange={(newData) => updateField("therapyDuration", newData)}
          />
        );
        case 11:
        return (
          <SessionFrequencyStep
            onNext={goNext}
            onBack={goBack}
            data={data.sessionFrequency}
            onDataChange={(newData) => updateField("sessionFrequency", newData)}
          />
        );
        case 12:
        return (
          <PatientGenderStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapistGender}
            onDataChange={(newData) => updateField("therapistGender", newData)}
          />
        );
        case 13:
        return (
          <ValuesPreferencesStep
            onNext={goNext}
            onBack={goBack}
            data={data.valuesPreferences}
            onDataChange={(newData) => updateField("valuesPreferences", newData)}
          />
        );
        case 14:
        return (
          <AdditionalInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.additionalInfo}
            onDataChange={(newData) => updateField("additionalInfo", newData)}
          />
        );
        case 15:
        return (
          <AvailabilityStep
            onNext={goNext}
            onBack={goBack}
            data={data.availability}
            onDataChange={(newData) => updateField("availability", newData)}
          />
        );
      case 16:
        return (
          <SummaryStep
            onNext={handleSubmit} // This will handle the final submission of the questionnaire
            onBack={goBack}
            onEdit={goToStep}
            data={data}
          />
        );
      case 17:
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
        <div className="w-full max-w-4xl">
          {renderStep()}
        </div>
      </div>
      <div className="flex justify-end p-6">
      <img 
        src={FeeloraLogo} 
        alt="Feelora Logo" 
        className="h-21 w-28"
      />
      </div>
    </div>
  );
};

export default PatientQuestionnaire;
