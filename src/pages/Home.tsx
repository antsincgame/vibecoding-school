import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { stripMarkdown } from '../lib/markdown';
import type { Course, HomePageSettings, VideoTestimonial } from '../types';
import CourseProgram from '../components/CourseProgram';
import TargetAudienceSection from '../components/TargetAudienceSection';
import FounderQuestionForm from '../components/FounderQuestionForm';
import ApplicationModal from '../components/ApplicationModal';
import HeroButton from '../components/HeroButton';

const defaultSettings: HomePageSettings = {
  title: 'VIBECODING',
  subtitle: 'Vibecoding - лучшая школа программирования с помощью ИИ (вайбкодинг)',
  description: 'Забудьте о сложных языках программирования! В Vibecoding мы научим вас создавать настоящие сайты, веб-сервисы и приложения, используя революционный подход — вайбкодинг с Cursor AI. Начните с бесплатного курса!',
  meta_title: 'Вайбкодинг с нуля 2026 | Школа Vibecoding - бесплатный курс и Cursor AI',
  meta_description: 'Вайбкодинг - создавай сайты и приложения с ИИ! Школа Vibecoding: бесплатный курс вайбкодинга и Cursor AI для начинающих. Практика с первого дня, проекты в портфолио. Онлайн обучение от 16 лет.',
  meta_keywords: 'вайбкодинг, вайбкодинг обучение, вайбкодинг курсы, Cursor AI, бесплатный курс вайбкодинга, создание сайтов с ИИ, программирование с нейросетью, vibecoding, школа вайбкодинга',
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<HomePageSettings>(defaultSettings);
  const [expandedCourseProgram, setExpandedCourseProgram] = useState<string | null>(null);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    document.title = settings.meta_title || 'Vibecoding - Курсы вайб-кодинга с Cursor AI';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', settings.meta_description || defaultSettings.meta_description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', settings.meta_keywords || defaultSettings.meta_keywords);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', settings.meta_title || defaultSettings.meta_title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', settings.meta_description || defaultSettings.meta_description);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://vibecoding.by/');
    }

    let existingSchema = document.querySelector('script[type="application/ld+json"][data-page="home"]');
    if (existingSchema) existingSchema.remove();

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Vibecoding",
      "alternateName": "Школа вайбкодинга",
      "url": "https://vibecoding.by",
      "logo": "https://vibecoding.by/bolt-new-logo.jpg",
      "description": settings.meta_description || defaultSettings.meta_description,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BY",
        "addressLocality": "Минск"
      },
      "sameAs": [
        "https://t.me/vibecodingby"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Belarus"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Курсы вайбкодинга",
        "itemListElement": courses.map((course, index) => ({
          "@type": "Offer",
          "position": index + 1,
          "itemOffered": {
            "@type": "Course",
            "name": course.title,
            "description": course.description.substring(0, 150),
            "provider": {
              "@type": "Organization",
              "name": "Vibecoding"
            },
            "url": `https://vibecoding.by/course/${course.slug}`
          }
        }))
      }
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Vibecoding",
      "alternateName": "Школа вайбкодинга",
      "url": "https://vibecoding.by",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://vibecoding.by/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://vibecoding.by/"
      }]
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.setAttribute('data-page', 'home');
    schemaScript.textContent = JSON.stringify([organizationSchema, websiteSchema, breadcrumbSchema]);
    document.head.appendChild(schemaScript);

    return () => {
      const schema = document.querySelector('script[type="application/ld+json"][data-page="home"]');
      if (schema) schema.remove();
    };
  }, [settings, courses]);

  const loadData = useCallback(async () => {
    await loadSettings();
    await loadCourses();
    await loadVideoTestimonials();
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsApplicationModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsApplicationModalOpen(false);
  }, []);

  const handleToggleCourseProgram = useCallback((courseId: string) => {
    setExpandedCourseProgram(prev => prev === courseId ? null : courseId);
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['home_title', 'home_subtitle', 'home_description', 'home_meta_title', 'home_meta_description', 'home_meta_keywords']);

      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });

        setSettings({
          title: settingsMap['home_title'] || defaultSettings.title,
          subtitle: settingsMap['home_subtitle'] || defaultSettings.subtitle,
          description: settingsMap['home_description'] || defaultSettings.description,
          meta_title: settingsMap['home_meta_title'] || defaultSettings.meta_title,
          meta_description: settingsMap['home_meta_description'] || defaultSettings.meta_description,
          meta_keywords: settingsMap['home_meta_keywords'] || defaultSettings.meta_keywords,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (data) {
      setCourses(data);
    }
  };

  const loadVideoTestimonials = async () => {
    const { data } = await supabase
      .from('video_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(3);

    if (data) {
      setVideoTestimonials(data);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            marginBottom: '20px',
            lineHeight: '1.2'
          }} className="glitch" data-text={settings.title}>
            <span className="neon-text">{settings.title}</span>
          </h1>

          <h2 style={{
            fontSize: 'clamp(16px, 2.5vw, 28px)',
            marginBottom: '40px',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-pink), var(--neon-green))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(0, 255, 249, 0.5)',
            lineHeight: '1.4'
          }}>
            {settings.subtitle}
          </h2>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: '1.8'
          }}>
            {settings.description}
          </p>

          <HeroButton onClick={() => setIsApplicationModalOpen(true)}>
            Заявка на обучение
          </HeroButton>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,255,249,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite',
          zIndex: 1
        }} />
      </section>

      <section style={{
        padding: '40px 16px 60px',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        <div className="cyber-card" style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            marginBottom: '30px',
            color: 'var(--neon-pink)',
            textAlign: 'center'
          }}>
            Что такое вайб-кодинг?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.8',
            opacity: 0.9,
            marginBottom: '20px'
          }}>
            Вайб-кодинг (vibe coding) — это современный метод разработки программ с помощью искусственного интеллекта, который был представлен в 2025 году исследователем AI Андреем Карпати из OpenAI. Вместо написания кода строка за строкой, вы просто общаетесь с AI-помощником на обычном языке, описывая что хотите создать, а искусственный интеллект превращает ваши идеи в работающие приложения. Наша <strong>онлайн школа программирования вайб кодинга</strong> обучает работе с <strong>Cursor AI</strong> и <strong>AI-инструментами</strong> — ведущими инструментами для <strong>создания веб-приложений</strong>.
          </p>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.8',
            opacity: 0.9
          }}>
            Это означает, что программирование теперь доступно каждому — <strong>обучение вайб кодингу</strong> и <strong>курсы Cursor AI</strong> помогут вам начать путь в IT независимо от возраста, образования или предыдущего опыта.
          </p>
        </div>

        <TargetAudienceSection />

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          marginBottom: '20px',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(255, 0, 255, 0.6)',
          filter: 'drop-shadow(0 0 10px rgba(0, 255, 249, 0.5))'
        }}>
          Выбери свой курс
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '20px',
          opacity: 0.8,
          marginBottom: '60px'
        }}>
          <strong>Онлайн курсы vibe coding</strong> для подростков от 16 лет и взрослых. Освойте <strong>Cursor AI</strong> или <strong>AI-инструментами</strong> — два направления для <strong>создания веб-приложений</strong> с помощью искусственного интеллекта.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          marginBottom: '40px',
          alignItems: 'start'
        }} className="courses-grid">
          {courses.map((course, index) => {
            const isMiddle = index === 1;
            const courseDescriptions: Record<string, string> = {
              'vibecoder-free': 'Бесплатный курс вайбкодинга: лучшие практики, обзоры сервисов, интересные решения от практикующих специалистов.',
              'cursor-ai': 'Профессиональная разработка с ИИ-ассистентом. Создавайте продукты enterprise-уровня.',
              'architect-vibecode': 'Полное погружение в вайб-разработку. Два инструмента, максимум возможностей.'
            };

            const pricingInfo: Record<string, {
              oldPrice: string;
              discount: string;
              features: string[];
              bonuses: string[];
              subtitle?: string;
              badge?: string;
              isFree?: boolean;
            }> = {
              'vibecoder-free': {
                oldPrice: '',
                discount: '',
                badge: 'FREE',
                subtitle: 'От наставника с любовью',
                isFree: true,
                features: [
                  'Видеоуроки в структурированном формате',
                  'Обзоры AI-инструментов',
                  'Практические примеры',
                  'Лайфхаки разработки'
                ],
                bonuses: [
                  'Разборы реальных проектов',
                  'Уникальные подходы',
                  'Регулярные обновления'
                ]
              },
              'architect-vibecode': {
                oldPrice: '3600 BYN',
                discount: '-50%',
                subtitle: 'Vibecoding Community',
                badge: 'BEST VALUE',
                features: [
                  'Полный курс Cursor AI',
                  '7+ проектов в портфолио',
                  'Полный стек AI-разработки',
                  'Персональные консультации'
                ],
                bonuses: [
                  'Закрытый Telegram-чат',
                  'Discord-сервер комьюнити',
                  'Доступ к будущим курсам 12 мес.',
                  'Приоритет на лиды разработки',
                  'Совместные проекты с другими студентами'
                ]
              },
              'cursor-ai': {
                oldPrice: '2000 BYN',
                discount: '-50%',
                features: [
                  'Пожизненный доступ к материалам',
                  '3+ проекта в портфолио',
                  'Быстрый прототип за 2 часа',
                  'GitHub + CI/CD'
                ],
                bonuses: [
                  'Общий чат поддержки',
                  'Шаблоны промптов'
                ]
              }
            };

            const pricing = pricingInfo[course.slug || ''] || { oldPrice: '', discount: '', features: [], bonuses: [] };

            return (
              <div
                key={course.id}
                style={{
                  position: 'relative',
                  zIndex: isMiddle ? 2 : 1,
                  transform: isMiddle ? 'scale(1.02)' : 'none'
                }}
                className="course-card-wrapper"
              >
                {pricing.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
                    color: '#000',
                    padding: '6px 20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    zIndex: 10,
                    boxShadow: '0 4px 15px rgba(0, 255, 249, 0.4)'
                  }}>
                    {pricing.badge}
                  </div>
                )}

                <div
                  className="cyber-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: isMiddle ? '2px solid var(--neon-cyan)' : '1px solid rgba(0, 255, 249, 0.3)',
                    boxShadow: isMiddle
                      ? '0 0 50px rgba(0, 255, 249, 0.3), 0 20px 40px rgba(0, 0, 0, 0.4)'
                      : '0 10px 30px rgba(0, 0, 0, 0.3)',
                    background: isMiddle
                      ? 'linear-gradient(180deg, rgba(0, 255, 249, 0.12) 0%, rgba(0, 30, 40, 0.95) 100%)'
                      : 'linear-gradient(180deg, rgba(30, 30, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%)',
                    padding: '30px 25px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {isMiddle && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-green), transparent)'
                    }} />
                  )}

                  <div style={{
                    height: '120px',
                    background: '#0a0a0f',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: isMiddle ? '1px solid rgba(0, 255, 249, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative'
                  }}>
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        width={400}
                        height={120}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        fontSize: course.slug === 'vibecoder-free' ? '28px' : '36px',
                        fontWeight: 900,
                        fontFamily: 'Orbitron, sans-serif',
                        color: course.slug === 'vibecoder-free' ? 'var(--neon-green)' : (isMiddle ? 'var(--neon-cyan)' : '#fff'),
                        textShadow: course.slug === 'vibecoder-free' ? '0 0 30px var(--neon-green)' : (isMiddle ? '0 0 30px var(--neon-cyan)' : '0 0 10px rgba(255,255,255,0.3)'),
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}>
                        {course.slug === 'vibecoder-free' ? 'VIBECODER' :
                         course.slug === 'cursor-ai' ? 'CURSOR' : 'ARCHITECT'}
                        {course.slug === 'vibecoder-free' && (
                          <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 600, letterSpacing: '2px' }}>
                            FREE COURSE
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h3 style={{
                    fontSize: '17px',
                    marginBottom: pricing.subtitle ? '6px' : '12px',
                    color: isMiddle ? 'var(--neon-cyan)' : '#fff',
                    lineHeight: '1.3',
                    fontWeight: 700
                  }}>
                    {course.title}
                  </h3>

                  {pricing.subtitle && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--neon-green)',
                      marginBottom: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {pricing.subtitle}
                    </div>
                  )}

                  <p style={{
                    opacity: 0.75,
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    fontSize: '13px',
                    minHeight: '40px'
                  }}>
                    {courseDescriptions[course.slug || ''] || stripMarkdown(course.description.split('---')[0]).substring(0, 100)}
                    {' '}
                    <Link to={`/course/${course.slug}`} style={{ color: 'var(--neon-cyan)', fontSize: '12px' }}>
                      Подробнее
                    </Link>
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    padding: '10px 12px',
                    background: 'rgba(0, 255, 249, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 249, 0.1)'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase' }}>Возраст</div>
                      <div style={{ color: 'var(--neon-green)', fontSize: '13px', fontWeight: 600 }}>{course.age_group}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase' }}>Длительность</div>
                      <div style={{ color: 'var(--neon-green)', fontSize: '13px', fontWeight: 600 }}>{course.duration}</div>
                    </div>
                  </div>

                  {pricing.isFree ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: 'var(--neon-green)',
                        fontFamily: 'Orbitron, sans-serif'
                      }}>
                        БЕСПЛАТНО
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        textDecoration: 'line-through',
                        opacity: 0.4
                      }}>
                        {pricing.oldPrice}
                      </span>
                      <span style={{
                        background: isMiddle
                          ? 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))'
                          : 'var(--neon-green)',
                        color: '#000',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {pricing.discount}
                      </span>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '10px',
                      color: 'var(--neon-cyan)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Что включено:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {pricing.features.map((item, idx) => (
                        <li key={idx} style={{
                          fontSize: '12px',
                          marginBottom: '6px',
                          paddingLeft: '20px',
                          position: 'relative',
                          opacity: 0.9,
                          lineHeight: '1.4'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: 'var(--neon-cyan)',
                            fontWeight: 700
                          }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pricing.bonuses.length > 0 && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '12px',
                      background: isMiddle
                        ? 'linear-gradient(135deg, rgba(0, 255, 249, 0.1), rgba(0, 255, 65, 0.05))'
                        : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: isMiddle
                        ? '1px solid rgba(0, 255, 249, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        color: isMiddle ? 'var(--neon-green)' : 'var(--neon-pink)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '14px' }}>+</span> Бонусы:
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {pricing.bonuses.map((bonus, idx) => (
                          <li key={idx} style={{
                            fontSize: '11px',
                            marginBottom: '4px',
                            paddingLeft: '16px',
                            position: 'relative',
                            opacity: 0.85,
                            lineHeight: '1.4',
                            color: isMiddle ? 'var(--neon-green)' : '#fff'
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: isMiddle ? 'var(--neon-green)' : 'var(--neon-pink)'
                            }}>+</span>
                            {bonus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pricing.isFree ? (
                    <Link to="/student/login" style={{ textDecoration: 'none', display: 'block' }}>
                      <button
                        className="cyber-button"
                        style={{
                          width: '100%',
                          padding: '16px',
                          fontSize: '14px',
                          marginBottom: '12px',
                          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2), rgba(0, 255, 249, 0.1))',
                          borderColor: 'var(--neon-green)',
                          color: 'var(--neon-green)'
                        }}
                      >
                        Требуется регистрация
                      </button>
                    </Link>
                  ) : (
                    <>
                      <HeroButton
                        onClick={() => setIsApplicationModalOpen(true)}
                        style={{
                          width: '100%',
                          padding: '16px',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}
                      >
                        {isMiddle ? 'Начать обучение' : 'Записаться'}
                      </HeroButton>

                      <CourseProgram
                        isExpanded={expandedCourseProgram === course.id}
                        onToggle={() => setExpandedCourseProgram(
                          expandedCourseProgram === course.id ? null : course.id
                        )}
                        courseSlug={course.slug || ''}
                        courseId={course.id}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .courses-grid {
              grid-template-columns: 1fr !important;
              max-width: 420px !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .course-card-wrapper {
              transform: none !important;
            }
          }
        `}</style>
      </section>

      <section style={{
        padding: '40px 16px 60px',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        <FounderQuestionForm />
      </section>

      <section style={{
        padding: '60px 16px',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        <div className="cyber-card" style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            marginBottom: '20px',
            color: 'var(--neon-pink)',
            textAlign: 'center'
          }}>
            Что вы освоите на курсе
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.9', marginBottom: '20px', opacity: 0.95, textAlign: 'center' }}>
            Хотите научиться <strong>созданию веб-приложений</strong>? Наша <strong>онлайн школа вайб кодинга</strong> проведет вас через весь путь — от идеи до запуска готового проекта. <strong>Обучение Cursor AI</strong> и <strong>AI-инструментами</strong> объясняется простым языком, делая <strong>курсы vibe coding</strong> доступными для каждого.
          </p>

          <h3 style={{
            fontSize: '22px',
            marginTop: '30px',
            marginBottom: '15px',
            color: 'var(--neon-green)',
            textAlign: 'center'
          }}>
            На занятиях вы научитесь:
          </h3>
          <ul style={{
            fontSize: '18px',
            lineHeight: '2',
            paddingLeft: '25px',
            opacity: 0.95,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <li>Работать с Cursor AI для профессиональной разработки</li>
            <li>Создавать веб-приложения с помощью AI-инструментами</li>
            <li>Превращать идеи в работающие онлайн-проекты</li>
            <li>Размещать проекты на хостинге и настраивать домены</li>
            <li>Составлять эффективные промпты для AI-инструментов</li>
            <li>Использовать вайб-кодинг для ускорения разработки</li>
            <li>Применять базовые SEO-техники для привлечения трафика</li>
          </ul>
        </div>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          textAlign: 'center',
          marginBottom: '40px',
          color: 'var(--neon-cyan)'
        }}>
          Присоединяйтесь к лучшей онлайн школе вайб-кодинга!
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div className="cyber-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(0, 255, 249, 0.1))',
            textAlign: 'center',
            padding: '30px'
          }}>
            <h3 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              marginBottom: '20px',
              color: 'var(--neon-pink)'
            }}>
              Ознакомиться с Vibecoding
            </h3>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              marginBottom: '30px',
              lineHeight: '1.7'
            }}>
              Посмотрите видео о том, что такое Vibecoding и как мы обучаем программированию
            </p>
            <a
              href="https://www.youtube.com/watch?v=w3K1EguBrTc"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="cyber-button" style={{
                fontSize: '18px',
                padding: '15px 35px',
                borderColor: 'var(--neon-pink)',
                color: 'var(--neon-pink)'
              }}>
                Смотреть видео
              </button>
            </a>
          </div>

          <div className="cyber-card" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.1), rgba(0, 255, 65, 0.1))',
            textAlign: 'center',
            padding: '30px'
          }}>
            <h3 style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              marginBottom: '16px',
              color: 'var(--neon-cyan)'
            }}>
              Готовы начать обучение?
            </h3>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              marginBottom: '30px',
              lineHeight: '1.7'
            }}>
              Оставьте заявку, чтобы записаться на <strong>обучение Cursor AI</strong> и <strong>AI-инструментами</strong> и узнать расписание онлайн-занятий
            </p>
            <HeroButton
              onClick={() => setIsApplicationModalOpen(true)}
              style={{
                fontSize: '18px',
                padding: '15px 35px'
              }}
            >
              Записаться на курс
            </HeroButton>
          </div>
        </div>
      </section>

      {videoTestimonials.length > 0 && (
        <section style={{
          padding: '60px 16px',
          maxWidth: '1800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            textAlign: 'center',
            marginBottom: '16px',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Отзывы наших учеников
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '16px',
            opacity: 0.8,
            marginBottom: '40px'
          }}>
            Узнайте, что говорят студенты о нашей школе вайб-кодинга
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {videoTestimonials.map((testimonial) => {
              const hasVideo = testimonial.video_url && (
                testimonial.video_url.includes('youtube.com') ||
                testimonial.video_url.includes('youtu.be') ||
                testimonial.video_url.includes('.mp4') ||
                testimonial.video_url.includes('.webm')
              );

              return (
                <div key={testimonial.id} className="cyber-card" style={{
                  padding: '0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.9), rgba(0, 40, 50, 0.8))',
                  border: '1px solid rgba(0, 255, 249, 0.3)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                  {hasVideo ? (
                    <div style={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden',
                      background: '#000'
                    }}>
                      <iframe
                        src={testimonial.video_url}
                        title={`Отзыв ${testimonial.student_name}`}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '25px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '20px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '3px solid var(--neon-cyan)',
                          boxShadow: '0 0 20px rgba(0, 255, 249, 0.4)'
                        }}>
                          <img
                            src={testimonial.thumbnail_url}
                            alt={testimonial.student_name}
                            width={80}
                            height={80}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '20px',
                            color: 'var(--neon-cyan)',
                            fontWeight: 700,
                            marginBottom: '5px',
                            fontFamily: 'Orbitron, sans-serif'
                          }}>
                            {testimonial.student_name}
                          </h3>
                          <div style={{
                            color: 'var(--neon-green)',
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            Выпускник Vibecoding
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '32px',
                        color: 'var(--neon-cyan)',
                        opacity: 0.3,
                        lineHeight: 1,
                        marginBottom: '10px'
                      }}>
                        "
                      </div>
                      <p style={{
                        fontSize: '15px',
                        lineHeight: '1.7',
                        opacity: 0.9,
                        color: 'var(--text-primary)',
                        marginBottom: '15px'
                      }}>
                        {testimonial.testimonial_text}
                      </p>
                      <div style={{
                        fontSize: '32px',
                        color: 'var(--neon-cyan)',
                        opacity: 0.3,
                        lineHeight: 1,
                        textAlign: 'right'
                      }}>
                        "
                      </div>
                    </div>
                  )}
                  {hasVideo && (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        color: 'var(--neon-cyan)',
                        fontWeight: 600
                      }}>
                        {testimonial.student_name}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={{
        padding: '60px 16px',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        <div className="cyber-card" style={{ padding: '30px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            marginBottom: '24px',
            color: 'var(--neon-cyan)',
            textAlign: 'center'
          }}>
            Онлайн школа программирования вайб кодинга — Vibecoding
          </h2>
          <div style={{
            fontSize: '15px',
            lineHeight: '1.8',
            opacity: 0.85
          }}>
            <p style={{ marginBottom: '20px' }}>
              <strong>Vibecoding</strong> — это <strong>лучшая онлайн школа вайб-кодинга</strong>, где вы освоите <strong>создание веб-приложений</strong> с помощью искусственного интеллекта. Наши <strong>курсы vibe coding</strong> включают <strong>обучение Cursor AI</strong> и <strong>AI-инструментами</strong> — ведущим инструментам AI-разработки. Программа подходит как для подростков от 16 лет, так и для взрослых, желающих освоить востребованную профессию.
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong>Школа программирования вайб кодинга</strong> Vibecoding не требует предварительной подготовки. Все объясняется простым языком, а искусственный интеллект становится вашим помощником в написании кода. <strong>Обучение вайб кодингу</strong> проходит онлайн — вы можете учиться из любой точки мира.
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong>Курсы Cursor AI</strong> и <strong>AI-инструментами</strong> включают практические проекты для портфолио. Вы научитесь <strong>созданию веб-приложений</strong>, размещению проектов в интернете, настройке доменов и применению SEO-техник. Это полноценное <strong>обучение программированию с AI</strong> для современного рынка труда.
            </p>
            <p>
              Записывайтесь на <strong>онлайн курсы vibe coding</strong> уже сегодня и станьте частью сообщества AI-разработчиков с Vibecoding!
            </p>
          </div>
        </div>
      </section>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}
