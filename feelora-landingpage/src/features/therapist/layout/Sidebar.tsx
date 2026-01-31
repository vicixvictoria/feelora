import { Calendar, User, Send, Smile, BookOpen, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Chat",
    description: "Nachrichten ansehen und schreiben",
    icon: Send,
    path: "/therapist/",
  },
  {
    title: "Mood Tracker",
    description: "Erfasse deine heutigen Emotionen und Gefühle",
    icon: Smile,
    path: "/therapist/mood-tracker",
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
