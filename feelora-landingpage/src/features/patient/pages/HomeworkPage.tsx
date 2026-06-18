import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FileText, RefreshCw } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';

interface Task {
  id: number;
  message: string;
  completed: boolean;
}

const newTasks: Task[] = [
  {
    id: 1,
    message:
      'Schreibe dir bis zu unserer nächsten Sitzung 3 Dinge auf, die dich zum lächeln gebracht haben.',
    completed: false,
  },
  {
    id: 2,
    message:
      'Mache für eine Woche täglich den Mood Tracker. Wir werden die Ergebnisse in der nächsten Sitzung besprechen!',
    completed: false,
  },
];

const completedTasks: Task[] = [
  {
    id: 3,
    message: 'Atemübungen jeden Abend gemacht.',
    completed: true,
  },
  {
    id: 4,
    message: 'Aufgabe 2 für die Woche erledigt',
    completed: true,
  },
];

const HomeworkPage = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="max-w-4xl animate-fade-in relative">
      {/* Coming Soon Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {t('patient.homework.comingSoon')}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t('patient.homework.comingSoonTitle')}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
              {t('patient.homework.comingSoonDesc')}
            </p>
            <button
              onClick={() => setShowOverlay(false)}
              className="mt-2 feelora-btn-outline"
            >
              {t('patient.homework.revealPreview')}
            </button>
          </div>
        </div>
      )}
      {/* New Tasks */}
      <h1 className="text-2xl font-bold text-purple mb-6">{t('patient.homework.newTasks')}</h1>
      <div className="space-y-4 mb-10">
        {newTasks.map((task) => (
          <div
            key={task.id}
            className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <img
                src={avatar}
                alt="Therapist"
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 bg-secondary/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <p className="text-foreground">{task.message}</p>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button className="feelora-btn-outline">
                {t('patient.homework.notes')}
                <FileText className="w-4 h-4" />
              </button>
              <button className="feelora-btn-primary">
                {t('patient.homework.done')}
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Tasks */}
      <h2 className="text-2xl font-bold text-purple mb-6">
        {t('patient.homework.completedTasks')}
      </h2>
      <div className="space-y-4">
        {completedTasks.map((task) => (
          <div key={task.id} className="feelora-card flex items-center gap-4">
            <div className="flex-1">
              <p className="text-foreground">{task.message}</p>
            </div>
            <button className="feelora-btn-primary">
              {t('patient.homework.repeat')}
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeworkPage;
