import { Calendar, User, Send, Smile, BookOpen, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Kalender",
    description: "Zeitplan verwalten",
    icon: Calendar,
    path: "/patient/calendar",
  },
  {
    title: "Profil",
    description: "Profil und Therapeut einsehen",
    icon: User,
    path: "/patient/profile",
  },
  {
    title: "Chat",
    description: "Nachrichten ansehen und schreiben",
    icon: Send,
    path: "/patient/",
  },
  {
    title: "Mood Tracker",
    description: "Erfasse deine heutigen Emotionen und Gefühle",
    icon: Smile,
    path: "/patient/mood-tracker",
  },
  {
    title: "Homework",
    description: "Erledige deine Aufgaben",
    icon: BookOpen,
    path: "/patient/homework",
  },
  {
    title: "Dashboard",
    description: "Einsicht in deine wichtigsten Informationen",
    icon: LayoutDashboard,
    path: "/patient/dashboard",
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
            end={item.path === "/patient/"}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-item-active" : ""}`
            }
          >
            <item.icon className="w-5 h-5 text-sidebar-text mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-text">
                {item.title}
              </span>
              <span className="text-xs text-sidebar-muted leading-tight">
                {item.description}
              </span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
