import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TrophyIcon, Rocket, Handshake, Cpu, CalendarDays, Network } from 'lucide-react';
import { Card } from '@/components/ui/card-landing';
import { useTranslation } from 'react-i18next';

export function AchievementsSection() {
  const { t } = useTranslation();
  const [ref, inView] = useScrollReveal();

  const categories = [
    {
      label: t('achievements.awards.label'),
      Icon: TrophyIcon,
      accent: 'text-tertiary-foreground',
      items: [
        { icon: TrophyIcon, text: t('achievements.awards.item1') },
      ],
    },
    {
      label: t('achievements.programs.label'),
      Icon: Network,
      accent: 'text-tertiary-foreground',
      items: [
        { icon: Rocket, text: t('achievements.programs.item1') },
        { icon: Cpu, text: t('achievements.programs.item2') },
      ],
    },
    {
      label: t('achievements.events.label'),
      Icon: CalendarDays,
      accent: 'text-tertiary-foreground',
      items: [
        { icon: Handshake, text: t('achievements.events.item1') },
      ],
    },
  ];

  return (
    <section className="py-24 px-8 bg-gradient-to-br from-background to-tertiary/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-4">
            {t('achievements.title')}
          </h2>
          <p className="text-body-large text-gray-600 max-w-2xl mx-auto leading-body">
            {t('achievements.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, ci) => {
            const Icon = cat.Icon;
            return (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + ci * 0.15 }}
                className="rounded-3xl bg-card border border-border p-8 flex flex-col gap-5"
              >
                {/* subsection header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-tertiary">
                    <Icon className={`w-5 h-5 ${cat.accent}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-body font-headline font-semibold text-gray-800">{cat.label}</h3>
                </div>

                {/* achievement cards */}
                <div className="flex flex-col gap-3">
                  {cat.items.map((item, ii) => {
                    const ItemIcon = item.icon;
                    return (
                      <Card key={ii} className="flex items-start gap-3 p-4 bg-background border-border">
                        <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                          <ItemIcon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{item.text}</p>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
