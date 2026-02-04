import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { UsersIcon, TrendingUpIcon, BriefcaseIcon, BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { Card } from '@/components/ui/cardLanding';
import forTherapistsImg from '@/assets/for_therapists.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function ForTherapistsSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [isHovered, setIsHovered] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

{/* 🚧 TEST ONLY: Temporary route to questionnaire 🚧 */}
const questionNav = () => {
    navigate('/test-therapist');
    setIsMobileMenuOpen(false);
  };

  const handleLoginClickTherapist = () => {
    navigate('/loginTherapist');
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: UsersIcon,
      title: t('therapists.feature1.title'),
      description: t('therapists.feature1.desc'),
    },
    {
      icon: TrendingUpIcon,
      title:  t('therapists.feature2.title'),
      description: t('therapists.feature2.desc'),
    },
    {
      icon: BriefcaseIcon,
      title:  t('therapists.feature3.title'),
      description: t('therapists.feature3.desc'),
    },
    {
      icon: BarChartIcon,
      title:  t('therapists.feature4.title'),
      description: t('therapists.feature4.desc'),
    },
  ];

  return (
    <section id="for-therapists" className="py-24 px-8 bg-gradient-to-br from-tertiary/50 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative order-2 lg:order-1 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-3xl overflow-hidden shadow-2xl w-3/4"
            >
              <img
                src={forTherapistsImg}
                alt="therapist connection concept"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
              {t('therapists.title')} 
            </h2>
            <p className="text-body-large text-gray-600 mb-12 leading-body">
              {t('therapists.description')}
            </p>

            <div className="space-y-8 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-tertiary flex items-center justify-center">
                        <feature.icon className="w-7 h-7 text-tertiary-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-body text-gray-600 leading-body">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleLoginClickTherapist} 
              //onClick={questionNav} // --> only use for testing questionnaire UI //
              className="bg-primary text-secondary-foreground hover:bg-secondary font-normal text-base px-8"
            >
              Mitmachen
            </Button>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}
