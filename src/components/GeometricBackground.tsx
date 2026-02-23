import { useEffect, useRef } from 'react';

interface GeometricBackgroundProps {
  variant?: 'default' | 'dense' | 'minimal' | 'waves';
  colorScheme?: 'cyan' | 'green' | 'pink' | 'mixed';
  intensity?: number;
}

interface FloatingShape {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'triangle' | 'square' | 'circle' | 'hexagon' | 'diamond' | 'ring';
  color: string;
  alpha: number;
  speed: number;
  pulsePhase: number;
  parallaxDepth: number;
}

interface WavePoint {
  x: number;
  baseY: number;
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

const colorSchemes = {
  cyan: ['#00fff9', '#00d4ff', '#00a8cc'],
  green: ['#39ff14', '#00ff88', '#00cc66'],
  pink: ['#ff006e', '#ff3388', '#ff66aa'],
  mixed: ['#00fff9', '#39ff14', '#ff006e', '#00d4ff', '#7b2dff']
};

export default function GeometricBackground({
  variant = 'default',
  colorScheme = 'mixed',
  intensity = 1
}: GeometricBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<FloatingShape[]>([]);
  const wavesRef = useRef<WavePoint[][]>([]);
  const mouseRef = useRef({ x: 0, y: 0, velX: 0, velY: 0 });
  const scrollRef = useRef(0);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const colors = colorSchemes[colorScheme];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initShapes();
      if (variant === 'waves') initWaves();
    };

    const getShapeCount = () => {
      const base = variant === 'dense' ? 40 : variant === 'minimal' ? 12 : 25;
      return Math.floor(base * intensity);
    };

    const initShapes = () => {
      const types: FloatingShape['type'][] = ['triangle', 'square', 'circle', 'hexagon', 'diamond', 'ring'];
      shapesRef.current = Array.from({ length: getShapeCount() }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x,
          y,
          targetX: x,
          targetY: y,
          size: Math.random() * 50 + 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.015,
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.12 + 0.03,
          speed: Math.random() * 0.5 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
          parallaxDepth: Math.random() * 0.8 + 0.2
        };
      });
    };

    const initWaves = () => {
      wavesRef.current = [];
      for (let w = 0; w < 3; w++) {
        const points: WavePoint[] = [];
        const pointCount = Math.ceil(canvas.width / 50) + 2;
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: i * 50,
            baseY: canvas.height * (0.6 + w * 0.15),
            y: 0,
            amplitude: 30 + w * 20,
            frequency: 0.02 + w * 0.005,
            phase: Math.random() * Math.PI * 2
          });
        }
        wavesRef.current.push(points);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mouseRef.current.x;
      const prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.velX = e.clientX - prevX;
      mouseRef.current.velY = e.clientY - prevY;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const drawShape = (shape: FloatingShape, time: number) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);

      const pulse = Math.sin(time * 0.001 + shape.pulsePhase) * 0.15 + 1;
      const size = shape.size * pulse;

      ctx.globalAlpha = shape.alpha;
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 1.5;

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, shape.color + '40');
      gradient.addColorStop(1, shape.color + '00');
      ctx.fillStyle = gradient;

      switch (shape.type) {
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.866, size * 0.5);
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          break;

        case 'square':
          ctx.beginPath();
          ctx.rect(-size / 2, -size / 2, size, size);
          ctx.stroke();
          ctx.fill();
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
          break;

        case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = Math.cos(angle) * size / 2;
            const py = Math.sin(angle) * size / 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          break;

        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 3, 0);
          ctx.lineTo(0, size / 2);
          ctx.lineTo(-size / 3, 0);
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          break;

        case 'ring':
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }

      ctx.restore();
    };

    const drawWaves = (time: number) => {
      wavesRef.current.forEach((wave, waveIndex) => {
        ctx.beginPath();
        ctx.globalAlpha = 0.1 - waveIndex * 0.02;
        ctx.strokeStyle = colors[waveIndex % colors.length];
        ctx.lineWidth = 2;

        wave.forEach((point, i) => {
          point.y = point.baseY + Math.sin(time * 0.001 * (1 + waveIndex * 0.3) + point.phase + point.x * point.frequency) * point.amplitude;

          const mouseDist = Math.abs(point.x - mouseRef.current.x);
          if (mouseDist < 200) {
            const influence = (1 - mouseDist / 200) * 50;
            point.y -= influence * Math.sign(mouseRef.current.y - point.y);
          }

          if (i === 0) ctx.moveTo(point.x, point.y);
          else {
            const prev = wave[i - 1];
            const cpX = (prev.x + point.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + point.y) / 2);
          }
        });

        ctx.stroke();

        const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
        gradient.addColorStop(0, colors[waveIndex % colors.length] + '08');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
      });
    };

    const drawConnectionLines = () => {
      const maxDist = 180;
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < shapesRef.current.length; i++) {
        const shape = shapesRef.current[i];
        for (let j = i + 1; j < shapesRef.current.length; j++) {
          const other = shapesRef.current[j];
          const dx = other.x - shape.x;
          const dy = other.y - shape.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = shape.color;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.08;
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
    };

    const drawMouseTrail = () => {
      const { x, y, velX, velY } = mouseRef.current;
      const speed = Math.sqrt(velX * velX + velY * velY);

      if (speed > 2) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100 + speed * 2);
        gradient.addColorStop(0, colors[0] + '20');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 100 + speed * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      timeRef.current += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawMouseTrail();

      if (variant === 'waves') {
        drawWaves(timeRef.current);
      }

      shapesRef.current.forEach(shape => {
        const dx = mouseRef.current.x - shape.x;
        const dy = mouseRef.current.y - shape.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 250;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 40 * shape.parallaxDepth;
          shape.targetX = shape.x + (dx / dist) * force;
          shape.targetY = shape.y + (dy / dist) * force;
        }

        shape.x += (shape.targetX - shape.x) * 0.08;
        shape.y += (shape.targetY - shape.y) * 0.08;

        shape.targetX += (Math.random() - 0.5) * shape.speed;
        shape.targetY += (Math.random() - 0.5) * shape.speed;

        shape.targetX = Math.max(0, Math.min(canvas.width, shape.targetX));
        shape.targetY = Math.max(0, Math.min(canvas.height, shape.targetY));

        shape.rotation += shape.rotationSpeed;

        drawShape(shape, timeRef.current);
      });

      if (variant !== 'minimal') {
        drawConnectionLines();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, colorScheme, intensity, colors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
