import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: string;
}

export default function ApplicationModal({ isOpen, onClose, preselectedCourse }: ApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string; slug: string }[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      loadCourses();
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);

      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);

      if (preselectedCourse) {
        setFormData(prev => ({ ...prev, course: preselectedCourse }));
      }
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, preselectedCourse, handleKeyDown]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('is_active', true)
      .order('order_index');
    if (data) setCourses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.phone || formData.phone.trim() === '') {
      setError('Пожалуйста, введите номер телефона');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Необходимо согласиться с обработкой персональных данных и публичной офертой');
      setLoading(false);
      return;
    }

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingProfile) {
        setError('Этот email уже зарегистрирован. Войдите в личный кабинет.');
        setLoading(false);
        return;
      }

      const selectedCourse = courses.find(c => c.id === formData.course);

      const { error: regError } = await supabase
        .from('trial_registrations')
        .insert({
          parent_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course_id: formData.course || null,
          message: formData.message || `Заявка на обучение${selectedCourse ? ` - ${selectedCourse.title}` : ''}`,
          status: 'new',
          age_group: 'adult'
        });

      if (regError) {
        console.error('Registration error:', regError);
        setError('Ошибка при отправке заявки. Попробуйте позже.');
        setLoading(false);
        return;
      }

      const siteUrl = window.location.origin;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.name,
            siteUrl
          }),
        }
      );

      const result = await response.json();

      if (!response.ok && !result.error?.includes('user_already_exists')) {
        console.error('Email error:', result);
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', course: '', message: '' });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)'
        }}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.98) 0%, rgba(5, 15, 25, 0.98) 100%)',
          border: '2px solid var(--neon-cyan)',
          borderRadius: '16px',
          boxShadow: `
            0 0 60px rgba(0, 255, 249, 0.3),
            0 0 120px rgba(0, 255, 249, 0.15),
            inset 0 0 60px rgba(0, 255, 249, 0.05)
          `,
          animation: 'modalAppear 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalAppear {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes shimmerLine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 249, 0.4), 0 0 40px rgba(0, 255, 249, 0.2); }
            50% { box-shadow: 0 0 30px rgba(0, 255, 249, 0.6), 0 0 60px rgba(0, 255, 249, 0.3); }
          }
          @keyframes floatOrb {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            50% { transform: translate(10px, -10px) scale(1.1); opacity: 0.5; }
          }
        `}</style>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-pink), var(--neon-cyan), transparent)',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #fff, transparent)',
            animation: 'shimmerLine 2s infinite'
          }} />
        </div>

        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(0, 255, 249, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatOrb 4s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '10px',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatOrb 5s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }} />

        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Закрыть окно"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            background: 'rgba(255, 0, 110, 0.1)',
            border: '1px solid rgba(255, 0, 110, 0.5)',
            borderRadius: '8px',
            color: 'var(--neon-pink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 110, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 110, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{ padding: '40px 30px 30px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2), rgba(0, 255, 249, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--neon-green)',
                boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '28px',
                marginBottom: '16px',
                fontFamily: 'Orbitron, sans-serif',
                color: 'var(--neon-green)',
                textShadow: '0 0 20px rgba(57, 255, 20, 0.5)'
              }}>
                Заявка отправлена!
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                marginBottom: '12px',
                lineHeight: '1.6'
              }}>
                Проверьте вашу почту для подтверждения email.
              </p>
              <p style={{
                fontSize: '14px',
                opacity: 0.7,
                marginBottom: '24px'
              }}>
                Мы свяжемся с вами в ближайшее время!
              </p>
              <button
                onClick={onClose}
                className="cyber-button"
                style={{ padding: '12px 30px' }}
              >
                Закрыть
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--neon-pink)',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  marginBottom: '10px',
                  fontWeight: 600
                }}>
                  Vibecoding School
                </div>
                <h2 id="modal-title" style={{
                  fontSize: 'clamp(24px, 5vw, 32px)',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, var(--neon-cyan), #fff, var(--neon-pink))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '10px'
                }}>
                  Заявка на обучение
                </h2>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.7,
                  lineHeight: '1.5'
                }}>
                  Заполните форму и начните путь в мир вайб-кодинга
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--neon-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}>
                    Ваше имя *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="cyber-input"
                    placeholder="Как к вам обращаться?"
                    style={{ fontSize: '15px' }}
                    aria-required="true"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--neon-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="cyber-input"
                    placeholder="email@example.com"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--neon-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}>
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="cyber-input"
                    placeholder="+375 29 123 45 67"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--neon-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}>
                    Интересующий курс
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="cyber-input"
                    style={{ fontSize: '15px' }}
                  >
                    <option value="">Выберите курс (необязательно)</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--neon-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}>
                    Сообщение
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="cyber-input"
                    placeholder="Расскажите о себе или задайте вопрос..."
                    rows={3}
                    style={{ fontSize: '15px', resize: 'vertical', minHeight: '80px' }}
                  />
                </div>

                <div style={{
                  marginBottom: '20px',
                  padding: '12px',
                  background: 'rgba(0, 255, 249, 0.08)',
                  border: '1px solid rgba(0, 255, 249, 0.2)',
                  borderRadius: '8px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: 'var(--neon-cyan)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      required
                    />
                    <span style={{ opacity: 0.85 }}>
                      Я согласен на обработку персональных данных и принимаю условия{' '}
                      <a
                        href="/offer"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--neon-cyan)',
                          textDecoration: 'underline'
                        }}
                      >
                        публичной оферты
                      </a>
                      <span style={{ color: 'var(--neon-pink)' }}> *</span>
                    </span>
                  </label>
                </div>

                <div
                  role="alert"
                  aria-live="polite"
                  style={{
                    marginBottom: error ? '20px' : 0,
                    padding: error ? '12px 16px' : 0,
                    background: error ? 'rgba(255, 0, 110, 0.1)' : 'transparent',
                    border: error ? '1px solid var(--neon-pink)' : 'none',
                    borderRadius: '8px',
                    color: 'var(--neon-pink)',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  {error}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'Orbitron, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.2), rgba(57, 255, 20, 0.1))',
                    border: '2px solid var(--neon-cyan)',
                    borderRadius: '8px',
                    color: 'var(--neon-cyan)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'var(--neon-cyan)';
                      e.currentTarget.style.color = '#000';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 249, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 249, 0.2), rgba(57, 255, 20, 0.1))';
                    e.currentTarget.style.color = 'var(--neon-cyan)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>

                <p style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  opacity: 0.5,
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
