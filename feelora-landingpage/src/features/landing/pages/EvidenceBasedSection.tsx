import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SmartphoneIcon, FileCheckIcon } from 'lucide-react';
import { Card } from '@/components/ui/card-landing';
import { useTranslation } from 'react-i18next';

export function EvidenceBasedSection() {
  const { t } = useTranslation();
  const [ref, inView] = useScrollReveal();

  return (
    <section className="py-24 px-8 bg-gradient-to-br from-tertiary/50 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
            {t('evidence.title')}
          </h2>
          <p className="text-body-large text-gray-600 max-w-3xl mx-auto leading-body">
            {t('evidence.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-10 bg-card border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <SmartphoneIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-6">
                {t('evidence.digital.title')}
              </h3>
              <p className="text-body text-gray-600 leading-body mb-6">
                {t('evidence.digital.desc')}
              </p>
              <ul className="space-y-4 text-body text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{t('evidence.digital.point1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{t('evidence.digital.point2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{t('evidence.digital.point3')}</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="p-10 bg-card border-border">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-8">
                <FileCheckIcon className="w-8 h-8 text-secondary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-6">
                {t('evidence.based.title')}
              </h3>
              <p className="text-body text-gray-600 leading-body mb-6">
                {t('evidence.based.desc')}
              </p>
              <ul className="space-y-4 text-body text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>{t('evidence.based.point1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>{t('evidence.based.point2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>{t('evidence.based.point3')}</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
