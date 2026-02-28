import { useState } from 'react';
import { Check, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import therapistAvatar from '@/assets/avatar-Placeholder.png'; // Placeholder
import { AlgorithmMatch } from '../../../types/profiles';
import { useTranslation } from 'react-i18next';

interface TherapistMatchStepProps {
  therapists: AlgorithmMatch[];
  onAccept: (therapistId: string) => void;
  onBack: () => void;
}

const Step18_TherapistMatch = ({ therapists, onAccept, onBack }: TherapistMatchStepProps) => {
  const { t } = useTranslation();
  const [showAlternativeMatches, setShowAlternativeMatches] = useState(false);

  // Fallback if no therapists were found
  if (!therapists || therapists.length === 0) {
    return (
      <div className="text-center p-8">
        <h2>{t('q.p.therapistMatch.noResults')}</h2>
        <Button onClick={onBack} className="mt-4">
          {t('q.p.therapistMatch.backToQuestionnaire')}
        </Button>
      </div>
    );
  }

  const bestMatch = therapists[0];
  const alternativeMatches = therapists.slice(1); // The remaining matches (usually 3)

  // Reusable component for a Therapist Card
  const TherapistCard = ({
    therapist,
    isBestMatch,
  }: {
    therapist: AlgorithmMatch;
    isBestMatch?: boolean;
  }) => {
    // Calculate age from BirthDate float (assuming Unix timestamp)
    const age = therapist.BirthDate
      ? Math.floor((Date.now() - therapist.BirthDate * 1000) / 31557600000)
      : 'k.A.';

    return (
      <div className="feelora-card mb-4 animate-fade-in">
        <div
          className={`border rounded-xl p-5 ${isBestMatch ? 'border-purple/50 bg-purple/5' : 'border-border'}`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <div>
                {/* ADD therapist.Title (if they have one, like "Dr.") */}
                <h2 className="text-lg font-bold text-purple">
                  {therapist.Title ? `${therapist.Title} ` : ''}
                  {therapist.Name} {therapist.Surname}
                </h2>
                {/* ADD therapist.JobTitle before Gender and Age */}
                <p className="text-purple text-sm">
                  {therapist.JobTitle} • {therapist.Gender}, {age} {t('q.p.therapistMatch.years')}
                </p>
              </div>
              <p className="text-foreground text-sm">
                <span className="text-muted-foreground">{t('q.p.therapistMatch.city')}:</span>{' '}
                {therapist.City}
              </p>
              <p className="text-foreground text-sm">
                <span className="text-muted-foreground">{t('q.p.therapistMatch.languages')}:</span>{' '}
                {therapist.Languages?.join(', ') || t('q.p.therapistMatch.noInfo')}
              </p>
              <p className="text-foreground text-sm">
                <span className="text-muted-foreground">
                  {t('q.p.therapistMatch.specialties')}:
                </span>{' '}
                {therapist.Specialties?.join(', ') || t('q.p.therapistMatch.noInfo')}
              </p>

              <div className="flex gap-3 mt-4 pt-2">
                <Button
                  onClick={() => onAccept(therapist.Id)}
                  className="feelora-btn-primary flex-1"
                >
                  {t('q.p.therapistMatch.accept')} <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            <img
              src={therapistAvatar} // With S3, this would be therapist.ProfilePicUrl
              alt={`${therapist.Name} ${therapist.Surname}`}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple mb-4">
          {showAlternativeMatches
            ? t('q.p.therapistMatch.titleAlternatives')
            : t('q.p.therapistMatch.titleBest')}
        </h1>
        <p className="text-foreground/80 leading-relaxed mb-4">
          {showAlternativeMatches
            ? t('q.p.therapistMatch.subtitleAlternatives')
            : t('q.p.therapistMatch.subtitleBest')}
        </p>
      </div>

      {/* Conditional Rendering: Best Match vs Alternatives */}
      {!showAlternativeMatches ? (
        <>
          <TherapistCard therapist={bestMatch} isBestMatch={true} />

          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAlternativeMatches(true)}
              className="text-muted-foreground"
            >
              {t('q.p.therapistMatch.chooseOther')} <X className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {alternativeMatches.map((therapist) => (
            <TherapistCard key={therapist.Id} therapist={therapist} />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-start mt-8">
        <Button variant="outline" onClick={onBack} className="feelora-btn-outline">
          <ChevronLeft className="w-4 h-4" />
          {t('q.p.therapistMatch.back')}{' '}
          {showAlternativeMatches && t('q.p.therapistMatch.toBestMatch')}
        </Button>
      </div>
    </div>
  );
};

export default Step18_TherapistMatch;
