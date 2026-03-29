import { useState } from 'react';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarNav } from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const switchLang = (lang: string) => i18n.changeLanguage(lang);

  const handleLogout = async () => {
    await logout('user');
  };

  return (
    <header className="h-16 bg-navbar-bg border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setSheetOpen(true)}
          className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <img src={feeloraLogo} alt="Feelora" className="w-10 h-10" />
        <span className="text-2xl font-semibold">
          Feel<span className="text-primary">ora</span>
        </span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
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
            <DropdownMenuItem onClick={() => navigate('account')}>{'Account'} 
</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
            {t('patient.header.languages')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => switchLang('de')} disabled={i18n.language === 'de'}>
              Deutsch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLang('en')} disabled={i18n.language === 'en'}>
              English
            </DropdownMenuItem>
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

      {/* Mobile logout (icon-only) */}
      <button
        onClick={handleLogout}
        className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
        aria-label={t('patient.header.logOut')}
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b border-border">
            <SheetTitle className="flex items-center gap-3">
              <img src={feeloraLogo} alt="Feelora" className="w-8 h-8" />
              <span className="text-xl font-semibold">
                Feel<span className="text-primary">ora</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <SidebarNav onNavigate={() => setSheetOpen(false)} />
          </div>

          <div className="border-t border-border px-3 py-4 flex flex-col gap-2">
            <button className="sidebar-item text-sm">{t('patient.header.emergency')}</button>
            <button className="sidebar-item text-sm">{t('patient.header.settings')}</button>
            <button
              className="sidebar-item text-sm"
              onClick={() => switchLang(i18n.language === 'de' ? 'en' : 'de')}
            >
              {t('patient.header.languages')}: {i18n.language === 'de' ? 'Deutsch' : 'English'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
