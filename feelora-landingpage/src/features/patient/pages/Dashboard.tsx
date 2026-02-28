import { Calendar, Send, Smile, BookOpen, ChevronRight } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const notificationCards = [
    {
      icon: Calendar,
      iconColor: 'text-purple',
      title: t('patient.dashboard.calendar'),
      lines: [
        t('patient.dashboard.upcomingAppointments'),
        t('patient.dashboard.appointmentRequest'),
      ],
      path: '/calendar',
    },
    {
      icon: Send,
      iconColor: 'text-purple',
      title: t('patient.dashboard.chat'),
      lines: [t('patient.dashboard.unreadMessage')],
      path: '/chat',
    },
    {
      icon: Smile,
      iconColor: 'text-purple',
      title: t('patient.dashboard.moodTracker'),
      lines: [t('patient.dashboard.dailyReminder')],
      path: '/mood-tracker',
    },
    {
      icon: BookOpen,
      iconColor: 'text-purple',
      title: t('patient.dashboard.tasks'),
      lines: [t('patient.dashboard.tasksWaiting')],
      path: '/homework',
    },
  ];

  const moodDiary = [
    {
      date: '20.09.25, 13:00',
      status: t('patient.dashboard.statusNew'),
      mood: '😊',
      outdoor: '🌳',
      physical: '💪',
    },
    {
      date: '13.09.25, 13:00',
      status: t('patient.dashboard.statusSeen'),
      mood: '😊',
      outdoor: '🌳',
      physical: '💪',
    },
    {
      date: '06.09.25, 13:00',
      status: t('patient.dashboard.statusSeen'),
      mood: '😊',
      outdoor: '🌳',
      physical: '💪',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Notification Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {notificationCards.map((card, index) => (
          <button
            key={index}
            className="feelora-card relative flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow text-left"
            onClick={() => navigate(card.path)}
          >
            {'badge' in card && (card as { badge: number }).badge > 0 && (
              <span className="feelora-badge">{(card as { badge: number }).badge}</span>
            )}
            <card.icon className={`w-10 h-10 ${card.iconColor}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              {card.lines.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Mark all as read button */}
      <div className="flex justify-center mb-10">
        <button className="feelora-btn-primary px-8">{t('patient.dashboard.allRead')}</button>
      </div>

      {/* Mood Tracker Diary */}
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {t('patient.dashboard.moodDiary')}
      </h2>
      <div className="flex flex-col gap-4">
        {moodDiary.map((entry, index) => (
          <div key={index} className="feelora-card flex items-center gap-6">
            <img src={avatar} alt="User" className="w-14 h-14 rounded-full object-cover" />
            <div className="flex-1">
              <p className="font-medium text-primary">{entry.date}</p>
              <p className="text-sm text-muted-foreground italic">{entry.status}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-2xl">{entry.mood}</span>
                <p className="text-xs text-muted-foreground mt-1">{t('patient.dashboard.mood')}</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">{entry.outdoor}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('patient.dashboard.outdoor')}
                </p>
              </div>
              <div className="text-center">
                <span className="text-2xl">{entry.physical}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('patient.dashboard.physical')}
                </p>
              </div>
            </div>
            <button className="text-primary font-medium hover:underline">
              {t('patient.dashboard.details')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
