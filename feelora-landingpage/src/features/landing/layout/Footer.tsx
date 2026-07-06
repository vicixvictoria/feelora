import { InstagramIcon, LinkedinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                href="https://www.instagram.com/feelora.at/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.linkedin.com/company/feelora/"
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
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.users.join')}
                </button>
              </li>
              <li>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.users.resources')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/support')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {t('footer.users.support')}
                </button>
              </li>
            </ul>
          </div>

         {/* Legal Section: */}
<div>
  <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-6">
    {t('footer.legal')}
  </h3>
  <ul className="space-y-3">
    <li>
      {/* Iubenda Privacy Policy Modal*/}
      <a
        href="https://www.iubenda.com/privacy-policy/89492002"
        className="iubenda-nostyle iubenda-noiframe iubenda-embed text-gray-600 hover:text-primary transition-colors"
      >
        {t('footer.legal.privacy')}
      </a>
    </li>
    <li>
      {/* custom Terms of Service */}
      <button
        onClick={() => navigate('/termsandconditions')} 
        className="text-gray-600 hover:text-primary transition-colors"
      >
        {t('footer.legal.terms')}
      </button>
    </li>
    <li>
      {/* Iubenda Cookie Policy Modal*/}
      <a
        href="https://www.iubenda.com/privacy-policy/89492002/cookie-policy"
        className="iubenda-nostyle iubenda-noiframe iubenda-embed text-gray-600 hover:text-primary transition-colors"
      >
        {t('footer.legal.cookies')}
      </a>
    </li>
    <li>
      {/* Required by GDPR: A button to reopen the cookie banner settings */}
     <button 
    onClick={(e) => {
      e.preventDefault();
      // Wir rufen die Iubenda API direkt auf (mit ts-ignore, damit TypeScript nicht meckert, 
      // weil _iub ein externes globales Objekt aus der index.html ist)
      // @ts-ignore
      if (window._iub?.cs?.api?.openPreferences) {
        // @ts-ignore
        window._iub.cs.api.openPreferences();
      }
    }}
    className="text-gray-600 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
  >
        {t('footer.legal.cookieSettings', 'Cookie-Einstellungen')}
  </button>
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
              <li></li>
              <li>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.about.contact')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 max-w-4xl mx-auto mb-4">
            {t('footer.disclaimer')}
          </p>
          <p className="text-body text-gray-600">
            © {new Date().getFullYear()} {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
