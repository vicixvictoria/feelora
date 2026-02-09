import { ChevronDown, LogOut } from "lucide-react";
import { S3_LOGO as feeloraLogo } from "@/config/s3Assets";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {

  const { logout } = useAuth(); // Get the logout function 
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 // Create async handler with await - backend fetch call to clear the cookie before user leaves
  const handleLogout = async () => {
    setIsMobileMenuOpen(false); // Close menu if open
    await logout('user'); // Calls Backend + Clears State + Redirects to Cognito logout
  };
 
  const landingPageNav = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
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
            Emergency
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Notfall Nummern</DropdownMenuItem>
            <DropdownMenuItem>Krisenhotline</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Insights
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Mood Statistiken</DropdownMenuItem>
            <DropdownMenuItem>Fortschritt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Settings
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Benachrichtigungen</DropdownMenuItem>
            <DropdownMenuItem>Datenschutz</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            Personal Data
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Meine Daten</DropdownMenuItem>
            <DropdownMenuItem>Daten exportieren</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </nav>
    </header>
  );
};

export default Header;
