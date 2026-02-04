import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface WelcomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

const Step1_PWelcome = ({ onNext, onBack }: WelcomeStepProps) => {
  return (
    <div className="animate-slide-up text-center max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-purple mb-6">
        Vielen Dank für deine Teilnahme an Feelora!
      </h1>
      
      <p className="text-foreground text-body-large mb-8">
        Bevor du beginnen kannst, erstellen wir ein Patient*innenprofil für dich. 
        Dafür werden wir gemeinsam unseren Patienten-Screening-Fragebogen" durchgehen, 
        um ein optimales Profil zu erstellen und dich mit passenden Therapeut*Innen zusammenzubringen.
      </p>
      
      <p className="text-foreground text-body-large mb-12">
        Dieser Fragebogen umfasst 16 Fragen.
      </p>

      <NavigationButtons 
        onBack={onBack} 
        onNext={onNext} 
        isFirstStep={true}
      />
    </div>
  );
};

export default Step1_PWelcome;
