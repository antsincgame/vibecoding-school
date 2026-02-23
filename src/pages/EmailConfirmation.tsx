import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          const { data, error } = await supabase.auth.getUser(accessToken);

          if (error) throw error;

          if (data.user) {
            setStatus('success');
            setMessage('Email успешно подтвержден! Перенаправляем в личный кабинет...');
            setTimeout(() => {
              navigate('/student/dashboard');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Неверная ссылка подтверждения');
        }
      } catch (error) {
        console.error('Error confirming email:', error);
        setStatus('error');
        setMessage('Ошибка подтверждения email. Попробуйте еще раз.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="cyber-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'pulse 1.5s infinite'
            }}>
              ⚡
            </div>
            <h1 style={{
              fontSize: '24px',
              marginBottom: '15px',
              color: 'var(--neon-cyan)'
            }}>
              Подтверждение email...
            </h1>
            <p style={{ opacity: 0.8 }}>
              Пожалуйста, подождите
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              ✓
            </div>
            <h1 style={{
              fontSize: '28px',
              marginBottom: '15px',
              color: 'var(--neon-cyan)'
            }}>
              Успешно!
            </h1>
            <p style={{
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: '1.6'
            }}>
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              color: 'var(--neon-pink)'
            }}>
              ✕
            </div>
            <h1 style={{
              fontSize: '28px',
              marginBottom: '15px',
              color: 'var(--neon-pink)'
            }}>
              Ошибка
            </h1>
            <p style={{
              fontSize: '16px',
              opacity: 0.9,
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/student/login')}
              className="cyber-button"
            >
              Вернуться к входу
            </button>
          </>
        )}
      </div>
    </div>
  );
}
