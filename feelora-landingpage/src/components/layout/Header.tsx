import { ChevronDown, LogOut } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
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
            {t('layout.header.emergency')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('layout.header.emergencyNumbers')}</DropdownMenuItem>
            <DropdownMenuItem>{t('layout.header.crisisHotline')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('layout.header.insights')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('layout.header.moodStatistics')}</DropdownMenuItem>
            <DropdownMenuItem>{t('layout.header.progress')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('layout.header.settings')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('layout.header.notifications')}</DropdownMenuItem>
            <DropdownMenuItem>{t('layout.header.privacy')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('layout.header.personalData')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t('layout.header.myData')}</DropdownMenuItem>
            <DropdownMenuItem>{t('layout.header.exportData')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <LogOut className="w-4 h-4" />
          {t('layout.header.logOut')}
        </button>
      </nav>
    </header>
  );
};

export default Header;
