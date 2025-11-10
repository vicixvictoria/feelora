import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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
  };

  return (
    <footer className="bg-gray-50 text-gray-700 py-16 px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-6">
              {t('footer.stayConnected')}
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-6">
              {t('footer.users')}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('for-therapists')}
                  className="text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.users.join')}
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.users.resources')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.users.support')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-6">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.legal.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.legal.cookies')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-6">
              {t('footer.about')}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.about.story')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('for-therapists')}
                  className="text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.about.join')}
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.about.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-body text-gray-600">
            © {new Date().getFullYear()} {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
