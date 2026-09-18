import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ZapIcon, AwardIcon, UsersIcon, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card-landing';
import { useTranslation } from 'react-i18next';

type Stat = {
  icon: LucideIcon;
  value?: number;
  suffix?: string;
  bigText?: string;
  label: string;
  description: string;
};

export function WhyFeeloraSection() {
  const { t } = useTranslation();
  const [ref, inView] = useScrollReveal();

  const stats: Stat[] = [
    {
      icon: UsersIcon,
      value: 50,
      suffix: '+',
      label: t('why.stat1.label'),
      description: t('why.stat1.desc'),
    },
    {
      icon: AwardIcon,
      value: 71,
      suffix: '%',
      label: t('why.stat2.label'),
      description: t('why.stat2.desc'),
    },
    {
      icon: ZapIcon,
      bigText: t('why.stat3.value'),
      label: t('why.stat3.label'),
      description: t('why.stat3.desc'),
    },
  ];

  return (
    <section id="why-feelora" className="py-24 px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
            {t('why.title')}
          </h2>
          <p className="text-body-large text-gray-600 max-w-3xl mx-auto leading-body">
            {t('why.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-10 text-center bg-card border-border hover:shadow-xl transition-shadow h-full">
                <div className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center mx-auto mb-8">
                  <stat.icon className="w-10 h-10 text-tertiary-foreground" strokeWidth={1.5} />
                </div>
                {stat.value !== undefined && (
                  <div className="mb-6">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix ?? ''}
                      inView={inView}
                      delay={index * 0.2}
                    />
                  </div>
                )}
                {stat.bigText !== undefined && (
                  <div className="mb-6 text-4xl font-headline font-bold text-tertiary-foreground">
                    {stat.bigText}
                  </div>
                )}
                <h3 className="text-h4 font-headline font-semibold text-gray-800 mb-4">
                  {stat.label}
                </h3>
                <p className="text-body text-gray-600 leading-body">{stat.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({
  value,
  suffix,
  inView,
  delay,
}: {
  value: number;
  suffix: string;
  inView: boolean;
  delay: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const startTime = Date.now() + delay * 1000;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeOutQuad * endValue);
        setCount(currentValue);
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, delay]);

  return (
    <div className="text-5xl font-headline font-bold text-tertiary-foreground" aria-live="polite">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}
