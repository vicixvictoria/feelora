import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import pitchDay from '@/assets/RBSPitchDay.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import aylinFoto from '@/assets/Aylin-Foto.png';
import victoriaFoto from '@/assets/Victoria-Foto.jpeg';
import carolinFoto from '@/assets/Carolin-Foto.JPG';


export function AboutUsPage() {
  const { t } = useLanguage();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const teamMembers = [
    {
      name: 'Aylin Schatz',
      role: t('aboutus.team.aylin.role'),
      description: t('aboutus.team.aylin.desc'),
      pic: aylinFoto,
    },
    {
      name: 'Michele Musacchio',
      role: t('aboutus.team.michele.role'),
      description: t('aboutus.team.michele.desc'),
      pic: 'https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=96&background=4F378B&color=fff&bold=true',
    },
    {
      name: 'Victoria Zeillinger',
      role: t('aboutus.team.victoria.role'),
      description: t('aboutus.team.victoria.desc'),
      pic: victoriaFoto,
    },
    {
      name: 'Carolin Böcker',
      role: t('aboutus.team.carolin.role'),
      description: t('aboutus.team.carolin.desc'),
      pic: carolinFoto,
    },
    {
      name: 'Delphine N\'Diaye',
      role: t('aboutus.team.delphine.role'),
      description: t('aboutus.team.delphine.desc'),
      pic:'https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=96&background=4F378B&color=fff&bold=true',
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
              {t('aboutus.cta')}
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8">
              {t('aboutus.title')}
            </h1>

            <div className="space-y-8 text-body-large leading-body" style={{ color: '#2F3E46' }}>
              <h3 className="text-h3 font-headline font-semibold text-tertiary-foreground mb-6">
                {t('aboutus.title.subtitle')}
              </h3>

              <p>
                {t('aboutus.title.desc')}
              </p>

              <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
                <div>
                  <h3 className="text-h3 font-headline font-semibold text-tertiary-foreground mb-6">
                    {t('aboutus.title2')}
                  </h3>

                  <p>
                    {t('aboutus.title2.desc')}
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
                      src= {pitchDay}
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
              {t('aboutus.team.title')}
            </h2>
            <p className="text-body-large leading-body max-w-3xl mx-auto" style={{ color: '#2F3E46' }}>
              {t('aboutus.team.desc')}
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
                          src={member.pic}
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
                {t('aboutus.goal.title')}
              </h2>
              <p className="text-body-large leading-body mb-4" style={{ color: '#2F3E46' }}>
                {t('aboutus.goal.desc')}
              </p>
              <p className="text-h3 font-semibold text-tertiary-foreground">
                {t('aboutus.goal.subtitle')}
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
