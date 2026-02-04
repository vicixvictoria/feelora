import { useState } from "react";
import FeeloraLogo from "@/assets/logo_feelora.png";
import ProgressBar from "@/components/questionnaire/ProgressBar";
import WelcomeStep from "../components/questionnaire/steps/Step1_PWelcome.tsx";
import PersonalDataStep from "../components/questionnaire/steps/Step2_PPersonalData";


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

const PatientQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>(initialData);

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
