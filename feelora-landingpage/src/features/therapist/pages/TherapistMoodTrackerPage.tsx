import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import ninaAvatar from '@/assets/avatar-Placeholder.png';

interface PatientMoodEntry {
  name: string;
  avatar: string;
  date: string;
  mood: string;
  outdoor: string;
  physical: string;
  nextSession: string;
}

const patients: PatientMoodEntry[] = [
  {
    name: 'Nina',
    avatar: ninaAvatar,
    date: '18.10.2025, 13:00',
    mood: '😊',
    outdoor: '🌳',
    physical: '💪',
    nextSession: '21.10.2025\n09:00-10:00',
  },
  {
    name: 'Tom',
    avatar: ninaAvatar,
    date: '17.10.2025, 10:00',
    mood: '😊',
    outdoor: '🌳',
    physical: '💪',
    nextSession: '21.10.2025\n11:15-12:15',
  },
  {
    name: 'Mel',
    avatar: ninaAvatar,
    date: '19.10.2025, 10:00',
    mood: '😊',
    outdoor: '🌳',
    physical: '💪',
    nextSession: '21.10.2025\n14:00-15:00',
  },
  {
    name: 'Jon',
    avatar: ninaAvatar,
    date: '19.10.2025, 18:00',
    mood: '😊',
    outdoor: '🌳',
    physical: '💪',
    nextSession: '21.10.2025\n17:30-18:30',
  },
];

const TherapistMoodTrackerPage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t('app.therapist.moodTracker.title')}
        </h1>
        <p className="text-primary italic mt-1">{t('app.therapist.moodTracker.subtitle')}</p>
      </div>

      {/* Patient List with Next Session column */}
      <div className="flex gap-6">
        {/* Mood entries */}
        <div className="flex-1 flex flex-col gap-4">
          {patients.map((patient, index) => (
            <div key={index} className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="min-w-[120px]">
                  <p className="font-semibold text-foreground">{patient.name}</p>
                  <p className="text-sm text-primary">{patient.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 flex-1">
                <div className="text-center">
                  <span className="text-2xl">{patient.mood}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('app.therapist.moodTracker.feeling')}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">{patient.outdoor}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('app.therapist.moodTracker.outdoor')}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">{patient.physical}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('app.therapist.moodTracker.physical')}
                  </p>
                </div>
              </div>
              <button className="text-primary font-medium hover:underline flex items-center gap-1 self-end sm:self-auto">
                {t('app.therapist.moodTracker.details')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistMoodTrackerPage;
