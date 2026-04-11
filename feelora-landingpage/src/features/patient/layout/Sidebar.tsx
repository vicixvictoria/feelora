import { Calendar, User, Send, Smile, BookOpen, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = [
  {
    titleKey: 'patient.sidebar.profile',
    descKey: 'patient.sidebar.profileDesc',
    icon: User,
    path: '/patient/profile',
  },
  {
    titleKey: 'patient.sidebar.chat',
    descKey: 'patient.sidebar.chatDesc',
    icon: Send,
    path: '/patient/',
  },
  {
    titleKey: 'patient.sidebar.moodTracker',
    descKey: 'patient.sidebar.moodTrackerDesc',
    icon: Smile,
    path: '/patient/mood-tracker',
  },
   {
    titleKey: 'patient.sidebar.calendar',
    descKey: 'patient.sidebar.calendarDesc',
    icon: Calendar,
    path: '/patient/calendar',
  },
  {
    titleKey: 'patient.sidebar.homework',
    descKey: 'patient.sidebar.homeworkDesc',
    icon: BookOpen,
    path: '/patient/homework',
  },
  {
    titleKey: 'patient.sidebar.dashboard',
    descKey: 'patient.sidebar.dashboardDesc',
    icon: LayoutDashboard,
    path: '/patient/dashboard',
  },
];

export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/patient/'}
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
      <SidebarNav />
    </aside>
  );
};

export default Sidebar;
