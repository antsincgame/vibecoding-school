import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return { hasMinLength, hasUpperCase, hasLowerCase, hasNumber };
};

const isPasswordValid = (password: string) => {
  const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber } = validatePassword(password);
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
};

const getPasswordErrorMessage = (password: string) => {
  const validation = validatePassword(password);
  const errors: string[] = [];

  if (!validation.hasMinLength) errors.push('минимум 8 символов');
  if (!validation.hasUpperCase) errors.push('заглавная буква (A-Z)');
  if (!validation.hasLowerCase) errors.push('строчная буква (a-z)');
  if (!validation.hasNumber) errors.push('цифра (0-9)');

  if (errors.length === 0) return null;
  return `Пароль должен содержать: ${errors.join(', ')}`;
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { resetPassword, verifyResetToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const checkToken = async () => {
      if (!token || !email) {
        setError('Неверная ссылка для сброса пароля. Запросите новую ссылку.');
        setTokenExpired(true);
        setVerifyingToken(false);
        return;
      }

      const result = await verifyResetToken(token, email);

      if (!result.valid) {
        setTokenExpired(true);
        setError(result.message || 'Ссылка недействительна или истекла. Запросите новую ссылку.');
      }

      setVerifyingToken(false);
    };

    checkToken();
  }, [token, email, verifyResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.trim() !== password || confirmPassword.trim() !== confirmPassword) {
      setError('Пароль не должен содержать пробелы в начале или конце');
      return;
    }

    if (!isPasswordValid(password)) {
      const errorMsg = getPasswordErrorMessage(password);
      setError(errorMsg || 'Пароль не соответствует требованиям безопасности');
      setShowRequirements(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token!, email!, password);

      if (result.error) {
        const errorMsg = result.error.message.toLowerCase();

        if (errorMsg.includes('token_expired') || errorMsg.includes('expired')) {
          setTokenExpired(true);
          setError('Срок действия ссылки истек.');
        } else if (errorMsg.includes('invalid_token') || errorMsg.includes('invalid')) {
          setTokenExpired(true);
          setError('Ссылка недействительна или уже была использована.');
        } else if (errorMsg.includes('weak_password')) {
          setError('Пароль не соответствует требованиям безопасности. Проверьте требования выше.');
          setShowRequirements(true);
        } else {
          setError(result.error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  if (verifyingToken) {
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
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h2 style={{ color: 'var(--neon-green)', marginBottom: '20px', fontSize: '24px' }}>Проверка ссылки...</h2>
            <p style={{ opacity: 0.7, fontSize: '14px' }}>
              Пожалуйста, подождите
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenExpired) {
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
              background: 'rgba(255, 165, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffa500" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ color: '#ffa500', marginBottom: '20px', fontSize: '24px' }}>Ссылка устарела</h2>
            <p style={{ marginBottom: '20px', opacity: 0.9, fontSize: '16px', lineHeight: '1.6' }}>
              {error}
            </p>
            <p style={{ marginBottom: '30px', opacity: 0.7, fontSize: '14px' }}>
              Для безопасности ссылки сброса пароля действительны ограниченное время.
              Пожалуйста, запросите новую ссылку для сброса пароля.
            </p>
            <Link to="/student/forgot-password" className="cyber-button" style={{ display: 'inline-block' }}>
              ОТПРАВИТЬ НОВУЮ ССЫЛКУ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email) {
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
              background: 'rgba(255, 0, 110, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ color: 'var(--neon-pink)', marginBottom: '20px' }}>Ошибка</h2>
            <p style={{ marginBottom: '30px', opacity: 0.8 }}>{error}</p>
            <Link to="/student/forgot-password" className="cyber-button" style={{ display: 'inline-block' }}>
              ЗАПРОСИТЬ НОВУЮ ССЫЛКУ
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ color: '#00ff64', marginBottom: '20px' }}>Пароль изменен!</h2>
            <p style={{ marginBottom: '30px', opacity: 0.8 }}>
              Ваш пароль успешно обновлен. Теперь вы можете войти с новым паролем.
            </p>
            <Link to="/student/login" className="cyber-button" style={{ display: 'inline-block' }}>
              ВОЙТИ В АККАУНТ
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
        }} className="glitch" data-text="НОВЫЙ ПАРОЛЬ">
          <span className="neon-text">НОВЫЙ ПАРОЛЬ</span>
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '16px',
          opacity: 0.8,
          marginBottom: '40px'
        }}>
          Придумайте новый пароль для вашего аккаунта
        </p>

        <div className="cyber-card" style={{ padding: '40px' }}>
          <div style={{
            marginBottom: '30px',
            padding: '15px',
            background: 'rgba(0, 255, 249, 0.1)',
            border: '1px solid rgba(0, 255, 249, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>Email</div>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{decodeURIComponent(email)}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '25px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Новый пароль *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowRequirements(true);
                  }}
                  onFocus={() => setShowRequirements(true)}
                  required
                  className="cyber-input"
                  placeholder="Введите надежный пароль"
                  minLength={8}
                  autoComplete="new-password"
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
              <div style={{
                marginTop: '12px',
                padding: '15px',
                background: 'rgba(0, 255, 249, 0.05)',
                border: '1px solid rgba(0, 255, 249, 0.2)',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <div style={{ marginBottom: '10px', fontWeight: 600, color: 'var(--neon-cyan)' }}>Требования к паролю:</div>
                <div style={{ lineHeight: '1.8' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: passwordValidation.hasMinLength ? '#00ff64' : 'rgba(255,255,255,0.6)'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{passwordValidation.hasMinLength ? '+' : '-'}</span>
                    <span>Минимум 8 символов</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: passwordValidation.hasUpperCase ? '#00ff64' : 'rgba(255,255,255,0.6)'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{passwordValidation.hasUpperCase ? '+' : '-'}</span>
                    <span>Заглавная буква (A-Z)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: passwordValidation.hasLowerCase ? '#00ff64' : 'rgba(255,255,255,0.6)'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{passwordValidation.hasLowerCase ? '+' : '-'}</span>
                    <span>Строчная буква (a-z)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: passwordValidation.hasNumber ? '#00ff64' : 'rgba(255,255,255,0.6)'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{passwordValidation.hasNumber ? '+' : '-'}</span>
                    <span>Цифра (0-9)</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Подтвердите пароль *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="cyber-input"
                  placeholder="Повторите пароль"
                  minLength={8}
                  autoComplete="new-password"
                  style={{ paddingRight: '50px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showConfirmPassword ? (
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
              {confirmPassword && password !== confirmPassword && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: 'var(--neon-pink)'
                }}>
                  Пароли не совпадают
                </div>
              )}
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
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ПАРОЛЬ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
