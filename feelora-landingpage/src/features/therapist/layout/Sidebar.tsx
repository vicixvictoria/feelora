import { Calendar, User, Send, Smile, BookOpen, Users2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    title: 'Chat',
    description: 'Nachrichten ansehen und schreiben',
    icon: Send,
    path: '/therapist/',
  },
  {
    title: 'Mood Tracker',
    description: 'Erfasse deine heutigen Emotionen und Gefühle',
    icon: Smile,
    path: '/therapist/mood-tracker',
  },
  {
    title: 'Profil',
    description: 'Einsicht in dein Profil und persönliche Informationen',
    icon: User,
    path: '/therapist/profile',
  },
  {
    title: 'Aufgaben',
    description: 'Einsicht in die Aufgaben deiner Patient*innen',
    icon: BookOpen,
    path: '/therapist/homework',
  },
  {
    title: 'Patient*innen',
    description: 'Einsicht in deine Patient*innen und neue Matches',
    icon: Users2,
    path: '/therapist/patients',
  },
  {
    title: 'Kalender',
    description: 'Einsicht in deine Termine und Verfügbarkeit',
    icon: Calendar,
    path: '/therapist/calendar',
  },
];

const Sidebar = () => {
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
