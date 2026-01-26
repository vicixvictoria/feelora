import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { Card } from '@/components/ui/cardLanding';
import { useLanguage } from '@/contexts/LanguageContext';

export function TestimonialsSection() {
  const { t } = useLanguage();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: t('testimonials.review1'),
    },
    {
      name: 'Michael T.',
      rating: 5,
      text: t('testimonials.review2'),
    },
    {
      name: 'Emily R.',
      rating: 5,
      text: t('testimonials.review3'),
    },
    {
      name: 'David L.',
      rating: 5,
      text: t('testimonials.review4'),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 px-8 bg-gradient-to-br from-tertiary/20 to-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-h2 font-headline font-semibold text-gray-800 tracking-headline leading-headline mb-6">
           {t('testimonials.title')}
          </h2>
          <p className="text-body-large text-gray-600 leading-body">
            {t('testimonials.description')}
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 bg-card border-border shadow-xl">
                <div className="flex justify-center mb-6">
                  {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-warning fill-warning" strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-body-large text-gray-700 leading-body text-center mb-8 italic">
                  "{testimonials[currentIndex].text}"
                </p>
                <p className="text-h4 font-headline font-semibold text-gray-800 text-center">
                  {testimonials[currentIndex].name}
                </p>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-6 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="bg-background text-gray-700 border-border hover:bg-gray-100 hover:border-gray-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="w-6 h-6" strokeWidth={1.5} />
            </Button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-8' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="bg-background text-gray-700 border-border hover:bg-gray-100 hover:border-gray-300"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="w-6 h-6" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto"
          >
						{/*<img
              src="https://c.animaapp.com/mhahgsoyNVf0kG/img/ai_5.png"
              alt="user testimonials illustration"
              className="w-full h-auto object-cover"
              loading="lazy"
            />*/}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
