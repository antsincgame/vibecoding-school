import { useEffect, useState } from 'react';
import ApplicationModal from '../components/ApplicationModal';
import HeroButton from '../components/HeroButton';
import GeometricBackground from '../components/GeometricBackground';

const SEO = {
  title: 'Преподаватели вайбкодинга | Эксперты Cursor AI - Vibecoding',
  description: 'Преподаватели школы вайбкодинга Vibecoding: Дмитрий Орлов - 15+ лет в IT, эксперт Cursor AI и AI-разработки. Игорь Сухоцкий - senior-разработчик, архитектор систем. Учись вайбкодингу у практикующих специалистов!',
  keywords: 'преподаватели вайбкодинга, обучение вайбкодингу, Cursor AI эксперт, AI-разработка специалист, менторы вайбкодинга, Vibecoding учителя'
};

const DEFAULT_QUOTE_DMITRY = 'Я верю, что каждый может освоить веб-разработку. Мой подход — это сочетание практического опыта, современных AI-инструментов и понятной подачи материала. Вместо заучивания теории мы создаем реальные проекты, которые можно показать в портфолио.';
const DEFAULT_QUOTE_IGOR = 'Хорошая архитектура — это не сложность ради сложности, а простота, которая масштабируется. Я учу создавать код, который понятен не только машине, но и следующему разработчику. Минималистичные решения без магии — вот что отличает профессионала.';

export default function About() {
  const [quoteDmitry, setQuoteDmitry] = useState<string>('');
  const [quoteIgor, setQuoteIgor] = useState<string>('');
  const [loadingDmitry, setLoadingDmitry] = useState(true);
  const [loadingIgor, setLoadingIgor] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

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
    canonicalLink.href = 'https://vibecoding.by/about';

    generateQuotes();

    return () => {
      canonicalLink.href = 'https://vibecoding.by/';
    };
  }, []);

  const generateQuotes = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const [responseDmitry, responseIgor] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/generate-quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            prompt: 'Создай короткую вдохновляющую цитату (2-3 предложения) о Vibecoding - современном подходе к обучению программированию, где сочетается практический опыт, AI-инструменты и понятная подача материала. Цитата должна быть от лица преподавателя и мотивировать учеников. Только текст цитаты, без кавычек и атрибуции.',
            teacher: 'dmitry'
          })
        }),
        fetch(`${supabaseUrl}/functions/v1/generate-quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            prompt: 'Создай короткую вдохновляющую цитату (2-3 предложения) от лица опытного senior-разработчика и архитектора систем о важности чистой архитектуры, менторинга и минималистичных решений в программировании. Цитата должна мотивировать учеников изучать backend-разработку и проектирование систем. Только текст цитаты, без кавычек и атрибуции.',
            teacher: 'igor'
          })
        })
      ]);

      if (responseDmitry.ok) {
        const data = await responseDmitry.json();
        setQuoteDmitry(data.quote || DEFAULT_QUOTE_DMITRY);
      } else {
        setQuoteDmitry(DEFAULT_QUOTE_DMITRY);
      }

      if (responseIgor.ok) {
        const data = await responseIgor.json();
        setQuoteIgor(data.quote || DEFAULT_QUOTE_IGOR);
      } else {
        setQuoteIgor(DEFAULT_QUOTE_IGOR);
      }
    } catch {
      setQuoteDmitry(DEFAULT_QUOTE_DMITRY);
      setQuoteIgor(DEFAULT_QUOTE_IGOR);
    } finally {
      setLoadingDmitry(false);
      setLoadingIgor(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', position: 'relative', zIndex: 1 }}>
      <GeometricBackground variant="waves" colorScheme="cyan" />
      <section style={{
        padding: '60px 20px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          marginBottom: '20px',
          color: 'var(--neon-cyan)'
        }} className="glitch" data-text="НАШИ ПРЕПОДАВАТЕЛИ">
          НАШИ ПРЕПОДАВАТЕЛИ
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.8)',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Команда практикующих специалистов с многолетним опытом в IT-индустрии
        </p>
      </section>

      <section style={{
        padding: '40px 20px 80px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          marginBottom: '20px',
          color: 'var(--neon-cyan)'
        }} className="glitch" data-text="ДМИТРИЙ ОРЛОВ">
          ДМИТРИЙ ОРЛОВ
        </h2>

        <h3 style={{
          fontSize: 'clamp(20px, 3vw, 26px)',
          textAlign: 'center',
          marginBottom: '50px',
          color: 'var(--neon-pink)',
          fontWeight: 600
        }}>
          Преподаватель вайб-кодинга, Cursor AI и AI-инструменты
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
          alignItems: 'start'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{
              border: '3px solid var(--neon-cyan)',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 0 20px var(--neon-cyan), inset 0 0 20px rgba(0, 255, 249, 0.1)',
              background: 'var(--dark-surface)'
            }}>
              <img
                src="/image.png"
                alt="Дмитрий Орлов"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '60px',
              height: '60px',
              border: '2px solid var(--neon-pink)',
              borderRadius: '5px',
              background: 'transparent'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              width: '60px',
              height: '60px',
              border: '2px solid var(--neon-green)',
              borderRadius: '5px',
              background: 'transparent'
            }} />
          </div>

          <div style={{ fontSize: '18px', lineHeight: '1.9' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 249, 0.1)',
                border: '2px solid var(--neon-cyan)',
                borderRadius: '5px',
                color: 'var(--neon-cyan)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                15+ лет в IT-индустрии
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 110, 0.1)',
                border: '2px solid var(--neon-pink)',
                borderRadius: '5px',
                color: 'var(--neon-pink)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                Основатель "Студия Орлова"
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 65, 0.1)',
                border: '2px solid var(--neon-green)',
                borderRadius: '5px',
                color: 'var(--neon-green)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                Бывший Резидент ПВТ (5 лет опыта)
              </div>
            </div>

            <p style={{ marginBottom: '20px', opacity: 0.95 }}>
              <strong style={{ color: 'var(--neon-cyan)' }}>Дмитрий Орлов</strong> — практикующий специалист с богатым опытом <strong>создания веб-приложений</strong> и продвижения онлайн-проектов. Как основатель веб-студии <strong>"Студия Орлова"</strong> и компании <strong>ООО "Серендип"</strong> (резидент Парка Высоких Технологий), он реализовал десятки успешных проектов — от корпоративных сайтов до сложных веб-приложений с интеграцией <strong>Cursor AI</strong> и <strong>AI-инструменты</strong>.
            </p>
          </div>
        </div>

        <div className="cyber-card" style={{ marginBottom: '40px' }}>
          <h4 style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            marginBottom: '20px',
            color: 'var(--neon-cyan)'
          }}>
            Экспертиза
          </h4>
          <p style={{ fontSize: '18px', lineHeight: '1.9', marginBottom: '20px', opacity: 0.95 }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>Технический директор</strong> — это специалист, который руководит всеми техническими аспектами проектов: от выбора технологий и архитектуры до запуска и поддержки. Этот опыт бесценен для учеников, ведь Дмитрий не просто учит кодить, а показывает, как мыслить стратегически, принимать важные технические решения и создавать проекты, которые работают в реальном бизнесе.
          </p>

          <h5 style={{
            fontSize: '20px',
            marginTop: '25px',
            marginBottom: '15px',
            color: 'var(--neon-green)'
          }}>
            Основные направления обучения:
          </h5>
          <ul style={{
            fontSize: '18px',
            lineHeight: '2',
            paddingLeft: '25px',
            opacity: 0.95
          }}>
            <li><strong>Обучение Cursor AI</strong> — профессиональная AI-разработка</li>
            <li><strong>Курсы AI-инструменты</strong> — быстрое создание веб-приложений</li>
            <li>Вайб-кодинг и программирование с искусственным интеллектом</li>
            <li>SEO-продвижение и привлечение первых клиентов</li>
            <li>Деплой и размещение проектов онлайн</li>
          </ul>
        </div>

        <div style={{
          padding: '50px 20px',
          background: 'rgba(0, 255, 249, 0.03)',
          borderRadius: '15px',
          marginBottom: '40px'
        }}>
          <h4 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            marginBottom: '30px',
            color: 'var(--neon-green)'
          }}>
            Философия преподавания
          </h4>

          <div style={{
            position: 'relative',
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.1), rgba(255, 0, 110, 0.1))',
            border: '3px solid var(--neon-cyan)',
            borderRadius: '15px',
            boxShadow: '0 0 30px rgba(0, 255, 249, 0.3), inset 0 0 30px rgba(0, 255, 249, 0.1)',
            maxWidth: '900px',
            margin: '0 auto 30px'
          }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '20px',
              fontSize: '60px',
              color: 'var(--neon-cyan)',
              opacity: 0.3,
              lineHeight: 1
            }}>
              "
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              fontSize: '60px',
              color: 'var(--neon-cyan)',
              opacity: 0.3,
              lineHeight: 1
            }}>
              "
            </div>
            {loadingDmitry ? (
              <div style={{
                textAlign: 'center',
                padding: '30px',
                fontSize: '18px',
                color: 'var(--neon-cyan)'
              }}>
                Генерируем вдохновляющую цитату...
              </div>
            ) : (
              <p style={{
                fontSize: '20px',
                lineHeight: '1.8',
                fontStyle: 'italic',
                textAlign: 'center',
                margin: '20px 0',
                color: '#fff'
              }}>
                {quoteDmitry}
              </p>
            )}
          </div>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.9',
            opacity: 0.95,
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Дмитрий постоянно исследует новые технологии и инструменты разработки, интегрируя в учебную программу только проверенные и актуальные решения. Его страсть к инновациям и искусственному интеллекту делает занятия не только полезными, но и вдохновляющими.
          </p>
        </div>
      </section>

      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent, var(--neon-pink), transparent)',
        maxWidth: '800px',
        margin: '0 auto'
      }} />

      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          marginBottom: '20px',
          color: 'var(--neon-pink)'
        }} className="glitch" data-text="ИГОРЬ СУХОЦКИЙ">
          ИГОРЬ СУХОЦКИЙ
        </h2>

        <h3 style={{
          fontSize: 'clamp(20px, 3vw, 26px)',
          textAlign: 'center',
          marginBottom: '50px',
          color: 'var(--neon-cyan)',
          fontWeight: 600
        }}>
          Senior-разработчик, архитектор систем
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
          alignItems: 'start'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{
              border: '3px solid var(--neon-pink)',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 0 20px var(--neon-pink), inset 0 0 20px rgba(255, 0, 110, 0.1)',
              background: 'var(--dark-surface)'
            }}>
              <img
                src="/igor.png"
                alt="Игорь Сухоцкий"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '60px',
              height: '60px',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '5px',
              background: 'transparent'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              width: '60px',
              height: '60px',
              border: '2px solid var(--neon-green)',
              borderRadius: '5px',
              background: 'transparent'
            }} />
          </div>

          <div style={{ fontSize: '18px', lineHeight: '1.9' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 110, 0.1)',
                border: '2px solid var(--neon-pink)',
                borderRadius: '5px',
                color: 'var(--neon-pink)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                7+ лет PHP
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 249, 0.1)',
                border: '2px solid var(--neon-cyan)',
                borderRadius: '5px',
                color: 'var(--neon-cyan)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                4 года Node.js
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 65, 0.1)',
                border: '2px solid var(--neon-green)',
                borderRadius: '5px',
                color: 'var(--neon-green)',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                Senior / Архитектор
              </div>
            </div>

            <p style={{ marginBottom: '20px', opacity: 0.95 }}>
              <strong style={{ color: 'var(--neon-pink)' }}>Игорь Сухоцкий</strong> — опытный backend-разработчик и архитектор, прошедший путь от энтузиаста до senior-специалиста. За плечами — <strong>7+ лет работы с PHP</strong> (от WordPress до высоконагруженных систем) и <strong>4 года коммерческой практики с Node.js</strong>. Проектирует архитектуру сложных систем, разрабатывает <strong>REST и GraphQL API</strong>, работает с React и Vue на фронтенде.
            </p>
          </div>
        </div>

        <div className="cyber-card" style={{ marginBottom: '40px', borderColor: 'var(--neon-pink)' }}>
          <h4 style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            marginBottom: '20px',
            color: 'var(--neon-pink)'
          }}>
            Экспертиза
          </h4>
          <p style={{ fontSize: '18px', lineHeight: '1.9', marginBottom: '20px', opacity: 0.95 }}>
            <strong style={{ color: 'var(--neon-pink)' }}>Архитектор систем</strong> — это специалист, который видит проект целиком: от структуры базы данных до взаимодействия микросервисов. Игорь учит студентов не просто писать код, а создавать <strong>масштабируемые решения</strong>, которые легко поддерживать и развивать. Его принцип — минималистичные решения без "магии", где каждая строка кода понятна и обоснована.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.9', marginBottom: '20px', opacity: 0.95 }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>Практический опыт:</strong> платежные интеграции, системы видео-коммуникаций, аналитические API, онлайн-магазины на WooCommerce, настройка CI/CD пайплайнов и автоматизация деплоя.
          </p>

          <h5 style={{
            fontSize: '20px',
            marginTop: '25px',
            marginBottom: '15px',
            color: 'var(--neon-green)'
          }}>
            Ключевые компетенции:
          </h5>
          <ul style={{
            fontSize: '18px',
            lineHeight: '2',
            paddingLeft: '25px',
            opacity: 0.95
          }}>
            <li><strong>Backend-разработка</strong> — PHP, Node.js, базы данных</li>
            <li><strong>Frontend</strong> — React, Vue, современные фреймворки</li>
            <li><strong>API-проектирование</strong> — REST, GraphQL, микросервисы</li>
            <li><strong>DevOps</strong> — CI/CD, автоматизация, деплой</li>
            <li><strong>Менторинг</strong> — код-ревью, архитектурные консультации</li>
          </ul>
        </div>

        <div style={{
          padding: '50px 20px',
          background: 'rgba(255, 0, 110, 0.03)',
          borderRadius: '15px'
        }}>
          <h4 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            marginBottom: '30px',
            color: 'var(--neon-green)'
          }}>
            Философия преподавания
          </h4>

          <div style={{
            position: 'relative',
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(0, 255, 249, 0.1))',
            border: '3px solid var(--neon-pink)',
            borderRadius: '15px',
            boxShadow: '0 0 30px rgba(255, 0, 110, 0.3), inset 0 0 30px rgba(255, 0, 110, 0.1)',
            maxWidth: '900px',
            margin: '0 auto 30px'
          }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '20px',
              fontSize: '60px',
              color: 'var(--neon-pink)',
              opacity: 0.3,
              lineHeight: 1
            }}>
              "
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              fontSize: '60px',
              color: 'var(--neon-pink)',
              opacity: 0.3,
              lineHeight: 1
            }}>
              "
            </div>
            {loadingIgor ? (
              <div style={{
                textAlign: 'center',
                padding: '30px',
                fontSize: '18px',
                color: 'var(--neon-pink)'
              }}>
                Генерируем вдохновляющую цитату...
              </div>
            ) : (
              <p style={{
                fontSize: '20px',
                lineHeight: '1.8',
                fontStyle: 'italic',
                textAlign: 'center',
                margin: '20px 0',
                color: '#fff'
              }}>
                {quoteIgor}
              </p>
            )}
          </div>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.9',
            opacity: 0.95,
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Игорь делится не только техническими знаниями, но и опытом решения реальных бизнес-задач. Его подход к менторингу — это передача практических навыков через понятные примеры, код-ревью и архитектурные разборы реальных проектов.
          </p>
        </div>
      </section>

      <section style={{
        padding: '60px 20px 80px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          padding: '50px',
          background: 'linear-gradient(135deg, rgba(0, 255, 249, 0.08) 0%, rgba(255, 0, 110, 0.05) 100%)',
          border: '2px solid var(--neon-cyan)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(0, 255, 249, 0.15)'
        }}>
          <h3 style={{
            fontSize: '28px',
            marginBottom: '20px',
            color: 'var(--neon-cyan)'
          }}>
            Учитесь у практикующих экспертов
          </h3>
          <p style={{
            fontSize: '18px',
            opacity: 0.9,
            marginBottom: '30px',
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            Оставьте заявку на обучение и начните путь в IT вместе с нашими преподавателями
          </p>
          <HeroButton
            onClick={() => setIsApplicationModalOpen(true)}
            style={{
              fontSize: '18px',
              padding: '18px 50px'
            }}
          >
            Записаться на обучение
          </HeroButton>
        </div>
      </section>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}
