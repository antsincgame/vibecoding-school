import { CSSProperties } from 'react';

interface HeroButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  style?: CSSProperties;
}

export default function HeroButton({ onClick, children, type = 'button', disabled = false, style = {} }: HeroButtonProps) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{
          position: 'relative',
          padding: '20px 50px',
          fontSize: 'clamp(16px, 2vw, 20px)',
          fontWeight: 700,
          fontFamily: 'Orbitron, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.15), rgba(255, 0, 110, 0.1), rgba(57, 255, 20, 0.1))',
          border: '2px solid transparent',
          borderRadius: '12px',
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundClip: 'padding-box',
          boxShadow: `
            0 0 30px rgba(0, 255, 249, 0.3),
            0 0 60px rgba(255, 0, 110, 0.15),
            inset 0 0 30px rgba(0, 255, 249, 0.1)
          `,
          opacity: disabled ? 0.5 : 1,
          ...style
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = `
              0 0 50px rgba(0, 255, 249, 0.5),
              0 0 100px rgba(255, 0, 110, 0.25),
              0 10px 40px rgba(0, 0, 0, 0.3),
              inset 0 0 40px rgba(0, 255, 249, 0.15)
            `;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = `
              0 0 30px rgba(0, 255, 249, 0.3),
              0 0 60px rgba(255, 0, 110, 0.15),
              inset 0 0 30px rgba(0, 255, 249, 0.1)
            `;
          }
        }}
      >
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '10px',
          padding: '2px',
          background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink), var(--neon-green), var(--neon-cyan))',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 4s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none'
        }} />
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0, 255, 249, 0.15) 0%, transparent 60%)',
          animation: 'pulseOrb 3s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </span>
      </button>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseOrb {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
