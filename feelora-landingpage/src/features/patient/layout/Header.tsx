import { ChevronDown, LogOut } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();

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
            {t('patient.header.emergency')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('patient.header.emergencyNumbers')}</DropdownMenuItem>
            <DropdownMenuItem>{t('patient.header.crisisHotline')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('patient.header.settings')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('patient.header.notifications')}</DropdownMenuItem>
            <DropdownMenuItem>{t('patient.header.privacy')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('patient.header.languages')}
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
          {t('patient.header.logOut')}
        </button>
      </nav>
    </header>
  );
};

export default Header;
