import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { SmartphoneIcon, FileCheckIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function EvidenceBasedSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [effectiveness, setEffectiveness] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const startTime = Date.now();
    const endValue = 80;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeOutQuad * endValue);
        setEffectiveness(currentValue);
        requestAnimationFrame(animate);
      } else {
        setEffectiveness(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [inView]);

  return (
    <section className="py-24 px-8 bg-gradient-to-br from-tertiary/50 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
            Evidenzbasiert & Wirksam
          </h2>
          <p className="text-body-large text-gray-600 max-w-3xl mx-auto leading-body">
            Unser Ansatz kombiniert neuste Technologie mit bewährten therapeutischen Methoden, um messbare Ergebnisse zu erzielen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-10 bg-card border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <SmartphoneIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-6">
                Digitalisierte mentale Gesundheit
              </h3>
              <p className="text-body text-gray-600 leading-body mb-6">
                Wir machen mentale Unetrstützung einfacher erreichbar - für alle jederzit. Denn eine digitale Begleitung stärkt die Beziehung zwischen Patient:in & Therapeut:in nachweislich wirksam.
              </p>
              <ul className="space-y-4 text-body text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Zugänglich und Flexibel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Bessere Resultate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>24/7 Zugriff</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="p-10 bg-card border-border">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-8">
                <FileCheckIcon className="w-8 h-8 text-secondary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-6">
                Evidencebasiert & Wirksam
              </h3>
              <p className="text-body text-gray-600 leading-body mb-6">
                Digitale Tools können die Therapie nachweislich unterstützen und Ergebnisse verbessern. Unsere Methoden basieren auf neuesten Studien – geprüft und validiert.
              </p>
              <ul className="space-y-4 text-body text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>Wissenschaftlich fundierte Methoden</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>Nachgewiesene Wirksamkeit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>kontinuierliche Ergebnisüberwachung </span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-3xl overflow-hidden shadow-2xl max-w-3xl mx-auto"
          >
            <img
              src="https://c.animaapp.com/mhahgsoyNVf0kG/img/ai_4.png"
              alt="evidence support visualization"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-background/95 backdrop-blur-sm p-10 shadow-2xl max-w-md">
              <div className="text-center">
                <div className="text-6xl font-headline font-bold text-tertiary-foreground mb-4" aria-live="polite">
                  {effectiveness}%
                </div>
                <p className="text-h4 font-headline font-semibold text-gray-800 mb-3">
                  Wirksamkeitsrate
                </p>
                <p className="text-body text-gray-600 leading-body">
                  User berichten von einer deutlichen Verbesserung ihrer mentalen Gesundheit
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
