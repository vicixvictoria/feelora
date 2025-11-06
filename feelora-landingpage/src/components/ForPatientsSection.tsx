import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { HeartIcon, CalendarIcon, BrainIcon, GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ForPatientsSection() {
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

  const features = [
    {
      icon: HeartIcon,
      title: 'Personalisierte Vermittlung',
      description: 'Beantworte ein paar Fragen – wir finden den oder die passende Therapeut:in für dich.',
      hasMiniature: false,
    },
    {
      icon: CalendarIcon,
      title: 'Einfache Terminplanung',
      description: 'Buche Sitzungen online oder persönlich – direkt über unsere App.',
      hasMiniature: false,
    },
    {
      icon: GlobeIcon,
      title: 'Immer verbunden',
      description: 'Chatte oder telefoniere mit deiner Therapeutin direkt in der App – wann immer du es brauchst.',
      hasMiniature: false,
    },
    {
      icon: BrainIcon,
      title: 'Mood Tracker & AI Assistant',
      description: 'Reflektiere dein Wohlbefinden mit einem intelligenten Stimmungs-Tagebuch. Deine Therapeutin kann – nur mit deinem Einverständnis – daraus wertvolle Einblicke für deine Behandlung gewinnen.',
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
              Für Patient:Innen
            </h2>
            <p className="text-body-large mb-12 leading-body" style={{ color: '#2F3E46' }}>
              Übernimm die Kontrolle über deine mentale Gesundheit mit personalisierter Unterstützung, die auf deine individuellen Bedürfnisse zugeschnitten ist.
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
                      </div>
                      {feature.hasMiniature && (
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className="w-20 h-20 rounded-lg overflow-hidden shadow-md cursor-pointer border-2 border-tertiary/30 hover:border-tertiary transition-all"
                            whileHover={{ scale: 1.05 }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                          >
                            <img
                              src="https://c.animaapp.com/mhahgsoyNVf0kG/img/moodtrackerdemo.png"
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
                                    src="https://c.animaapp.com/mhahgsoyNVf0kG/img/moodtrackerdemo.png"
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

            {/* <Button
              size="lg"
              onClick={() => scrollToSection('hero')}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal text-base px-8"
            >
              Jetzt Starten
            </Button>
            */}
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
                src="https://c.animaapp.com/mhahgsoyNVf0kG/img/gemini_generated_image_we6nyawe6nyawe6n.png"
                alt="patient digital therapy concept"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
