import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, X, Send, Clock, Check, Search } from 'lucide-react';
import ninaAvatar from '@/assets/avatar-Placeholder.png';

interface Patient {
  name: string;
  avatar: string;
}

interface TaskStatus {
  patientName: string;
  avatar: string;
  date: string;
  status: 'in Bearbeitung' | 'Erledigt';
}

const patients: Patient[] = [
  { name: 'Patient 1', avatar: ninaAvatar },
  { name: 'Patient 2', avatar: ninaAvatar },
  { name: 'Patient 3', avatar: ninaAvatar },
];

const taskStatuses: TaskStatus[] = [
  {
    patientName: 'Patient 1',
    avatar: ninaAvatar,
    date: '20.09.2025',
    status: 'in Bearbeitung',
  },
  {
    patientName: 'Patient 2',
    avatar: ninaAvatar,
    date: '19.09.2025',
    status: 'Erledigt',
  },
  {
    patientName: 'Patient 3',
    avatar: ninaAvatar,
    date: '15.09.2025',
    status: 'Erledigt',
  },
];

const TherapistHomeworkPage = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [taskText, setTaskText] = useState('');

  const handleAssign = (name: string) => {
    setSelectedPatient(name);
    setTaskText('');
  };

  const handleCancel = () => {
    setSelectedPatient(null);
    setTaskText('');
  };

  const handleSend = () => {
    // Mock send
    setSelectedPatient(null);
    setTaskText('');
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      {/* Coming Soon Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {t('app.therapist.homework.comingSoon')}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t('app.therapist.homework.comingSoonTitle')}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
              {t('app.therapist.homework.comingSoonDesc')}
            </p>
            <button
              onClick={() => setShowOverlay(false)}
              className="mt-2 feelora-btn-outline"
            >
              {t('app.therapist.homework.revealPreview')}
            </button>
          </div>
        </div>
      )}
      {/* New Tasks Section */}
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.homework.createTasks')}
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        {/* Patient List */}
        <div className="flex-1 flex flex-col gap-4">
          {patients.map((patient) => (
            <div key={patient.name} className="feelora-card flex items-center gap-4">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="font-semibold text-foreground flex-1">{patient.name}</p>
              <button className="feelora-btn-primary" onClick={() => handleAssign(patient.name)}>
                {t('app.therapist.homework.assignTask')}
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Task Assignment Panel */}
        {selectedPatient && (
          <div className="w-full md:w-80 feelora-card flex flex-col gap-4">
            <p className="text-foreground font-medium text-center">
              {t('app.therapist.homework.composeTask', {
                name: selectedPatient,
              })}
            </p>
            <textarea
              className="w-full border border-border rounded-xl p-3 text-sm text-foreground bg-background resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={t('app.therapist.homework.taskPlaceholder')}
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button className="feelora-btn-outline" onClick={handleCancel}>
                {t('app.therapist.homework.cancel')}
                <X className="w-4 h-4" />
              </button>
              <button className="feelora-btn-primary" onClick={handleSend}>
                {t('app.therapist.homework.send')}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Status Section */}
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.homework.taskStatus')}
      </h2>
      <div className="flex flex-col gap-4">
        {taskStatuses.map((task, index) => (
          <div key={index} className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src={task.avatar}
                alt={task.patientName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="font-semibold text-foreground min-w-[140px]">{task.patientName}</p>
            </div>
            <p className="text-sm text-muted-foreground italic flex-1">
              {t('app.therapist.homework.taskFrom', { date: task.date })}
            </p>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'Erledigt'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {task.status === 'Erledigt' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {task.status === 'Erledigt'
                  ? t('app.therapist.homework.completed')
                  : t('app.therapist.homework.inProgress')}
              </span>
              <button className="feelora-btn-primary">
                {t('app.therapist.homework.details')}
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistHomeworkPage;
