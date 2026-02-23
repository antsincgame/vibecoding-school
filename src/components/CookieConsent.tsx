import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(10, 10, 30, 0.98)',
      borderTop: '2px solid var(--neon-cyan)',
      padding: '20px',
      zIndex: 10000,
      boxShadow: '0 -4px 20px rgba(0, 255, 249, 0.3)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента.
            Продолжая использовать наш сайт, вы соглашаетесь с нашей{' '}
            <Link
              to="/privacy"
              style={{
                color: 'var(--neon-cyan)',
                textDecoration: 'underline',
                fontWeight: 600
              }}
            >
              Политикой конфиденциальности
            </Link>.
          </p>
        </div>
        <button
          onClick={acceptCookies}
          style={{
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0a0a1e',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 0 20px rgba(0, 255, 249, 0.4)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 249, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 249, 0.4)';
          }}
        >
          Принять
        </button>
      </div>
    </div>
  );
}
