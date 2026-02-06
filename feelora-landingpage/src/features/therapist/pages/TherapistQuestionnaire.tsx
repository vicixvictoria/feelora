import { useState } from "react";
import FeeloraLogo from "@/assets/logo_feelora.png";
import ProgressBar from "@/components/questionnaire/ProgressBar";
import WelcomeStep from "../components/questionnaire/steps/Step1_TWelcome.tsx";
import PersonalDataStep from "../components/questionnaire/steps/Step2_TPersonalData";
import ContactInfoStep from "../components/questionnaire/steps/Step3_TContactInfo";
import QualificationsStep from "../components/questionnaire/steps/Step4_TQualifications";
import ExperienceStep from "../components/questionnaire/steps/Step5_TExperience";
import SpecialtiesStep from "../components/questionnaire/steps/Step6_TSpecialties";
import LanguagesStep from "../components/questionnaire/steps/Step7_TLanguages";
import TherapySchoolStep from "../components/questionnaire/steps/Step8_TTherapySchool";
import TherapyMethodsStep from "../components/questionnaire/steps/Step9_TTherapyMethods";
import TherapySettingStep from "../components/questionnaire/steps/Step10_TTherapySetting";
import TherapyFormatStep from "../components/questionnaire/steps/Step11_TTherapyFormat";
import TherapyDurationStep from "../components/questionnaire/steps/Step12_TTherapyDuration";
import SessionFrequencyStep from "../components/questionnaire/steps/Step13_TSessionFrequency";
import PatientGenderStep from "../components/questionnaire/steps/Step14_TPatientGender";
import ValuesPreferencesStep from "../components/questionnaire/steps/Step15_TValuesPreferences";
import AdditionalInfoStep from "../components/questionnaire/steps/Step16_TAdditionalInfo";
import AvailabilityStep from "../components/questionnaire/steps/Step17_TAvailability";
import SummaryStep from "../components/questionnaire/steps/Step18_TSummary";
import CompletionStep from "../components/questionnaire/steps/Step19_TCompletion";



interface QuestionnaireData {
  personalData: Record<string, string>;
  contactInfo: Record<string, string>;
  qualifications: Record<string, string>;
  experience: string[];
  specialties: { selected: string[]; other: string };
  languages: { selected: string[]; other: string };
  therapySchool: { selected: string[]; other: string };
  therapyMethods: string;
  therapySetting: string[];
  therapyFormat: string[];
  therapyDuration: string;
  sessionFrequency: string[];
  patientGender: string[];
  valuesPreferences: { selected: string[]; other: string };
  additionalInfo: string;
  availability: string[];
}

const initialData: QuestionnaireData = {
  personalData: {},
  contactInfo: {},
  qualifications: {},
  experience: [],
  specialties: { selected: [], other: "" },
  languages: { selected: [], other: "" },
  therapySchool: { selected: [], other: "" },
  therapyMethods: "",
  therapySetting: [],
  therapyFormat: [],
  therapyDuration: "",
  sessionFrequency: [],
  patientGender: [],
  valuesPreferences: { selected: [], other: "" },
  additionalInfo: "",
  availability: [],
};

const TherapistQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  // Data is stored in react-state, after refresh all data is lost
  const [data, setData] = useState<QuestionnaireData>(initialData); //Temporary answers are saved here as a QuestionnaireData-Object with all fields. 

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
    setCurrentStep(0);
    setData(initialData);
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
            onDataChange={(newData) => setData({ ...data, personalData: newData })}
          />
        );
      case 2:  
        return (
          <ContactInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.contactInfo}
            onDataChange={(newData) => setData({ ...data, contactInfo: newData })}
          />
        );
      case 3:
        return (
          <QualificationsStep
            onNext={goNext}
            onBack={goBack}
            data={data.qualifications}
            onDataChange={(newData) => setData({ ...data, qualifications: newData })}
          />
        );
      case 4:
        return (
          <ExperienceStep
            onNext={goNext}
            onBack={goBack}
            data={data.experience}
            onDataChange={(newData) => setData({ ...data, experience: newData })}
          />
        );
      case 5:
        return (
          <SpecialtiesStep
            onNext={goNext}
            onBack={goBack}
            data={data.specialties}
            onDataChange={(newData) => setData({ ...data, specialties: newData })}
          />
        );
      case 6:
        return (
          <LanguagesStep
            onNext={goNext}
            onBack={goBack}
            data={data.languages}
            onDataChange={(newData) => setData({ ...data, languages: newData })}
          />
        );
      case 7:
        return (
          <TherapySchoolStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySchool}
            onDataChange={(newData) => setData({ ...data, therapySchool: newData })}
          />
        );
      case 8:
        return (
          <TherapyMethodsStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyMethods}
            onDataChange={(newData) => setData({ ...data, therapyMethods: newData })}
          />
        );
      case 9:
        return (
          <TherapySettingStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapySetting}
            onDataChange={(newData) => setData({ ...data, therapySetting: newData })}
          />
        );
      case 10:
        return (
          <TherapyFormatStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyFormat}
            onDataChange={(newData) => setData({ ...data, therapyFormat: newData })}
          />
        );
      case 11:
        return (
          <TherapyDurationStep
            onNext={goNext}
            onBack={goBack}
            data={data.therapyDuration}
            onDataChange={(newData) => setData({ ...data, therapyDuration: newData })}
          />
        );
      case 12:
        return (
          <SessionFrequencyStep
            onNext={goNext}
            onBack={goBack}
            data={data.sessionFrequency}
            onDataChange={(newData) => setData({ ...data, sessionFrequency: newData })}
          />
        );
      case 13:
        return (
          <PatientGenderStep
            onNext={goNext}
            onBack={goBack}
            data={data.patientGender}
            onDataChange={(newData) => setData({ ...data, patientGender: newData })}
          />
        );
      case 14:
        return (
          <ValuesPreferencesStep
            onNext={goNext}
            onBack={goBack}
            data={data.valuesPreferences}
            onDataChange={(newData) => setData({ ...data, valuesPreferences: newData })}
          />
        );
      case 15:
        return (
          <AdditionalInfoStep
            onNext={goNext}
            onBack={goBack}
            data={data.additionalInfo}
            onDataChange={(newData) => setData({ ...data, additionalInfo: newData })}
          />
        );
      case 16:
        return (
          <AvailabilityStep
            onNext={goNext}
            onBack={goBack}
            data={data.availability}
            onDataChange={(newData) => setData({ ...data, availability: newData })}
          />
        );
      case 17:
        return (
          <SummaryStep
            onNext={goNext}
            onBack={goBack}
            onEdit={goToStep}
            data={data}
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

export default TherapistQuestionnaire;
