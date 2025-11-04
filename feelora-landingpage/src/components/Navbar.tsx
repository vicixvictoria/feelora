import { useState, useEffect } from 'react';
import { MenuIcon, XIcon, GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  const t = {
    de: {
      forPatients: 'Für Patient:Innen',
      forTherapists: 'Für Therapeut:Innen',
      whyFeelora: 'Warum Feelora',
      testimonials: 'Meinungen',
      login: 'Log in',
    },
    en: {
      forPatients: 'For Patients',
      forTherapists: 'For Therapists',
      whyFeelora: 'Why Feelora',
      testimonials: 'Testimonials',
      login: 'Log in',
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-2xl font-headline font-semibold text-gray-800 hover:text-primary transition-colors cursor-pointer"
            >
              Feelora
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('for-patients')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t[language].forPatients}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('for-therapists')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t[language].forTherapists}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('why-feelora')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t[language].whyFeelora}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {t[language].testimonials}
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
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            <Button
              onClick={() => scrollToSection('hero')}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t[language].login}
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
              {t[language].forPatients}
            </button>
            <button
              onClick={() => scrollToSection('for-therapists')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t[language].forTherapists}
            </button>
            <button
              onClick={() => scrollToSection('why-feelora')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t[language].whyFeelora}
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal py-3"
            >
              {t[language].testimonials}
            </button>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors font-normal"
              aria-label="Switch language"
            >
              <GlobeIcon className="w-5 h-5" />
              <span className="font-medium">{language === 'de' ? 'Deutsch' : 'English'}</span>
            </button>

            <Button
              onClick={() => scrollToSection('hero')}
              className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {t[language].login}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
