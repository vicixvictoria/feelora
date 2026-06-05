import { useInView } from 'react-intersection-observer';

function getRootMargin() {
  if (typeof window === 'undefined') return '0px 0px 80px 0px';
  return window.innerWidth < 768 ? '0px 0px 150px 0px' : '0px 0px 80px 0px';
}

export function useScrollReveal() {
  return useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: getRootMargin(),
  });
}
