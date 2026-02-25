import { ChevronDown, LogOut } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout('user');
  };

  return (
    <header className="h-16 bg-navbar-bg border-b border-border flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={feeloraLogo} alt="Feelora" className="w-10 h-10" />
        <span className="text-2xl font-semibold">
          Feel<span className="text-primary">ora</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Notfall
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Notfall Nummern</DropdownMenuItem>
            <DropdownMenuItem>Krisenhotline</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Settings
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Benachrichtigungen</DropdownMenuItem>
            <DropdownMenuItem>Privatsphäre & Datenschutz</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Sprachen
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Deutsch</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </nav>
    </header>
  );
};

export default Header;
