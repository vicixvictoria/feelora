import { Calendar, User, Send, Smile, BookOpen, Users2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = [
  {
    titleKey: 'app.therapist.sidebar.chat',
    descKey: 'app.therapist.sidebar.chatDesc',
    icon: Send,
    path: '/therapist/',
  },
  {
    titleKey: 'app.therapist.sidebar.moodTracker',
    descKey: 'app.therapist.sidebar.moodTrackerDesc',
    icon: Smile,
    path: '/therapist/mood-tracker',
  },
  {
    titleKey: 'app.therapist.sidebar.profile',
    descKey: 'app.therapist.sidebar.profileDesc',
    icon: User,
    path: '/therapist/profile',
  },
  {
    titleKey: 'app.therapist.sidebar.homework',
    descKey: 'app.therapist.sidebar.homeworkDesc',
    icon: BookOpen,
    path: '/therapist/homework',
  },
  {
    titleKey: 'app.therapist.sidebar.patients',
    descKey: 'app.therapist.sidebar.patientsDesc',
    icon: Users2,
    path: '/therapist/patients',
  },
  {
    titleKey: 'app.therapist.sidebar.calendar',
    descKey: 'app.therapist.sidebar.calendarDesc',
    icon: Calendar,
    path: '/therapist/calendar',
  },
];

export const TherapistSidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/therapist/'}
          onClick={onNavigate}
          className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
        >
          <item.icon className="w-5 h-5 text-sidebar-text mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-text">{t(item.titleKey)}</span>
            <span className="text-xs text-sidebar-muted leading-tight">{t(item.descKey)}</span>
          </div>
        </NavLink>
      ))}
    </nav>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-60 bg-sidebar h-screen sticky top-0 py-6 px-3 overflow-y-auto">
          <TherapistSidebarNav />
        </aside>
  );
};

export default Sidebar;
