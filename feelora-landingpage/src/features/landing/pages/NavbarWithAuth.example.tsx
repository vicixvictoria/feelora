// Example: Enhanced Navbar with Authentication State
// This file shows how you can update Navbar.tsx to show different UI for authenticated users
// You can use this as a reference when you want to implement authentication state

import { useState, useEffect } from 'react';
import { MenuIcon, XIcon, GlobeIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'aws-amplify/auth';
import { S3_LOGO_FEELORA as logoFeelora } from '@/config/s3Assets';

export function NavbarWithAuth() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
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
          <div
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <img
              src={logoFeelora}
              alt="Feelora Logo"
              className="h-[3rem] w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation items */}
            <button
              onClick={() => scrollToSection('for-patients')}
              className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
            >
              {t('nav.forPatients')}
            </button>
            <button
              onClick={() => scrollToSection('for-therapists')}
              className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
            >
              {t('nav.forTherapists')}
            </button>
            <button
              onClick={() => scrollToSection('why-feelora')}
              className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
            >
              {t('nav.whyFeelora')}
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-700 hover:text-primary transition-colors cursor-pointer font-normal"
            >
              {t('nav.testimonials')}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors font-normal"
              aria-label="Switch language"
            >
              <GlobeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Auth-dependent button */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {user?.signInDetails?.loginId?.split('@')[0] || 'Profile'}
                      </span>
                    </button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="font-normal"
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
                  >
                    {t('nav.login')}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-800 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-8 h-8" />
            ) : (
              <MenuIcon className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
              <span className="font-medium">
                {language === 'de' ? 'Deutsch' : 'English'}
              </span>
            </button>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <div className="py-3 text-gray-700">
                      Logged in as: {user?.signInDetails?.loginId}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full font-normal"
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
                  >
                    {t('nav.login')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
