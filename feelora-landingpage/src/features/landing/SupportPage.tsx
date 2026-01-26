import { motion } from 'framer-motion';
import { ArrowLeftIcon, MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';


export function SupportPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 px-8 bg-gradient-to-br from-tertiary/30 to-background">
        <div className="max-w-4xl mx-auto">
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
              {t('support.back')}
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8">
              {t('support.title')}
            </h1>

            <Card className="p-12 bg-card border-border text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                <MailIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>

              <p className="text-body-large leading-body mb-8" style={{ color: '#2F3E46' }}>
                {t('support.subtitle')}
              </p>

              <a
                href="mailto:info@feelora.com"
                className="inline-flex items-center gap-2 text-h3 font-headline font-semibold text-primary hover:text-secondary transition-colors"
              >
                <MailIcon className="w-6 h-6" strokeWidth={1.5} />
                info@feelora.com
              </a>

              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-body text-gray-600 leading-body">
                  {t('support.message')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
