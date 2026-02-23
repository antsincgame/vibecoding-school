import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { stripMarkdown } from '../lib/markdown';
import type { Course } from '../types';
import HeroButton from '../components/HeroButton';
import GeometricBackground from '../components/GeometricBackground';

const SEO = {
  title: 'Курсы вайбкодинга 2026 | Бесплатный курс и Cursor AI - цены и программа',
  description: 'Курсы вайбкодинга в школе Vibecoding: бесплатный курс для начинающих, Cursor AI для профессионалов. Создавай сайты с ИИ, получи проекты в портфолио. Онлайн обучение вайбкодингу с нуля.',
  keywords: 'курсы вайбкодинга, вайбкодинг обучение, Cursor AI курс, бесплатный курс вайбкодинга, обучение вайбкодингу онлайн, создание сайтов с ИИ курсы'
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
    canonicalLink.href = 'https://vibecoding.by/courses';

    loadCourses();

    return () => {
      canonicalLink.href = 'https://vibecoding.by/';
    };
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading courses:', error);
    }

    if (data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const getGradient = (index: number) => {
    if (index % 3 === 0) return 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))';
    if (index % 3 === 1) return 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))';
    return 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))';
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '40px',
      paddingLeft: '16px',
      paddingRight: '16px',
      position: 'relative',
      zIndex: 1
    }}>
      <GeometricBackground variant="dense" colorScheme="mixed" intensity={0.8} />
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 60px)',
          textAlign: 'center',
          marginBottom: '30px'
        }} className="glitch" data-text="НАШИ КУРСЫ">
          <span className="neon-text">НАШИ КУРСЫ</span>
        </h1>
        
        <p style={{
          textAlign: 'center',
          fontSize: '20px',
          opacity: 0.8,
          marginBottom: '60px',
          maxWidth: '800px',
          margin: '0 auto 60px'
        }}>
          Выбери направление для <strong>создания веб-приложений</strong>: <strong>Cursor AI</strong> для профессиональной разработки или <strong>AI-инструменты</strong> для быстрого старта!
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="pulse" style={{
              fontSize: '48px',
              color: 'var(--neon-cyan)'
            }}>
              ⚡
            </div>
            <p style={{ marginTop: '20px', opacity: 0.7 }}>Загрузка курсов...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {courses.map((course, index) => (
              <div key={course.id} className="cyber-card" style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  height: '250px',
                  background: course.image_url ? 'transparent' : getGradient(index),
                  marginBottom: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    '💻'
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '8px 15px',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: '1px solid var(--neon-cyan)'
                  }}>
                    {course.age_group}
                  </div>
                </div>
                
                <h2 style={{
                  fontSize: '28px',
                  marginBottom: '20px',
                  color: 'var(--neon-cyan)'
                }}>
                  {course.title}
                </h2>
                
                <p style={{
                  opacity: 0.8,
                  marginBottom: '25px',
                  lineHeight: '1.7',
                  flex: 1
                }}>
                  {stripMarkdown(course.description).substring(0, 200)}{stripMarkdown(course.description).length > 200 ? '...' : ''}
                </p>
                
                <div style={{
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'rgba(0, 255, 249, 0.05)',
                  border: '1px solid rgba(0, 255, 249, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    marginBottom: '15px',
                    color: 'var(--neon-green)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Чему научишься:
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0
                  }}>
                    {(course.features as string[]).map((feature, idx) => (
                      <li key={idx} style={{
                        marginBottom: '8px',
                        paddingLeft: '20px',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: 'var(--neon-cyan)'
                        }}>▸</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '25px',
                  padding: '20px 0',
                  borderTop: '1px solid rgba(0, 255, 249, 0.3)',
                  borderBottom: '1px solid rgba(0, 255, 249, 0.3)'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '5px' }}>
                      Длительность
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--neon-green)'
                    }}>
                      {course.duration}
                    </div>
                  </div>
                </div>
                
                <HeroButton
                  onClick={() => navigate(`/course/${course.slug}`)}
                  style={{
                    width: '100%',
                    fontSize: '16px',
                    padding: '16px'
                  }}
                >
                  Подробнее о курсе
                </HeroButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
