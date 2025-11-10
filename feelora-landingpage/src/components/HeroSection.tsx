import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedWaves } from './AnimatedWaves';
import { TitleFrame } from './TitleFrame';
import { useLanguage } from '@/contexts/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedWaves />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-purple-900/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <TitleFrame />
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={() => scrollToSection('for-patients')}
            className="bg-primary text-primary-foreground hover:bg-secondary font-normal text-base px-8 py-6"
          >
            {t('hero.cta.regsiter.alt')} 
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection('for-therapists')}
            className="bg-white/80 backdrop-blur-sm text-gray-800 border-gray-300 hover:bg-white hover:border-gray-400 font-normal text-base px-8 py-6"
          >
            {t('hero.cta.info')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
