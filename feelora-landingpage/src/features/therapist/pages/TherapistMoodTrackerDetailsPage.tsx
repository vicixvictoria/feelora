import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { moodCategoryDefs, emojiDictionary } from '@/components/ui/moodtracker/mood-tracker';

const TherapistMoodTrackerDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const entry = location.state?.entry;

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <p className="text-muted-foreground mb-4">{t('app.patient.moodTrackerDetails.notFound')}</p>
        <button onClick={() => navigate('/therapist/mood-tracker')} className="feelora-btn-primary">
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const { patientName, date, fullQuestionnaire } = entry;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10 p-4 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('q.common.back', 'Zurück')}
      </button>

      {/* Therapist specific header showing Patient Name */}
      <div className="feelora-card mb-8 bg-primary/5 border-primary/20">
        <h1 className="text-2xl font-bold text-foreground">Mood Tracker: {patientName}</h1>
        <p className="text-muted-foreground mt-1">
          {t('app.patient.moodTrackerDetails.createdAt')} {date}
        </p>
      </div>

      <div className="feelora-card space-y-6">
        {moodCategoryDefs.map((category, index) => {
          const answers = fullQuestionnaire[index] || [];
          if (answers.length === 0) return null;

          return (
            <div key={index} className="pb-6 border-b border-border last:border-0 last:pb-0">
              <h3 className="font-medium text-foreground mb-3">{t(category.questionKey)}</h3>
              <div className="flex flex-wrap gap-3">
                {answers.map((answerKey: string) => (
                  <div
                    key={answerKey}
                    className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border"
                  >
                    <span className="text-xl">{emojiDictionary[answerKey] || '✨'}</span>
                    <span className="text-sm font-medium text-foreground">{t(answerKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TherapistMoodTrackerDetailsPage;
