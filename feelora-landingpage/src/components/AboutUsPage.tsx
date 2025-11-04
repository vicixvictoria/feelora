import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AboutUsPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const teamMembers = [
    {
      name: 'Aylin Schatz',
      role: 'Gründerin',
      description: 'Entwickelte die Vision von Feelora während ihres Masterstudiums an der Rome Business School. Ausgezeichnet mit dem Pitch Day Award für Innovation, Social Impact und Zukunftspotenzial.',
    },
    {
      name: 'Michele Mussacchio',
      role: 'CTO & AI Engineer',
      description: 'Entwickelt KI-Systeme, die fühlen lernen. Erfahrung: AWS Business Group bei Accenture & AI Engineer bei Data Reply.',
    },
    {
      name: 'Victoria Zeillinger',
      role: 'UX/UI Designerin',
      description: 'Bringt ihre Expertise aus Medical Informatics und UX Research ein, um digitale Räume zu schaffen, die Vertrauen auslösen.',
    },
    {
      name: 'Carolin Böcker',
      role: 'Psychologin (B.Sc.)',
      description: 'Sorgt für wissenschaftliche Tiefe und psychologische Genauigkeit in allen Matching- und Mood-Modulen.',
    },
    {
      name: 'Delphine N\'Diaye',
      role: 'Brand Strategist & Communications Lead',
      description: 'Verbindet globale Perspektiven mit Empathie und Klarheit in der Kommunikation.',
    },
  ];

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
              Zurück
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8">
              Unsere Geschichte
            </h1>

            <div className="space-y-8 text-body-large leading-body" style={{ color: '#2F3E46' }}>
              <p className="text-h3 font-semibold text-gray-800">
                Wir glauben, mentale Gesundheit verdient mehr als Wartelisten und Zufall.
              </p>

              <p>
                Darum haben wir Feelora gegründet – eine Plattform, die Menschen und Therapeut:innen nicht einfach verbindet, sondern wirklich matcht. Mit smarter Technologie, die Empathie versteht. Mit einem Mood Tracker, der den Alltag zwischen den Sitzungen sichtbar macht. Und mit einem Design, das sich so leicht anfühlt, wie der erste Schritt zu mehr Balance.
              </p>

              <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
                <div>
                  <h2 className="text-h2 font-headline font-semibold text-tertiary-foreground mb-6">
                    Die Idee entstand aus echter Erfahrung.
                  </h2>

                  <p>
                    Unsere Gründerin <strong>Aylin Schatz</strong> erkannte während ihres Masterstudiums an der Rome Business School, wie dringend ein System fehlt, das Therapie einfacher, persönlicher und digitaler denkt. Für ihr Konzept wurde sie mit dem <strong>Pitch Day Award</strong> ausgezeichnet – für Innovation, Social Impact und Zukunftspotenzial.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative"
                >
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="https://c.animaapp.com/mhahgsoyNVf0kG/img/pitch-day-award.jpg"
                      alt="Pitch Day Award Gewinn"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="py-24 px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
              Unser Team
            </h2>
            <p className="text-body-large leading-body max-w-3xl mx-auto" style={{ color: '#2F3E46' }}>
              Heute steht hinter Feelora ein interdisziplinäres Team, das Wissenschaft, Design und Technologie vereint, um mentale Gesundheit neu zu denken:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-8 bg-card border-border hover:shadow-xl transition-shadow h-full">
                  <div className="flex gap-6 items-start">
                    <div className="flex-1">
                      <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-2">
                        {member.name}
                      </h3>
                      <p className="text-body font-semibold text-primary mb-4">
                        {member.role}
                      </p>
                      <p className="text-body leading-body" style={{ color: '#2F3E46' }}>
                        {member.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-tertiary/50 to-primary/30 flex items-center justify-center shadow-lg">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=96&background=4F378B&color=fff&bold=true`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <Card className="p-12 bg-gradient-to-br from-tertiary/30 to-background border-border">
              <h2 className="text-h2 font-headline font-semibold text-[#4f378b] mb-6">
                Unser Ziel
              </h2>
              <p className="text-body-large leading-body mb-4" style={{ color: '#2F3E46' }}>
                Therapie einfacher, menschlicher und nachhaltiger zu gestalten.
              </p>
              <p className="text-h3 font-semibold text-tertiary-foreground">
                Weil mentale Gesundheit kein Luxus ist – sondern Lebensqualität.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
