import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';
import ApplicationModal from '../components/ApplicationModal';
import HeroButton from '../components/HeroButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { courseContentMap, type CourseContentType } from '../data/courseContent';

interface ModuleData {
  id: string;
  title: string;
  description?: string;
  lessons: { id: string; title: string; duration: string }[];
}

const setSEO = (course: Course) => {
  const shortDesc = course.description.substring(0, 80).replace(/\n/g, ' ').trim();
  const defaultTitle = `${course.title} | Курс вайбкодинга для ${course.age_group}`;
  const defaultDescription = `Курс вайбкодинга "${course.title}": ${shortDesc}... Длительность ${course.duration}. Обучение вайбкодингу онлайн с практикой. Записаться!`;
  const defaultKeywords = `${course.title} курс вайбкодинга, обучение вайбкодингу, Cursor AI курс, бесплатный курс вайбкодинга, вайбкодинг онлайн`;

  document.title = course.meta_title || defaultTitle;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', course.meta_description || defaultDescription);

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) metaKeywords.setAttribute('content', course.meta_keywords || defaultKeywords);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', course.meta_title || defaultTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', course.meta_description || defaultDescription);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', course.canonical_url || `https://vibecoding.by/course/${course.slug}`);

  let existingSchema = document.querySelector('script[type="application/ld+json"][data-page="course"]');
  if (existingSchema) existingSchema.remove();

  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.setAttribute('data-page', 'course');
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.meta_description || defaultDescription,
    "provider": {
      "@type": "Organization",
      "name": "Vibecoding",
      "sameAs": "https://vibecoding.by",
      "url": "https://vibecoding.by"
    },
    "url": `https://vibecoding.by/course/${course.slug}`,
    "image": course.image_url || "https://vibecoding.by/bolt-new-logo.jpg",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "duration": course.duration
    },
    "audience": {
      "@type": "Audience",
      "audienceType": course.age_group
    },
    "teaches": (course.features as string[]).slice(0, 5).join(", "),
    "inLanguage": "ru"
  });
  document.head.appendChild(schemaScript);
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error loading course:', error);
    }

    if (data) {
      setCourse(data);
      setSEO(data);
      loadModules(data.id);
    }
    setLoading(false);
  };

  const loadModules = async (courseId: string) => {
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (modulesData && modulesData.length > 0) {
      const moduleIds = modulesData.map(m => m.id);
      const { data: lessonsData } = await supabase
        .from('course_lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index');

      const formatted = modulesData.map(mod => ({
        id: mod.id,
        title: mod.title,
        lessons: (lessonsData || [])
          .filter(l => l.module_id === mod.id)
          .map(l => ({ id: l.id, title: l.title, duration: l.duration }))
      }));
      setModules(formatted);
    }
  };

  const content: CourseContentType | null = slug ? courseContentMap[slug] || null : null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #13131a 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(0, 255, 249, 0.3)',
            borderTop: '3px solid var(--neon-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: 'var(--neon-cyan)', opacity: 0.8 }}>Загрузка...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: 'var(--neon-pink)' }}>
            Курс не найден
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '40px' }}>
            Возможно, курс был удален или изменен
          </p>
          <Link to="/"><button className="cyber-button">Вернуться на главную</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 20px 80px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(0, 255, 249, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(57, 255, 20, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 0, 110, 0.05) 0%, transparent 70%)
          `,
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 249, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 249, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {content && (
            <div style={{
              display: 'inline-block',
              padding: '8px 24px',
              background: 'rgba(0, 255, 249, 0.1)',
              border: '1px solid var(--neon-cyan)',
              borderRadius: '30px',
              fontSize: '12px',
              letterSpacing: '3px',
              color: 'var(--neon-cyan)',
              marginBottom: '30px',
              fontWeight: 600
            }}>
              {content.hero.badge}
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 900,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-green) 50%, var(--neon-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 80px rgba(0, 255, 249, 0.5)',
            letterSpacing: '-2px'
          }}>
            {content?.hero.title || course.title}
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 28px)',
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto 50px',
            lineHeight: 1.5,
            fontWeight: 300
          }}>
            {content?.hero.subtitle || course.description.substring(0, 150)}
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px'
          }}>
            <div style={{
              padding: '20px 40px',
              background: 'rgba(0, 255, 249, 0.1)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Длительность</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--neon-cyan)' }}>{course.duration}</div>
            </div>
            <div style={{
              padding: '20px 40px',
              background: 'rgba(57, 255, 20, 0.1)',
              border: '2px solid var(--neon-green)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Формат</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--neon-green)' }}>Онлайн</div>
            </div>
          </div>

          <HeroButton onClick={() => setIsApplicationModalOpen(true)} style={{ fontSize: '18px', padding: '20px 60px' }}>
            Записаться на курс
          </HeroButton>
        </div>
      </section>

      {content && (
        <>
          <section style={{ padding: '100px 20px', background: 'rgba(19, 19, 26, 0.5)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '30px',
                color: 'var(--neon-cyan)'
              }}>
                {content.whatIs.title}
              </h2>
              <p style={{
                fontSize: '20px',
                textAlign: 'center',
                maxWidth: '900px',
                margin: '0 auto 60px',
                lineHeight: 1.8,
                opacity: 0.9
              }}>
                {content.whatIs.description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px'
              }}>
                {content.whatIs.features.map((f, i) => (
                  <div key={i} style={{
                    padding: '40px 30px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 255, 249, 0.2)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 255, 249, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '22px', marginBottom: '15px', color: 'var(--neon-cyan)' }}>{f.title}</h3>
                    <p style={{ opacity: 0.8, lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(57, 255, 20, 0.1) 0%, transparent 70%)',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '60px'
              }}>
                <span style={{ color: 'var(--neon-green)' }}>Чему вы научитесь</span>
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {content.skills.map((skill, i) => (
                  <div key={i} style={{
                    padding: '25px 30px',
                    background: 'rgba(57, 255, 20, 0.05)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--neon-green)';
                    e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                    e.currentTarget.style.background = 'rgba(57, 255, 20, 0.05)';
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(57, 255, 20, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neon-green)',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>✓</span>
                    <span style={{ fontSize: '16px', lineHeight: 1.5 }}>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px', background: 'rgba(19, 19, 26, 0.5)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '20px',
                color: 'var(--neon-cyan)'
              }}>
                Для кого этот курс
              </h2>
              <p style={{
                textAlign: 'center',
                fontSize: '18px',
                opacity: 0.8,
                marginBottom: '60px'
              }}>
                Курс подходит для людей с разным опытом и целями
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '25px'
              }}>
                {content.audience.map((a, i) => (
                  <div key={i} style={{
                    padding: '35px',
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(19, 19, 26, 0.8) 100%)',
                    border: '1px solid rgba(0, 255, 249, 0.15)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.15)';
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>{a.icon}</div>
                    <h3 style={{ fontSize: '22px', marginBottom: '12px', color: 'var(--neon-cyan)' }}>{a.title}</h3>
                    <p style={{ opacity: 0.85, lineHeight: 1.7 }}>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '120px 20px', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0
            }}>
              <InteractiveBackground particleCount={100} />
            </div>

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 0, 110, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0, 255, 249, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(0, 255, 249, 0.2))',
                  border: '1px solid rgba(255, 0, 110, 0.5)',
                  borderRadius: '50px',
                  fontSize: '14px',
                  letterSpacing: '3px',
                  color: 'var(--neon-pink)',
                  marginBottom: '30px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {content.hero.badge}
                </div>

                <h2 style={{
                  fontSize: 'clamp(40px, 8vw, 80px)',
                  fontWeight: 900,
                  marginBottom: '20px',
                  background: 'linear-gradient(135deg, #ff006e 0%, #00fff9 50%, #39ff14 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 80px rgba(255, 0, 110, 0.5)'
                }}>
                  Программа курса
                </h2>

                <p style={{
                  fontSize: '24px',
                  maxWidth: '700px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                  opacity: 0.9
                }}>
                  {slug === 'architect-vibecode' ? 'Полный путь в AI-разработку' : 'От нуля до создателя веб-приложений'}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '20px',
                marginBottom: '60px'
              }}>
                {(() => {
                  const totalModules = content.program.length;
                  const totalLessons = content.program.reduce((acc, mod) => acc + mod.lessons.length, 0);
                  return [
                    { num: String(totalModules), label: 'модулей', color: '#ff006e', icon: '{ }' },
                    { num: `${totalLessons}+`, label: 'уроков', color: '#00fff9', icon: '</>' },
                    { num: slug === 'architect-vibecode' ? '100+' : '50+', label: 'часов', color: '#39ff14', icon: '[ ]' },
                    { num: '0', label: 'кода вручную', color: '#ff006e', icon: '///' }
                  ];
                })().map((stat, i) => (
                  <div key={i} style={{
                    padding: '30px 20px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: `2px solid ${stat.color}`,
                    borderRadius: '20px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 20px 60px ${stat.color}50`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontFamily: 'monospace',
                      color: stat.color,
                      marginBottom: '10px',
                      opacity: 0.7
                    }}>{stat.icon}</div>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: stat.color,
                      lineHeight: 1,
                      marginBottom: '8px',
                      textShadow: `0 0 40px ${stat.color}80`
                    }}>{stat.num}</div>
                    <div style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      opacity: 0.8
                    }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 255, 249, 0.1))',
                border: '2px solid rgba(57, 255, 20, 0.4)',
                borderRadius: '24px',
                padding: '50px',
                marginBottom: '70px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(57, 255, 20, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: 'var(--neon-green)',
                  marginBottom: '35px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px'
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '40px' }}>{'>'}_</span>
                  После курса вы сможете
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {[
                    { text: 'Создавать сайты за часы, а не месяцы', icon: '+' },
                    { text: 'Запускать интернет-магазины с оплатой', icon: '$' },
                    { text: 'Делать сервисы записи и бронирования', icon: '#' },
                    { text: 'Подключать базы данных и авторизацию', icon: '@' },
                    { text: 'Принимать платежи картами и через ЕРИП', icon: '%' },
                    { text: 'Зарабатывать на фрилансе от 200$/проект', icon: '*' }
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '18px',
                      padding: '22px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '16px',
                      border: '1px solid rgba(57, 255, 20, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--neon-green)';
                      e.currentTarget.style.background = 'rgba(57, 255, 20, 0.15)';
                      e.currentTarget.style.transform = 'translateX(10px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <span style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0a0a0f',
                        fontWeight: 900,
                        fontSize: '24px',
                        flexShrink: 0,
                        fontFamily: 'monospace'
                      }}>{item.icon}</span>
                      <span style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.4 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h3 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--neon-pink)',
                marginBottom: '35px',
                textAlign: 'center'
              }}>
                {content.program.length} модулей с подробным описанием каждого урока
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(modules.length > 0 ? modules : content.program.map((p, i) => ({
                  id: `static-${i}`,
                  title: p.module,
                  description: p.description,
                  lessons: p.lessons.map((l, li) => ({
                    id: `l-${li}`,
                    title: typeof l === 'string' ? l : l.title,
                    duration: typeof l === 'string' ? '' : l.duration
                  }))
                }))).map((mod, idx) => (
                  <div key={mod.id} style={{
                    background: expandedModule === mod.id
                      ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(0, 255, 249, 0.1) 100%)'
                      : 'rgba(0, 0, 0, 0.5)',
                    border: expandedModule === mod.id
                      ? '2px solid rgba(255, 0, 110, 0.7)'
                      : '1px solid rgba(255, 0, 110, 0.25)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={e => {
                    if (expandedModule !== mod.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 0, 110, 0.6)';
                      e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
                    }
                  }}
                  onMouseOut={e => {
                    if (expandedModule !== mod.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 0, 110, 0.25)';
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    }
                  }}>
                    <button
                      onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                      style={{
                        width: '100%',
                        padding: '28px 32px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <span style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '16px',
                          background: expandedModule === mod.id
                            ? 'linear-gradient(135deg, var(--neon-pink), var(--neon-cyan))'
                            : 'linear-gradient(135deg, rgba(255, 0, 110, 0.4), rgba(0, 255, 249, 0.2))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: expandedModule === mod.id ? '#0a0a0f' : 'white',
                          fontWeight: 900,
                          fontSize: '22px',
                          flexShrink: 0,
                          transition: 'all 0.4s ease',
                          fontFamily: 'monospace',
                          boxShadow: expandedModule === mod.id ? '0 0 40px rgba(255, 0, 110, 0.6)' : '0 0 20px rgba(255, 0, 110, 0.2)'
                        }}>
                          {idx}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            marginBottom: mod.description ? '8px' : 0,
                            color: 'white'
                          }}>
                            {mod.title}
                          </div>
                          {mod.description && (
                            <div style={{
                              fontSize: '15px',
                              opacity: 0.8,
                              lineHeight: 1.5,
                              color: 'var(--neon-cyan)'
                            }}>
                              {mod.description}
                            </div>
                          )}
                        </div>
                        <div style={{
                          padding: '12px 24px',
                          background: expandedModule === mod.id
                            ? 'linear-gradient(135deg, var(--neon-pink), var(--neon-cyan))'
                            : 'rgba(255, 0, 110, 0.2)',
                          borderRadius: '30px',
                          fontSize: '15px',
                          color: expandedModule === mod.id ? '#0a0a0f' : 'var(--neon-pink)',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease'
                        }}>
                          {mod.lessons.length} уроков
                        </div>
                      </div>
                      <span style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: expandedModule === mod.id ? 'var(--neon-pink)' : 'rgba(255, 0, 110, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: expandedModule === mod.id ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'all 0.4s ease',
                        color: expandedModule === mod.id ? '#0a0a0f' : 'var(--neon-pink)',
                        fontSize: '18px',
                        flexShrink: 0,
                        fontWeight: 700
                      }}>V</span>
                    </button>

                    <div style={{
                      maxHeight: expandedModule === mod.id ? '2000px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.5s ease'
                    }}>
                      <div style={{
                        padding: '0 32px 28px',
                        borderTop: '1px solid rgba(255, 0, 110, 0.2)'
                      }}>
                        <div style={{ paddingTop: '20px' }}>
                          {mod.lessons.map((lesson, li) => (
                            <div key={lesson.id} style={{
                              padding: '18px 22px',
                              marginBottom: li < mod.lessons.length - 1 ? '12px' : 0,
                              background: 'rgba(0, 0, 0, 0.5)',
                              borderRadius: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '18px',
                              border: '1px solid rgba(0, 255, 249, 0.15)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.4)';
                              e.currentTarget.style.background = 'rgba(0, 255, 249, 0.08)';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.15)';
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                            }}>
                              <span style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.4), rgba(57, 255, 20, 0.3))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--neon-cyan)',
                                fontSize: '14px',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                flexShrink: 0
                              }}>{String(li + 1).padStart(2, '0')}</span>
                              <span style={{
                                flex: 1,
                                fontSize: '16px',
                                lineHeight: 1.5
                              }}>{lesson.title}</span>
                              {lesson.duration && (
                                <span style={{
                                  fontSize: '14px',
                                  background: 'rgba(57, 255, 20, 0.2)',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  color: 'var(--neon-green)',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  fontFamily: 'monospace'
                                }}>{lesson.duration}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '70px',
                textAlign: 'center'
              }}>
                <HeroButton onClick={() => setIsApplicationModalOpen(true)} style={{ fontSize: '22px', padding: '26px 80px' }}>
                  Записаться на курс
                </HeroButton>
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px', background: 'rgba(19, 19, 26, 0.5)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '60px',
                color: 'var(--neon-green)'
              }}>
                Результаты после курса
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px'
              }}>
                {content.results.map((r, i) => (
                  <div key={i} style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.08) 0%, rgba(0, 255, 249, 0.05) 100%)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <span style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(57, 255, 20, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neon-green)',
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      flexShrink: 0
                    }}>{r.icon}</span>
                    <span style={{ fontSize: '17px', lineHeight: 1.5 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '60px'
              }}>
                <span style={{ color: 'var(--neon-cyan)' }}>{content.problemSolution.title}</span>
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '40px'
              }}>
                <div style={{
                  padding: '40px',
                  background: 'rgba(255, 60, 60, 0.05)',
                  border: '1px solid rgba(255, 60, 60, 0.3)',
                  borderRadius: '20px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    color: '#ff6b6b',
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 60, 60, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>X</span>
                    {content.problemSolution.problem.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {content.problemSolution.problem.points.map((point, i) => (
                      <li key={i} style={{
                        padding: '12px 0',
                        borderBottom: i < content.problemSolution.problem.points.length - 1 ? '1px solid rgba(255, 60, 60, 0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        opacity: 0.9
                      }}>
                        <span style={{ color: '#ff6b6b', fontWeight: 600, flexShrink: 0 }}>-</span>
                        <span style={{ lineHeight: 1.6 }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  padding: '40px',
                  background: 'rgba(57, 255, 20, 0.05)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  borderRadius: '20px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    color: 'var(--neon-green)',
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(57, 255, 20, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700
                    }}>V</span>
                    {content.problemSolution.solution.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {content.problemSolution.solution.points.map((point, i) => (
                      <li key={i} style={{
                        padding: '12px 0',
                        borderBottom: i < content.problemSolution.solution.points.length - 1 ? '1px solid rgba(57, 255, 20, 0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <span style={{ color: 'var(--neon-green)', fontWeight: 600, flexShrink: 0 }}>+</span>
                        <span style={{ lineHeight: 1.6 }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px', background: 'rgba(19, 19, 26, 0.5)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '20px',
                color: 'var(--neon-cyan)'
              }}>
                Что входит в курс
              </h2>
              <p style={{
                textAlign: 'center',
                fontSize: '18px',
                opacity: 0.7,
                marginBottom: '50px'
              }}>
                Все необходимое для освоения курса с нуля до профессионала
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {content.courseIncludes.map((item, i) => (
                  <div key={i} style={{
                    padding: '24px 28px',
                    background: 'rgba(0, 255, 249, 0.05)',
                    border: '1px solid rgba(0, 255, 249, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                    e.currentTarget.style.background = 'rgba(0, 255, 249, 0.1)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.15)';
                    e.currentTarget.style.background = 'rgba(0, 255, 249, 0.05)';
                  }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(0, 255, 249, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neon-cyan)',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>+</span>
                    <span style={{ fontSize: '15px', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                padding: '50px',
                background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1) 0%, rgba(0, 255, 249, 0.08) 100%)',
                border: '2px solid var(--neon-green)',
                borderRadius: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(57, 255, 20, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <h3 style={{
                  fontSize: '32px',
                  color: 'var(--neon-green)',
                  marginBottom: '20px'
                }}>
                  {content.guarantee.title}
                </h3>
                <p style={{
                  fontSize: '18px',
                  lineHeight: 1.7,
                  opacity: 0.9,
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  {content.guarantee.description}
                </p>
              </div>
            </div>
          </section>

          <section style={{ padding: '100px 20px', background: 'rgba(19, 19, 26, 0.5)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
                marginBottom: '60px',
                color: 'var(--neon-pink)'
              }}>
                Частые вопросы
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {content.faq.map((item, i) => (
                  <div key={i} style={{
                    padding: '28px 32px',
                    background: 'rgba(255, 0, 110, 0.03)',
                    border: '1px solid rgba(255, 0, 110, 0.15)',
                    borderRadius: '16px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--neon-pink)',
                      marginBottom: '12px'
                    }}>
                      {item.q}
                    </h4>
                    <p style={{
                      fontSize: '16px',
                      lineHeight: 1.7,
                      opacity: 0.85,
                      margin: 0
                    }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {!content && (
        <section style={{ padding: '100px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{
              padding: '50px',
              background: 'rgba(19, 19, 26, 0.6)',
              border: '1px solid rgba(0, 255, 249, 0.2)',
              borderRadius: '16px'
            }}>
              <h2 style={{ fontSize: '32px', marginBottom: '30px', color: 'var(--neon-cyan)' }}>О курсе</h2>
              <p style={{ fontSize: '18px', lineHeight: 1.8, whiteSpace: 'pre-line', opacity: 0.9 }}>
                {course.description}
              </p>
            </div>

            {(course.features as string[]).length > 0 && (
              <div style={{ marginTop: '50px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '30px', color: 'var(--neon-green)', textAlign: 'center' }}>
                  Чему вы научитесь
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {(course.features as string[]).map((feature, idx) => (
                    <div key={idx} style={{
                      padding: '20px 25px',
                      background: 'rgba(57, 255, 20, 0.05)',
                      border: '1px solid rgba(57, 255, 20, 0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.1) 0%, rgba(57, 255, 20, 0.05) 50%, rgba(255, 0, 110, 0.1) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 249, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 249, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            marginBottom: '25px'
          }}>
            Готовы начать обучение?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', lineHeight: 1.7 }}>
            Оставьте заявку и мы свяжемся с вами для уточнения деталей и подбора удобного времени занятий
          </p>
          <HeroButton onClick={() => setIsApplicationModalOpen(true)} style={{ fontSize: '20px', padding: '22px 70px' }}>
            Записаться на курс
          </HeroButton>
        </div>
      </section>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        preselectedCourse={course?.title}
      />
    </div>
  );
}
