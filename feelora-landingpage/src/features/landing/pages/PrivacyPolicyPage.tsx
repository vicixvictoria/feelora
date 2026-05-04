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
              {t('privacy.back', 'Back')}
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8 flex items-center gap-4 uppercase">
              <FileTextIcon className="w-8 h-8 text-[#4f378b]" />
              {t('agb.terms.title')}
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

  // Dynamically generate an array [1, 2, 3, ..., 33] so we don't have to write 33 blocks of code
  const sectionNumbers = Array.from({ length: 33 }, (_, i) => i + 1);

  return (
    <Card className="p-12 bg-card border-border">
      <div className="space-y-12 text-body leading-body" style={{ color: '#2F3E46' }}>
        
        {/* Header & Date */}
        <p className="font-semibold text-gray-500">{t('agb.terms.lastUpdated')}</p>

        {/* Introduction Section */}
        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
            {t('agb.terms.intro.title')}
          </h3>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
            {t('agb.terms.intro.text')}
          </p>
        </div>

        {/* Dynamic mapping of all 33 Terms & Conditions sections */}
        {sectionNumbers.map((num) => (
          <div key={num} className="pt-4 border-t border-gray-100">
            <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">
              {t(`agb.terms.s${num}.title`)}
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {t(`agb.terms.s${num}.text`)}
            </p>
          </div>
        ))}
        
      </div>
    </Card>
  );
}