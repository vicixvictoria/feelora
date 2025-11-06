import { useEffect, useRef } from 'react';

export function AnimatedWaves() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const resize = () => {
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.95 }}
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b3e7e4" />
            <stop offset="50%" stopColor="#c8d8e8" />
            <stop offset="100%" stopColor="#d4baf0" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes flowAnimation1 {
                0% {
                  stroke-dashoffset: 0;
                  opacity: 0.5;
                }
                50% {
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 2000;
                  opacity: 0.5;
                }
              }

              @keyframes flowAnimation2 {
                0% {
                  stroke-dashoffset: 0;
                  opacity: 0.6;
                }
                50% {
                  opacity: 0.95;
                }
                100% {
                  stroke-dashoffset: 2000;
                  opacity: 0.6;
                }
              }

              @keyframes flowAnimation3 {
                0% {
                  stroke-dashoffset: 0;
                  opacity: 0.55;
                }
                50% {
                  opacity: 0.9;
                }
                100% {
                  stroke-dashoffset: 2000;
                  opacity: 0.55;
                }
              }

              .flow-path-1 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.7);
                stroke-width: 2.5;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation1 25s linear infinite;
              }

              .flow-path-2 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.85);
                stroke-width: 2.5;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation2 18s linear infinite;
                animation-delay: 5s;
              }

              .flow-path-3 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.75);
                stroke-width: 3.5;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation3 22s linear infinite;
                animation-delay: 10s;
              }

              .flow-path-4 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.65);
                stroke-width: 2;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation1 20s linear infinite;
                animation-delay: 3s;
              }

              .flow-path-5 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.8);
                stroke-width: 2.8;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation2 24s linear infinite;
                animation-delay: 8s;
              }

              .flow-path-6 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.7);
                stroke-width: 2.2;
                stroke-linecap: round;
                stroke-dasharray: 200;
                filter: url(#glow);
                animation: flowAnimation3 19s linear infinite;
                animation-delay: 12s;
              }
            `}
          </style>
        </defs>

        <rect width="100%" height="100%" fill="url(#bgGradient)" />

        <path
          className="flow-path-1"
          d="M 100 800 C 300 400, 700 500, 900 100"
        />

        <path
          className="flow-path-2"
          d="M 50 100 C 250 300, 450 200, 750 600"
        />

        <path
          className="flow-path-3"
          d="M 950 700 C 650 800, 350 300, 50 450"
        />

        <path
          className="flow-path-4"
          d="M 200 50 C 400 250, 600 150, 900 400"
        />

        <path
          className="flow-path-5"
          d="M 0 500 C 300 600, 500 300, 800 550"
        />

        <path
          className="flow-path-6"
          d="M 1000 200 C 700 100, 400 500, 100 350"
        />
      </svg>
    </div>
  );
}
