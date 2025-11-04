import { useEffect, useRef } from 'react';

export function AnimatedWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const colors = [
      '#E8E4F3',
      '#4F378B',
      '#4BAA94',
      '#CCAADD',
      '#DCD2F9',
      '#F1F4F2',
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    class Wave {
      color: string;
      amplitude: number;
      frequency: number;
      speed: number;
      offset: number;
      opacity: number;

      constructor(color: string, amplitude: number, frequency: number, speed: number, offset: number, opacity: number) {
        this.color = color;
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.speed = speed;
        this.offset = offset;
        this.opacity = opacity;
      }

      draw(ctx: CanvasRenderingContext2D, time: number, width: number, height: number) {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + 
            Math.sin((x * this.frequency + time * this.speed + this.offset) * 0.01) * this.amplitude +
            Math.sin((x * this.frequency * 0.5 + time * this.speed * 0.7 + this.offset) * 0.015) * (this.amplitude * 0.5);
          
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    const waves = [
      new Wave(colors[5], 80, 0.8, 0.3, 0, 0.9),
      new Wave(colors[0], 100, 1, 0.4, 100, 0.7),
      new Wave(colors[4], 120, 0.6, 0.5, 200, 0.6),
      new Wave(colors[3], 90, 1.2, 0.35, 300, 0.5),
      new Wave(colors[2], 110, 0.9, 0.45, 400, 0.4),
      new Wave(colors[1], 70, 1.1, 0.25, 500, 0.3),
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colors[4]);
      gradient.addColorStop(1, colors[0]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      waves.forEach(wave => {
        wave.draw(ctx, time, canvas.width, canvas.height);
      });

      time += 1;
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
      style={{ opacity: 0.8 }}
    />
  );
}
