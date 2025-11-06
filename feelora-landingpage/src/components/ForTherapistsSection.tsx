import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UsersIcon, TrendingUpIcon, BriefcaseIcon, BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ForTherapistsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: UsersIcon,
      title: 'Smart Matching',
      description: 'Erhalte passende Klient:innen, deren Bedürfnisse zu deinem Fachgebiet passen.',
    },
    {
      icon: TrendingUpIcon,
      title: 'Praxiswachstum leicht gemacht',
      description: 'Erreiche neue Patient:innen, die aktiv nach Unterstützung suchen – online oder vor Ort.',
    },
    {
      icon: BriefcaseIcon,
      title: 'Alles an einem Ort',
      description: 'Verwalte Termine, Chats und Video-Sitzungen sicher und einfach auf einer Plattform.',
    },
    {
      icon: BarChartIcon,
      title: 'Patient:innen Insights ',
      description: 'Erhalte Einblicke aus dem Mood Tracker, um Behandlungen individuell anzupassen.',
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
                src="https://c.animaapp.com/mhahgsoyNVf0kG/img/ai_3.png"
                alt="therapist connection concept"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
              Für Therapeut:Innen
            </h2>
            <p className="text-body-large text-gray-600 mb-12 leading-body">
              Tritt unserem Netzwerk lizenzierter Fachleute bei und erweitere deine Praxis mit neuen Tools und Unterstützung.
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

            {/*<Button
              size="lg"
              onClick={() => scrollToSection('hero')}
              className="bg-primary text-secondary-foreground hover:bg-secondary font-normal text-base px-8"
            >
              Mitmachen
            </Button>
            */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
