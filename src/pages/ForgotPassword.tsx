import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendPasswordResetEmail(email);

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '60px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="cyber-card" style={{ padding: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 30px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 100, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ff64" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h2 style={{ color: '#00ff64', marginBottom: '20px' }}>Письмо отправлено!</h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>
              Если аккаунт с email <strong style={{ color: 'var(--neon-cyan)' }}>{email}</strong> существует,
              мы отправили на него инструкции по сбросу пароля.
            </p>
            <p style={{ marginBottom: '30px', opacity: 0.6, fontSize: '14px' }}>
              Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
            </p>
            <Link to="/student/login" className="cyber-button" style={{ display: 'inline-block' }}>
              ВЕРНУТЬСЯ К ВХОДУ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          textAlign: 'center',
          marginBottom: '20px'
        }} className="glitch" data-text="ВОССТАНОВЛЕНИЕ ПАРОЛЯ">
          <span className="neon-text">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</span>
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '16px',
          opacity: 0.8,
          marginBottom: '40px'
        }}>
          Введите email, указанный при регистрации
        </p>

        <div className="cyber-card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="cyber-input"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid var(--neon-pink)',
                borderRadius: '4px',
                color: 'var(--neon-pink)',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cyber-button"
              style={{
                width: '100%',
                fontSize: '18px',
                marginBottom: '20px',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ССЫЛКУ'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.8
          }}>
            <Link
              to="/student/login"
              style={{
                color: 'var(--neon-cyan)',
                textDecoration: 'none'
              }}
            >
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
