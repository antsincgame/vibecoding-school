import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

export default function StudentAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendVerificationEmail, signIn, signInWithGoogle, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [acceptedOffer, setAcceptedOffer] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      const state = location.state as LocationState | null;
      const from = state?.from?.pathname || '/student/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          if (result.error.message.includes('Invalid login credentials')) {
            setError('Неверный email или пароль');
          } else if (result.error.message.includes('Email not confirmed')) {
            setError('Email не подтвержден. Проверьте почту.');
          } else {
            setError(result.error.message);
          }
        }
      } else {
        if (!formData.fullName) {
          setError('Пожалуйста, введите имя');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          setLoading(false);
          return;
        }
        if (!acceptedOffer) {
          setError('Необходимо принять условия публичной оферты');
          setLoading(false);
          return;
        }

        const result = await sendVerificationEmail(formData.email, formData.fullName);

        if (result.error) {
          if (result.error.message.includes('user_already_exists') || result.error.message.includes('already registered')) {
            setError('Этот email уже зарегистрирован');
          } else {
            setError(result.error.message);
          }
        } else {
          setSuccess('Письмо для подтверждения отправлено на вашу почту. Проверьте входящие и папку спам.');
          setFormData({ email: '', password: '', fullName: '' });
        }
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        console.error('Google sign in failed:', error);
        setError(`Ошибка входа через Google: ${error.message}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Exception in handleGoogleSignIn:', err);
      setError('Произошла критическая ошибка');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>Загрузка...</div>
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
          fontSize: 'clamp(36px, 6vw, 48px)',
          textAlign: 'center',
          marginBottom: '20px'
        }} className="glitch" data-text={isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}>
          <span className="neon-text">{isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}</span>
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '18px',
          opacity: 0.8,
          marginBottom: '40px'
        }}>
          {isLogin ? 'Войдите в свой аккаунт' : 'Создайте аккаунт ученика'}
        </p>

        <div className="cyber-card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '25px' }}>
                <label htmlFor="fullName" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '16px',
                  color: 'var(--neon-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600
                }}>
                  Имя *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required={!isLogin}
                  className="cyber-input"
                  placeholder="Введите ваше имя"
                />
              </div>
            )}

            <div style={{ marginBottom: '25px' }}>
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
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="cyber-input"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            {isLogin && (
              <div style={{ marginBottom: '30px' }}>
                <label htmlFor="password" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '16px',
                  color: 'var(--neon-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600
                }}>
                  Пароль *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="cyber-input"
                    placeholder="Введите пароль"
                    minLength={6}
                    autoComplete="current-password"
                    style={{ paddingRight: '50px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--neon-cyan)',
                      opacity: 0.6,
                      transition: 'opacity 0.2s',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                  <Link
                    to="/student/forgot-password"
                    style={{
                      color: 'var(--neon-cyan)',
                      fontSize: '14px',
                      textDecoration: 'none',
                      opacity: 0.8
                    }}
                  >
                    Забыли пароль?
                  </Link>
                </div>
              </div>
            )}

            {!isLogin && (
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <input
                    type="checkbox"
                    checked={acceptedOffer}
                    onChange={(e) => setAcceptedOffer(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: 'var(--neon-cyan)',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ opacity: 0.9 }}>
                    Я ознакомился и принимаю условия{' '}
                    <Link
                      to="/offer"
                      target="_blank"
                      style={{
                        color: 'var(--neon-cyan)',
                        textDecoration: 'underline'
                      }}
                    >
                      публичной оферты
                    </Link>
                    {' '}и{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      style={{
                        color: 'var(--neon-cyan)',
                        textDecoration: 'underline'
                      }}
                    >
                      политики конфиденциальности
                    </Link>
                  </span>
                </label>
              </div>
            )}

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

            {success && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(0, 255, 100, 0.1)',
                border: '1px solid #00ff64',
                borderRadius: '4px',
                color: '#00ff64',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {success}
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
              {loading ? 'ЗАГРУЗКА...' : (isLogin ? 'ВОЙТИ' : 'ОТПРАВИТЬ ПИСЬМО')}
            </button>
          </form>

          <div style={{
            position: 'relative',
            textAlign: 'center',
            margin: '30px 0',
            opacity: 0.6
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(0, 255, 249, 0.3)'
            }} />
            <span style={{
              position: 'relative',
              background: 'var(--dark-bg)',
              padding: '0 20px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              или
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="cyber-button"
            style={{
              width: '100%',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Войти через Google
          </button>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.8
          }}>
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--neon-cyan)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Зарегистрируйтесь
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--neon-cyan)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Войдите
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
