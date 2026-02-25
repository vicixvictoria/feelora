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
  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Coming Soon Watermark */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <p
          className="text-7xl font-extrabold text-primary/20 uppercase tracking-widest select-none"
          style={{ transform: 'rotate(-25deg)' }}
        >
          Coming Soon
        </p>
      </div>
      {/* New Tasks */}
      <h1 className="text-2xl font-bold text-purple mb-6">Neue Aufgaben</h1>
      <div className="space-y-4 mb-10">
        {newTasks.map((task) => (
          <div key={task.id} className="feelora-card flex items-center gap-4">
            <img src={avatar} alt="Therapist" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 bg-secondary/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <p className="text-foreground">{task.message}</p>
            </div>
            <div className="flex gap-2">
              <button className="feelora-btn-outline">
                Notizen
                <FileText className="w-4 h-4" />
              </button>
              <button className="feelora-btn-primary">
                Erledigt!
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Tasks */}
      <h2 className="text-2xl font-bold text-purple mb-6">Erledigte Aufgaben</h2>
      <div className="space-y-4">
        {completedTasks.map((task) => (
          <div key={task.id} className="feelora-card flex items-center gap-4">
            <div className="flex-1">
              <p className="text-foreground">{task.message}</p>
            </div>
            <button className="feelora-btn-primary">
              Wiederholen
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeworkPage;
