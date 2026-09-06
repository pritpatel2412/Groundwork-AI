import React, { useEffect, useRef } from 'react';

export const NeuralCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Audio / Neural sine wave nodes
    const lines = [
      { yOffset: 0.15, amplitude: 25, frequency: 0.0018, speed: 0.008, color: 'rgba(79, 70, 229, 0.12)' },
      { yOffset: 0.2, amplitude: 35, frequency: 0.0025, speed: 0.012, color: 'rgba(6, 182, 212, 0.10)' },
      { yOffset: 0.85, amplitude: 20, frequency: 0.002, speed: 0.009, color: 'rgba(79, 70, 229, 0.09)' },
      { yOffset: 0.9, amplitude: 30, frequency: 0.0015, speed: 0.015, color: 'rgba(6, 182, 212, 0.08)' },
    ];

    // Synaptic nodes
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8,
        color: i % 2 === 0 ? 'rgba(79, 70, 229, 0.3)' : 'rgba(6, 182, 212, 0.3)',
      });
    }

    let t = 0;

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // Render flowing neural audio waveforms
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.5;

        const baseHeight = height * line.yOffset;

        for (let x = 0; x < width; x += 15) {
          const y = baseHeight + Math.sin(x * line.frequency + t * line.speed) * line.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Render synaptic network particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby nodes with subtle synaptic threads
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient background glow points */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/08 rounded-full blur-3xl pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
    </div>
  );
};
