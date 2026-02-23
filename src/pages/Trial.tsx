import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SuccessModal from '../components/SuccessModal';
import ApplicationModal from '../components/ApplicationModal';
import HeroButton from '../components/HeroButton';
import type { TrialRegistration } from '../types';

const SEO = {
  title: 'Пробный урок вайбкодинга бесплатно | Записаться - Vibecoding',
  description: 'Бесплатный пробный урок вайбкодинга! Попробуй Cursor AI, создай первый проект за 1.5 часа. Вайбкодинг для начинающих от 16 лет - онлайн занятие без обязательств. Запишись и начни создавать сайты с ИИ!',
  keywords: 'пробный урок вайбкодинга, вайбкодинг бесплатно попробовать, Cursor AI пробное занятие, бесплатный курс вайбкодинга, записаться на вайбкодинг'
};

export default function Trial() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    parent_name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    document.title = SEO.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', SEO.description);
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', SEO.keywords);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = 'https://vibecoding.by/trial';

    return () => {
      canonicalLink.href = 'https://vibecoding.by/';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!agreedToTerms) {
      alert('Необходимо согласиться с обработкой персональных данных и публичной офертой');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Пожалуйста, введите корректный email адрес');
      setLoading(false);
      return;
    }

    const registrationData: Omit<TrialRegistration, 'id' | 'created_at'> = {
      age_group: 'adult',
      parent_name: formData.parent_name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message || '',
      child_name: null,
      child_age: null
    };

    const { error } = await supabase
      .from('trial_registrations')
      .insert([registrationData]);

    if (error) {
      console.error('Error submitting registration:', error);
      alert('Ошибка при отправке заявки. Попробуйте еще раз.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <>
      <SuccessModal
        isOpen={showModal}
        onClose={handleModalClose}
        message="Мы свяжемся с вами когда будем проводить пробный групповой урок"
      />

      <div style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '60px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          textAlign: 'center',
          marginBottom: '20px'
        }} className="glitch" data-text="ПРОБНЫЙ УРОК">
          <span className="neon-text">ПРОБНЫЙ УРОК</span>
        </h1>
        
        <p style={{
          textAlign: 'center',
          fontSize: '20px',
          opacity: 0.8,
          marginBottom: '60px'
        }}>
          Запишись на бесплатное онлайн-занятие по <strong>вайб-кодингу</strong> и начни <strong>создание веб-приложений</strong> с <strong>Cursor AI</strong> и <strong>AI-инструменты</strong>!
        </p>

        <div className="cyber-card" style={{ padding: '40px' }}>
          <div style={{
            marginBottom: '40px',
            padding: '30px',
            background: 'rgba(0, 255, 249, 0.05)',
            border: '1px solid rgba(0, 255, 249, 0.3)'
          }}>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)'
            }}>
              Что тебя ждёт на пробном уроке:
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0
            }}>
              {[
                'Знакомство с преподавателем и онлайн-форматом обучения',
                'Первый практический проект с Cursor AI или AI-инструменты',
                'Определение подходящего курса вайб-кодинга',
                'Ответы на все вопросы о создании веб-приложений',
                'Демонстрация реальных проектов учеников'
              ].map((item, idx) => (
                <li key={idx} style={{
                  marginBottom: '12px',
                  paddingLeft: '25px',
                  position: 'relative',
                  fontSize: '18px'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--neon-green)',
                    fontSize: '20px'
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Ваше имя *
              </label>
              <input
                type="text"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleChange}
                required
                className="cyber-input"
                placeholder="Введите ваше имя"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="cyber-input"
                placeholder="example@email.com"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Телефон *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="cyber-input"
                placeholder="+375 (XX) XXX-XX-XX"
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '16px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}>
                Дополнительная информация
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="cyber-input"
                placeholder="Расскажите о своих интересах, предпочитаемом времени занятий или задайте вопрос"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{
              marginBottom: '30px',
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
                fontSize: '14px',
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
                fontSize: '18px',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'ОТПРАВКА...' : 'ЗАПИСАТЬСЯ'}
            </button>
          </form>

          <p style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.6
          }}>
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
          </p>
        </div>

        <div style={{
          marginTop: '60px',
          padding: '40px',
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid var(--neon-pink)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '28px',
            marginBottom: '15px',
            color: 'var(--neon-pink)'
          }}>
            ХОТИТЕ УЗНАТЬ БОЛЬШЕ?
          </h3>
          <p style={{
            fontSize: '18px',
            marginBottom: '30px',
            opacity: 0.8
          }}>
            Оставьте заявку на консультацию по курсам вайб-кодинга
          </p>
          <HeroButton
            onClick={() => setIsApplicationModalOpen(true)}
            style={{
              fontSize: '18px',
              padding: '15px 35px'
            }}
          >
            Получить консультацию
          </HeroButton>
        </div>
      </div>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
    </>
  );
}
