import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Страница не найдена | VibeCoding';
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: 'clamp(100px, 20vw, 200px)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-pink) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '20px',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        404
      </div>

      <h1 style={{
        fontSize: 'clamp(24px, 4vw, 36px)',
        marginBottom: '15px',
        color: 'var(--neon-cyan)'
      }}>
        Страница не найдена
      </h1>

      <p style={{
        fontSize: '16px',
        opacity: 0.7,
        maxWidth: '500px',
        marginBottom: '40px',
        lineHeight: 1.6
      }}>
        Запрашиваемая страница не существует или была перемещена.
        Возможно, вы перешли по устаревшей ссылке.
      </p>

      <div style={{
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/')}
          className="cyber-button"
        >
          НА ГЛАВНУЮ
        </button>
        <button
          onClick={() => navigate(-1)}
          className="cyber-button"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          НАЗАД
        </button>
      </div>

      <div style={{
        marginTop: '60px',
        padding: '20px',
        background: 'rgba(0, 255, 249, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 249, 0.1)'
      }}>
        <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '15px' }}>
          Возможно, вы искали:
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { path: '/courses', label: 'Курсы' },
            { path: '/about', label: 'О нас' },
            { path: '/blog', label: 'Блог' },
            { path: '/q-a', label: 'FAQ' }
          ].map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(0, 255, 249, 0.3)',
                borderRadius: '6px',
                color: 'var(--neon-cyan)',
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 255, 249, 0.1)';
                e.currentTarget.style.borderColor = 'var(--neon-cyan)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.3)';
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
