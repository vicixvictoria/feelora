import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/questionnaire/button";

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  showBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isFirstStep?: boolean;
}

const NavigationButtons = ({
  onBack,
  onNext,
  showBack = true,
  nextLabel = "nächste",
  backLabel = "zurück",
  isFirstStep = false,
}: NavigationButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {showBack && !isFirstStep && (
        <Button variant="navOutline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      )}
      <Button variant="nav" onClick={onNext}>
        {nextLabel}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
