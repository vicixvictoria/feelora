import { useState, useEffect } from 'react';
import { MenuIcon, XIcon, GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menuLanding';
import logoFeelora from '@/assets/logo_feelora.png';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <button
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <img src={logoFeelora} alt="Feelora Logo" className="h-[3rem] w-auto object-contain" />
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('for-patients')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t('nav.forPatients')}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('for-therapists')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t('nav.forTherapists')}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('why-feelora')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t('nav.whyFeelora')}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t('nav.testimonials')}
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors font-normal"
              aria-label="Switch language"
            >
              <GlobeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
            </button>

            <Button
              onClick={handleLoginClick}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t('nav.login')}
            </Button>
          </div>

          <button
            className="md:hidden text-gray-800 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-8 py-8 space-y-6">
            <button
              onClick={() => scrollToSection('for-patients')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t('nav.forPatients')}
            </button>
            <button
              onClick={() => scrollToSection('for-therapists')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t('nav.forTherapists')}
            </button>
            <button
              onClick={() => scrollToSection('why-feelora')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t('nav.whyFeelora')}
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t('nav.testimonials')}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors font-normal"
              aria-label="Switch language"
            >
              <GlobeIcon className="w-5 h-5" />
              <span className="font-medium">{t('lang.name')}</span>
            </button>

            <Button
              onClick={handleLoginClick}
              className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t('nav.login')}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
