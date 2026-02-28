import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeftIcon, ShieldIcon, FileTextIcon, CookieIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { Card } from '@/components/ui/cardLanding';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [activeSection, setActiveSection] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  const sections = [
    { id: 'privacy' as const, label: t('privacy.tab.privacy'), icon: ShieldIcon },
    { id: 'terms' as const, label: t('privacy.tab.terms'), icon: FileTextIcon },
    { id: 'cookies' as const, label: t('privacy.tab.cookies'), icon: CookieIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 px-8 bg-gradient-to-br from-tertiary/30 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-8 text-gray-700 hover:text-primary"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              {t('privacy.back')}
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8">
              {t('privacy.pageTitle')}
            </h1>

            <div className="flex flex-wrap gap-4 mb-12">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'outline'}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2"
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="py-12 px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {activeSection === 'privacy' && <PrivacySection />}
            {activeSection === 'terms' && <TermsSection />}
            {activeSection === 'cookies' && <CookiesSection />}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function PrivacySection() {
  const { t } = useTranslation();
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        {t('privacy.privacy.title')}
      </h2>

      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <div>
          <p className="font-semibold mb-2">{t('privacy.privacy.asOf')}</p>
          <p className="font-semibold mb-2">{t('privacy.privacy.responsible')}</p>
          <p>Feelora</p>
          <p>Feldkellergasse 24/16</p>
          <p>1130 Wien, Österreich</p>
          <p>E-Mail: info@feelora.com</p>
          <p>Web: www.feelora.com</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s1.title')}
          </h3>
          <p>{t('privacy.privacy.s1.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s2.title')}
          </h3>
          <p>{t('privacy.privacy.s2.text')}</p>
          <p className="mt-2">{t('privacy.privacy.s2.detail')}</p>
          <p>E-Mail: info@feelora.com</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s3.title')}
          </h3>
          <p className="mb-3">{t('privacy.privacy.s3.text')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('privacy.privacy.s3.li1')}</li>
            <li>{t('privacy.privacy.s3.li2')}</li>
            <li>{t('privacy.privacy.s3.li3')}</li>
            <li>{t('privacy.privacy.s3.li4')}</li>
            <li>{t('privacy.privacy.s3.li5')}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s4.title')}
          </h3>
          <p>{t('privacy.privacy.s4.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s5.title')}
          </h3>
          <p>{t('privacy.privacy.s5.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s6.title')}
          </h3>
          <p>{t('privacy.privacy.s6.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s7.title')}
          </h3>
          <p>{t('privacy.privacy.s7.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s8.title')}
          </h3>
          <p>{t('privacy.privacy.s8.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s9.title')}
          </h3>
          <p>{t('privacy.privacy.s9.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.privacy.s10.title')}
          </h3>
          <p>{t('privacy.privacy.s10.text')}</p>
        </div>
      </div>
    </Card>
  );
}

function TermsSection() {
  const { t } = useTranslation();
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        {t('privacy.terms.title')}
      </h2>

      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <p className="font-semibold">{t('privacy.terms.asOf')}</p>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s1.title')}
          </h3>
          <p>{t('privacy.terms.s1.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s2.title')}
          </h3>
          <p>{t('privacy.terms.s2.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s3.title')}
          </h3>
          <p>{t('privacy.terms.s3.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s4.title')}
          </h3>
          <p>{t('privacy.terms.s4.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s5.title')}
          </h3>
          <p>{t('privacy.terms.s5.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s6.title')}
          </h3>
          <p>{t('privacy.terms.s6.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s7.title')}
          </h3>
          <p>{t('privacy.terms.s7.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.terms.s8.title')}
          </h3>
          <p>{t('privacy.terms.s8.text')}</p>
        </div>
      </div>
    </Card>
  );
}

function CookiesSection() {
  const { t } = useTranslation();
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        {t('privacy.cookies.title')}
      </h2>

      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <p className="font-semibold">{t('privacy.cookies.asOf')}</p>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.cookies.s1.title')}
          </h3>
          <p>{t('privacy.cookies.s1.text')}</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.cookies.s2.title')}
          </h3>
          <p className="mb-3">{t('privacy.cookies.s2.text')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>{t('privacy.cookies.s2.necessary')}</strong>{' '}
              {t('privacy.cookies.s2.necessaryDesc')}
            </li>
            <li>
              <strong>{t('privacy.cookies.s2.analytics')}</strong>{' '}
              {t('privacy.cookies.s2.analyticsDesc')}
            </li>
            <li>
              <strong>{t('privacy.cookies.s2.marketing')}</strong>{' '}
              {t('privacy.cookies.s2.marketingDesc')}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('privacy.cookies.s3.title')}
          </h3>
          <p>{t('privacy.cookies.s3.text')}</p>
        </div>

        <div className="mt-12 p-6 bg-tertiary/20 rounded-lg">
          <p className="font-semibold text-gray-800 mb-2">{t('privacy.cookies.contact')}</p>
          <p>E-Mail: info@feelora.com</p>
          <p>Adresse: Feldkellergasse 24/16, 1130 Wien, Österreich</p>
        </div>
      </div>
    </Card>
  );
}
