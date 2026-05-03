import { motion } from 'framer-motion';
import { ArrowLeftIcon, FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button-landing';
import { Card } from '@/components/ui/card-landing';
import { useTranslation } from 'react-i18next';


//only T&C now
export function PrivacyPolicyPage() {
  const { t } = useTranslation();

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

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8 flex items-center gap-4">
              <FileTextIcon className="w-8 h-8 text-[#4f378b]" />
              {t('privacy.tab.terms')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TermsSection />
          </motion.div>
        </div>
      </section>
    </div>
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