'use client';

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'subtle' | 'vibrant' | 'header';
  showParticles?: boolean;
  showShapes?: boolean;
  className?: string;
}

export default function AnimatedBackground({ 
  variant = 'subtle', 
  showParticles = true, 
  showShapes = true,
  className = ''
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    // Create particles
    const createParticles = () => {
      const colors = variant === 'vibrant' 
        ? ['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)', 'rgba(240, 147, 251, 0.8)', 'rgba(245, 87, 108, 0.8)']
        : ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)', 'rgba(240, 147, 251, 0.3)', 'rgba(245, 87, 108, 0.3)'];

      for (let i = 0; i < (variant === 'header' ? 15 : 30); i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    createParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.offsetWidth) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.offsetHeight) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Draw connections between nearby particles
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = variant === 'vibrant' 
              ? `rgba(102, 126, 234, ${0.2 * (1 - distance / 100)})` 
              : `rgba(102, 126, 234, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [variant]);

  const getBackgroundClass = () => {
    switch (variant) {
      case 'vibrant':
        return 'animated-bg';
      case 'header':
        return 'animated-bg-subtle';
      default:
        return 'animated-bg-subtle';
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* CSS Gradient Background */}
      <div className={`absolute inset-0 ${getBackgroundClass()}`}></div>
      
      {/* Canvas for Particles */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: variant === 'header' ? 0.6 : 0.8 }}
        />
      )}

      {/* CSS Floating Shapes */}
      {showShapes && (
        <div className="floating-shapes">
          <div className="shape shape-circle" style={{width: '30px', height: '30px', top: '20%', left: '10%', animationDelay: '0s'}}></div>
          <div className="shape shape-square" style={{width: '25px', height: '25px', top: '70%', left: '20%', animationDelay: '2s'}}></div>
          <div className="shape shape-circle" style={{width: '20px', height: '20px', top: '40%', left: '80%', animationDelay: '4s'}}></div>
          <div className="shape shape-triangle" style={{top: '60%', left: '85%', animationDelay: '6s'}}></div>
          <div className="shape shape-circle" style={{width: '15px', height: '15px', top: '15%', left: '70%', animationDelay: '8s'}}></div>
          <div className="shape shape-square" style={{width: '18px', height: '18px', top: '80%', left: '60%', animationDelay: '10s'}}></div>
        </div>
      )}

      {/* Floating Particles (CSS) */}
      {showParticles && variant === 'header' && (
        <div className="floating-particles">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="particle" style={{ animationDelay: `${i * 2}s` }}></div>
          ))}
        </div>
      )}
    </div>
  );
}
