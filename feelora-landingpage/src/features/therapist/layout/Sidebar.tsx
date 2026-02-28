import { Calendar, User, Send, Smile, BookOpen, Users2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t('app.therapist.sidebar.chat'),
      description: t('app.therapist.sidebar.chatDesc'),
      icon: Send,
      path: '/therapist/',
    },
    {
      title: t('app.therapist.sidebar.moodTracker'),
      description: t('app.therapist.sidebar.moodTrackerDesc'),
      icon: Smile,
      path: '/therapist/mood-tracker',
    },
    {
      title: t('app.therapist.sidebar.profile'),
      description: t('app.therapist.sidebar.profileDesc'),
      icon: User,
      path: '/therapist/profile',
    },
    {
      title: t('app.therapist.sidebar.homework'),
      description: t('app.therapist.sidebar.homeworkDesc'),
      icon: BookOpen,
      path: '/therapist/homework',
    },
    {
      title: t('app.therapist.sidebar.patients'),
      description: t('app.therapist.sidebar.patientsDesc'),
      icon: Users2,
      path: '/therapist/patients',
    },
    {
      title: t('app.therapist.sidebar.calendar'),
      description: t('app.therapist.sidebar.calendarDesc'),
      icon: Calendar,
      path: '/therapist/calendar',
    },
  ];

  return (
    <aside className="w-60 bg-sidebar min-h-screen py-6 px-3">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/therapist/'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
          >
            <item.icon className="w-5 h-5 text-sidebar-text mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-text">{item.title}</span>
              <span className="text-xs text-sidebar-muted leading-tight">{item.description}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
