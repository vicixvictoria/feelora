import { useEffect, useRef } from 'react';

export function AnimatedWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    class WaveLine {
      baseY: number;
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      opacity: number;

      constructor(index: number, total: number) {
        // Distribute waves evenly across the height
        this.baseY = (canvas.height / (total + 1)) * (index + 1);
        this.amplitude = 30 + Math.random() * 40; // Wave height
        this.frequency = 0.002 + Math.random() * 0.003; // Wave frequency
        this.phase = Math.random() * Math.PI * 2; // Starting phase
        this.speed = 0.0005 + Math.random() * 0.001; // Animation speed
        this.opacity = 0.15 + Math.random() * 0.25; // Opacity variation
      }

      update() {
        this.phase += this.speed;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        
        for (let x = 0; x <= canvas.width; x += 2) {
          // Create sine wave with varying amplitude
          const y = this.baseY + 
                   Math.sin(x * this.frequency + this.phase + time * 0.001) * this.amplitude +
                   Math.sin(x * this.frequency * 0.5 + this.phase * 1.5) * (this.amplitude * 0.3);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.restore();
      }
    }

    // Create multiple wave lines
    const waves: WaveLine[] = [];
    const numberOfWaves = 8;
    
    for (let i = 0; i < numberOfWaves; i++) {
      waves.push(new WaveLine(i, numberOfWaves));
    }

    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now() - startTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#a7e9e1'); // Pastel teal
      gradient.addColorStop(1, '#c1b4e0'); // Pastel purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw all waves
      waves.forEach(wave => {
        wave.update();
        wave.draw(ctx, currentTime);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 1 }}
    />
  );
}
