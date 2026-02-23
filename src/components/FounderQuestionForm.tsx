import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FounderQuestionFormProps {
  onSuccess?: () => void;
}

export default function FounderQuestionForm({ onSuccess }: FounderQuestionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    question: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.question.trim()) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Необходимо согласиться с обработкой персональных данных и публичной офертой');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Пожалуйста, введите корректный email');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('founder_questions')
      .insert([{
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        question: formData.question.trim()
      }]);

    if (insertError) {
      console.error('Error submitting question:', insertError);
      setError('Произошла ошибка при отправке. Попробуйте позже.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setFormData({ name: '', email: '', phone: '', question: '' });
    setLoading(false);
    onSuccess?.();
  };

  if (success) {
    return (
      <div style={{
        marginTop: '80px',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(0, 255, 249, 0.05) 100%)',
        border: '1px solid rgba(57, 255, 20, 0.3)',
        borderRadius: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.1), transparent)',
          animation: 'shimmer 3s infinite'
        }} />
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          ✅
        </div>
        <h3 style={{
          fontSize: '28px',
          color: 'var(--neon-green)',
          marginBottom: '15px'
        }}>
          ВОПРОС ОТПРАВЛЕН!
        </h3>
        <p style={{
          fontSize: '18px',
          opacity: 0.8,
          maxWidth: '500px',
          margin: '0 auto 25px',
          lineHeight: 1.6
        }}>
          Дмитрий получил ваш вопрос и свяжется с вами в ближайшее время.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="cyber-button"
          style={{ fontSize: '14px', padding: '10px 25px' }}
        >
          Задать ещё вопрос
        </button>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '80px',
      position: 'relative'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.08) 0%, rgba(0, 255, 249, 0.08) 100%)',
        border: '1px solid rgba(255, 0, 110, 0.3)',
        borderRadius: '20px',
        padding: '50px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 255, 249, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 400px) 1fr',
          gap: '50px',
          alignItems: 'start'
        }} className="founder-question-grid">
          <div>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-cyan))',
              borderRadius: '30px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              БЕСПЛАТНО
            </div>
            <h3 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              lineHeight: 1.2,
              marginBottom: '20px',
              background: 'linear-gradient(135deg, var(--neon-pink), #fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Задай вопрос основателю школы
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.7,
              opacity: 0.85,
              marginBottom: '25px'
            }}>
              <strong style={{ color: 'var(--neon-cyan)' }}>Дмитрий Орлов</strong> - основатель VIBECODING,
              лично ответит на твой вопрос о программировании, курсах или карьере в IT.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(0, 255, 249, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 249, 0.2)'
              }}>
                <span style={{ fontSize: '22px' }}>💬</span>
                <span style={{ fontSize: '15px', opacity: 0.9 }}>Получи персональный ответ</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255, 0, 110, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 0, 110, 0.2)'
              }}>
                <span style={{ fontSize: '22px' }}>⚡</span>
                <span style={{ fontSize: '15px', opacity: 0.9 }}>Ответ в течение 24 часов</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(57, 255, 20, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(57, 255, 20, 0.2)'
              }}>
                <span style={{ fontSize: '22px' }}>🎯</span>
                <span style={{ fontSize: '15px', opacity: 0.9 }}>Без обязательств</span>
              </div>
            </div>

            <div style={{
              marginTop: '25px',
              padding: '18px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>🎁</span>
                <div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FFD700',
                    marginBottom: '8px'
                  }}>
                    Бесплатное обучение
                  </div>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    opacity: 0.85,
                    margin: 0
                  }}>
                    Очень хочешь учиться, но нет денег? Напиши об этом! Расскажи о своих идеях и мотивации - мы рассмотрим возможность бесплатного обучения.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'rgba(19, 19, 26, 0.7)',
            backdropFilter: 'blur(10px)',
            padding: '35px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 255, 249, 0.2)'
          }}>
            {error && (
              <div style={{
                padding: '14px 18px',
                background: 'rgba(255, 59, 48, 0.15)',
                border: '1px solid rgba(255, 59, 48, 0.4)',
                borderRadius: '8px',
                color: '#ff6b6b',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--neon-cyan)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Ваше имя <span style={{ color: 'var(--neon-pink)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Как к вам обращаться?"
                className="cyber-input"
                required
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--neon-cyan)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Email <span style={{ color: 'var(--neon-pink)' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="cyber-input"
                required
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--neon-cyan)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Телефон <span style={{ opacity: 0.5, fontWeight: 400 }}>(необязательно)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+375 XX XXX XX XX"
                className="cyber-input"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--neon-cyan)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Ваш вопрос <span style={{ color: 'var(--neon-pink)' }}>*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Опишите ваш вопрос подробно..."
                className="cyber-input"
                required
                rows={5}
                style={{
                  fontSize: '15px',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
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

            <button
              type="submit"
              disabled={loading}
              className="cyber-button"
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '16px',
                marginTop: '5px',
                background: loading ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="pulse">⚡</span> Отправляем...
                </span>
              ) : (
                'Отправить вопрос'
              )}
            </button>

            <p style={{
              fontSize: '12px',
              opacity: 0.5,
              textAlign: 'center',
              margin: 0
            }}>
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .founder-question-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
