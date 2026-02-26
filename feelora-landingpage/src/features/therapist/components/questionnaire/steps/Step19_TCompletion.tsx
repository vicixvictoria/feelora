import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface CompletionStepProps {
  onRestart: () => void;
}
const Step19_TCompletion = ({ onRestart }: CompletionStepProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in text-center py-12">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
      </div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-purple mb-4">Vielen Dank!</h1>
      {/* Description */}
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        Dein Therapeutenprofil wurde erfolgreich erstellt. Wir überprüfen nun deine Lizenznummer und
        bereiten dein Profil für die Vermittlung vor. Wir werden dich per Mail benachrichtigen,
        sobald du als Therapeut:In in unserem System aktiv bist und auf dein Dashboard zugreifen
        kannst. Das kann 1-3 Werktage dauern.
      </p>
      {/* Restart Button */}
      <Button onClick={onRestart} className="feelora-btn-outline">
        Fragebogen erneut starten falls du etwas ändern möchtest
      </Button>
    </div>
  );
};
export default Step19_TCompletion;
