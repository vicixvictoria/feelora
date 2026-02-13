import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { HeartIcon, CalendarIcon, BrainIcon, GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { Card } from '@/components/ui/cardLanding';
import forPatientsImg from '@/assets/for_patients.png';
import moodTrackerDemo from '@/assets/MoodTrackerDemo.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function ForPatientsSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [isHovered, setIsHovered] = useState(false);

  {/* 🚧 TEST ONLY: Temporary route to questionnaire 🚧 */}
  const questionNav = () => {
    navigate('/test-patient');
    setIsMobileMenuOpen(false);
  };

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

  const patientDashboardNav = () => {
    navigate('/patient');
    setIsMobileMenuOpen(false);
  };
  

  const features = [
    {
      icon: HeartIcon,
      title: t('patients.feature1.title'),
      description:  t('patients.feature1.desc'),
      hasMiniature: false,
    },
    {
      icon: CalendarIcon,
      title: t('patients.feature2.title'),
      description: t('patients.feature2.desc'),
      hasMiniature: false,
    },
    {
      icon: GlobeIcon,
      title: t('patients.feature3.title'),
      description: t('patients.feature3.desc'),
      hasMiniature: false,
    },
    {
      icon: BrainIcon,
      title: t('patients.feature4.title'),
      description: t('patients.feature4.desc'),
      hasMiniature: true,
    },
  ];

  return (
    <section id="for-patients" className="py-24 px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
              {t('patients.title')} 
            </h2>
            <p className="text-body-large mb-12 leading-body" style={{ color: '#2F3E46' }}>
              {t('patients.description')}
              </p>

            <div className="space-y-8 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-tertiary flex items-center justify-center">
                        <feature.icon className="w-7 h-7 text-tertiary-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-body leading-body" style={{ color: '#2F3E46' }}>
                          {feature.description}
                        </p>
                        {feature.hasMiniature && (
                          <div className="mt-4 block md:hidden">
                            <img
                              src={moodTrackerDemo}
                              alt="Mood Tracker Preview"
                              className="w-full h-auto rounded-xl border-tertiary/30"
                            />
                          </div>
                        )}
                      </div>
                      {feature.hasMiniature && (
                        <div className="relative flex-shrink-0 hidden md:block">
                          <motion.div
                            className="w-20 h-20 rounded-lg overflow-hidden shadow-md cursor-pointer border-2 border-tertiary/30 hover:border-tertiary transition-all"
                            whileHover={{ scale: 1.05 }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                          >
                            <img
                              src={moodTrackerDemo}
                              alt="Mood Tracker Preview"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                                              
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="absolute top-0 right-24 z-50"
                              >
                                <div className="bg-white rounded-2xl shadow-2xl p-4 w-80 border-2 border-tertiary">
                                  <img
                                    src={moodTrackerDemo}
                                    alt="Mood Tracker Demo"
                                    className="w-full h-auto object-contain rounded-lg"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              //onClick={handleLoginClick}
              onClick={questionNav} // --> only use for testing questionnaire UI
              //onClick={patientDashboardNav} // --> only use for testing Dashboard UI without Auth//
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal text-base px-8"
            >
            {t('patients.cta')}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-3xl overflow-hidden shadow-2xl w-3/4"
            >
              <img
                src={forPatientsImg}
                alt="patient digital therapy concept"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
