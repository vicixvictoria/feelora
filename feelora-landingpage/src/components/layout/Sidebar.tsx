import { Calendar, User, Send, Smile, BookOpen, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();

  const menuItems = [
    {
      titleKey: 'layout.sidebar.calendar',
      descKey: 'layout.sidebar.calendarDesc',
      icon: Calendar,
      path: '/calendar',
    },
    {
      titleKey: 'layout.sidebar.profile',
      descKey: 'layout.sidebar.profileDesc',
      icon: User,
      path: '/profile',
    },
    {
      titleKey: 'layout.sidebar.chat',
      descKey: 'layout.sidebar.chatDesc',
      icon: Send,
      path: '/chat',
    },
    {
      titleKey: 'layout.sidebar.moodTracker',
      descKey: 'layout.sidebar.moodTrackerDesc',
      icon: Smile,
      path: '/mood-tracker',
    },
    {
      titleKey: 'layout.sidebar.homework',
      descKey: 'layout.sidebar.homeworkDesc',
      icon: BookOpen,
      path: '/homework',
    },
    {
      titleKey: 'layout.sidebar.dashboard',
      descKey: 'layout.sidebar.dashboardDesc',
      icon: LayoutDashboard,
      path: '/',
    },
  ];

  return (
    <aside className="w-60 bg-sidebar min-h-screen py-6 px-3">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
    </aside>
  );
};

export default Sidebar;
