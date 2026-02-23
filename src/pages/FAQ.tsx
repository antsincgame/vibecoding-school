import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FAQ as FAQType } from '../types';
import ApplicationModal from '../components/ApplicationModal';
import HeroButton from '../components/HeroButton';
import GeometricBackground from '../components/GeometricBackground';

const SEO = {
  title: 'FAQ вайбкодинг | Вопросы и ответы о курсах Vibecoding',
  description: 'Ответы на вопросы о вайбкодинге: стоимость обучения, как проходят занятия, какой компьютер нужен. Курсы вайбкодинга Cursor AI, бесплатный курс - всё о формате, оплате и трудоустройстве. Возврат денег если не подойдёт!',
  keywords: 'FAQ вайбкодинг, вопросы о вайбкодинге, обучение вайбкодингу стоимость, курсы вайбкодинга формат, Cursor AI FAQ, бесплатный курс вайбкодинга',
  canonical: 'https://vibecoding.by/q-a'
};

interface FAQSection {
  category: string;
  questions: { q: string; a: string }[];
}

const defaultFAQs: FAQSection[] = [
  {
    category: 'О КУРСЕ И ОБУЧЕНИИ',
    questions: [
      {
        q: 'Сколько времени занимает обучение?',
        a: '4.5 часа в неделю (3 занятия по 1.5 часа) плюс 2-3 часа на практику. Итого около 7-8 часов в неделю. Гибкий график позволяет совмещать обучение с работой.'
      },
      {
        q: 'Нужен ли опыт программирования?',
        a: 'Нет, курс рассчитан на новичков. ИИ-инструменты делают процесс обучения интуитивным. Вы начнете создавать рабочие проекты с первых занятий.'
      },
      {
        q: 'Какой возраст подходит для обучения?',
        a: 'От 16 лет и старше. Курс подходит как для студентов, так и для взрослых, которые хотят сменить профессию или получить дополнительный навык.'
      },
      {
        q: 'Что если я не успеваю за группой?',
        a: 'Обучение построено на индивидуальном темпе. Записи занятий доступны для повторного просмотра, а преподаватель всегда готов помочь разобраться в сложных моментах.'
      },
      {
        q: 'Можно ли совмещать с основной работой?',
        a: 'Да, большинство учеников совмещают обучение с работой или учебой. Занятия проходят в вечернее время, а материалы доступны для самостоятельного изучения.'
      },
      {
        q: 'Есть ли возврат денег, если не подойдет?',
        a: 'Да, полный возврат средств в течение первых 2 недель обучения без каких-либо вопросов.'
      }
    ]
  },
  {
    category: 'ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ',
    questions: [
      {
        q: 'Какой компьютер нужен для обучения?',
        a: 'Подойдет любой компьютер или ноутбук с Windows, macOS или Linux. Все инструменты работают через браузер, поэтому даже устройство 2015 года справится отлично.'
      },
      {
        q: 'Какой браузер лучше использовать?',
        a: 'Chrome, Firefox или Safari последних версий. Рекомендуем Chrome для лучшей совместимости с инструментами разработки.'
      },
      {
        q: 'Нужно ли устанавливать программы?',
        a: 'Минимально. Основная работа идет в браузере. Опционально можно установить Cursor для продвинутой разработки, но это не обязательно для начала.'
      },
      {
        q: 'Нужен ли постоянный доступ к интернету?',
        a: 'Да, для работы с облачными инструментами и ИИ-ассистентами требуется стабильное интернет-соединение.'
      }
    ]
  },
  {
    category: 'КАРЬЕРА И ЗАРАБОТОК',
    questions: [
      {
        q: 'Можно ли зарабатывать после курса?',
        a: 'Да, выпускники берут фриланс-заказы на Fiverr, Upwork и других платформах. Начинающие разработчики зарабатывают от $10-50 за простые проекты, с опытом доход растет.'
      },
      {
        q: 'Какие перспективы трудоустройства?',
        a: 'После курса вы можете работать как фрилансер, устроиться на позицию junior-разработчика ($500-1500/месяц) или развивать собственные проекты. IT-рынок испытывает дефицит кадров.'
      },
      {
        q: 'Что я получу по окончании курса?',
        a: 'Портфолио из 7+ работающих проектов, оформленный GitHub-профиль, сертификат об окончании, практические навыки веб-разработки и понимание современных инструментов.'
      },
      {
        q: 'Помогаете ли вы с трудоустройством?',
        a: 'Мы помогаем с составлением портфолио, резюме и подготовкой к собеседованиям. Также делимся вакансиями и возможностями для фриланса в сообществе выпускников.'
      }
    ]
  },
  {
    category: 'ФОРМАТ ОБУЧЕНИЯ',
    questions: [
      {
        q: 'Как проходят занятия?',
        a: 'Онлайн в небольших группах через видеосвязь. Каждое занятие включает теорию, практику и разбор вопросов. Все записывается для повторного просмотра.'
      },
      {
        q: 'Есть ли домашние задания?',
        a: 'Да, практические задания после каждого занятия. Это ключевая часть обучения - именно на практике закрепляются навыки.'
      },
      {
        q: 'Можно ли задавать вопросы вне занятий?',
        a: 'Да, доступ к чату с преподавателем и сообществу студентов. Вопросы можно задавать в любое время, ответ обычно приходит в течение дня.'
      },
      {
        q: 'Сколько длится полный курс?',
        a: 'Базовый курс занимает 2-3 месяца. За это время вы освоите основы веб-разработки и создадите несколько полноценных проектов.'
      }
    ]
  },
  {
    category: 'ОПЛАТА',
    questions: [
      {
        q: 'Какие способы оплаты доступны?',
        a: 'Банковские карты, переводы, электронные кошельки. Возможна оплата в рассрочку - разбейте сумму на несколько платежей.'
      },
      {
        q: 'Есть ли скидки?',
        a: 'Да, действуют скидки при раннем бронировании и для тех, кто приводит друзей. Актуальные акции уточняйте у менеджера.'
      },
      {
        q: 'Можно ли оплатить частями?',
        a: 'Да, доступна рассрочка без переплаты. Условия обсуждаются индивидуально.'
      }
    ]
  }
];

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(true);
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
    canonicalLink.href = SEO.canonical;

    loadFAQs();

    return () => {
      canonicalLink.href = 'https://vibecoding.by/';
    };
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      setUseDatabase(false);
    } else {
      setFaqs(data);
      setUseDatabase(true);
    }
    setLoading(false);
  };

  const toggleFAQ = (index: string) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQType[]>);

  const categoryNames: Record<string, string> = {
    general: 'Общие вопросы',
    courses: 'О курсах',
    payment: 'Оплата',
    technical: 'Технические вопросы'
  };

  const renderFAQItem = (question: string, answer: string, key: string) => {
    const isActive = activeIndex === key;
    return (
      <div
        key={key}
        className="cyber-card"
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => toggleFAQ(key)}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h3 style={{
            fontSize: '20px',
            color: 'var(--neon-cyan)',
            flex: 1
          }}>
            {question}
          </h3>
          <div style={{
            fontSize: '24px',
            color: 'var(--neon-cyan)',
            transform: isActive ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
            flexShrink: 0
          }}>
            ^
          </div>
        </div>

        <div style={{
          maxHeight: isActive ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          marginTop: isActive ? '20px' : '0'
        }}>
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(0, 255, 249, 0.3)',
            fontSize: '18px',
            lineHeight: '1.8',
            opacity: 0.9
          }}>
            {answer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      <GeometricBackground variant="minimal" colorScheme="cyan" />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 60px)',
          textAlign: 'center',
          marginBottom: '30px'
        }} className="glitch" data-text="ВОПРОСЫ И ОТВЕТЫ">
          <span className="neon-text">ВОПРОСЫ И ОТВЕТЫ</span>
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '20px',
          opacity: 0.8,
          marginBottom: '60px'
        }}>
          Ответы на популярные вопросы об <strong>онлайн курсах вайб-кодинга</strong>, <strong>обучении Cursor AI</strong> и <strong>AI-инструменты</strong>
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="pulse" style={{
              fontSize: '48px',
              color: 'var(--neon-cyan)'
            }}>
              ...
            </div>
            <p style={{ marginTop: '20px', opacity: 0.7 }}>Загрузка...</p>
          </div>
        ) : useDatabase && Object.keys(groupedFAQs).length > 0 ? (
          <div>
            {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
              <div key={category} style={{ marginBottom: '50px' }}>
                <h2 style={{
                  fontSize: '28px',
                  marginBottom: '30px',
                  color: 'var(--neon-pink)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {categoryNames[category] || category}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {categoryFaqs.map((faq) => renderFAQItem(faq.question, faq.answer, `db-${faq.id}`))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {defaultFAQs.map((section, sectionIdx) => (
              <div key={sectionIdx} style={{ marginBottom: '50px' }}>
                <h2 style={{
                  fontSize: '28px',
                  marginBottom: '30px',
                  color: 'var(--neon-pink)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {section.category}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {section.questions.map((item, qIdx) =>
                    renderFAQItem(item.q, item.a, `${sectionIdx}-${qIdx}`)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '80px',
          padding: '50px 30px',
          background: 'rgba(19, 19, 26, 0.8)',
          border: '1px solid var(--neon-green)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '32px',
            marginBottom: '20px',
            color: 'var(--neon-green)'
          }}>
            ОСТАЛИСЬ ВОПРОСЫ?
          </h3>
          <p style={{
            fontSize: '18px',
            opacity: 0.8,
            marginBottom: '30px'
          }}>
            Оставьте заявку - ответим на все вопросы и поможем выбрать подходящий курс
          </p>
          <HeroButton onClick={() => setIsApplicationModalOpen(true)}>
            Оставить заявку
          </HeroButton>
        </div>
      </div>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}
