import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentWork } from '../types';

export default function StudentWorks() {
  const [websites, setWebsites] = useState<StudentWork[]>([]);
  const [apps, setApps] = useState<StudentWork[]>([]);

  useEffect(() => {
    document.title = 'Работы учеников вайбкодинга | Проекты Cursor AI';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Портфолио учеников вайбкодинга: реальные сайты и приложения, созданные на курсах Vibecoding с Cursor AI. Смотри, что создают ученики школы вайбкодинга!');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', 'работы учеников вайбкодинга, портфолио вайбкодинг, проекты Cursor AI, примеры работ вайбкодинг, результаты обучения вайбкодингу');
    loadWorks();
  }, []);

  const loadWorks = async () => {
    const { data: boltData, error: boltError } = await supabase
      .from('student_works')
      .select('*')
      .eq('is_active', true)
      .eq('tool_type', 'bolt')
      .order('order_index', { ascending: true });

    const { data: cursorData, error: cursorError } = await supabase
      .from('student_works')
      .select('*')
      .eq('is_active', true)
      .eq('tool_type', 'cursor')
      .order('order_index', { ascending: true });

    if (boltError) console.error('Bolt works error:', boltError);
    if (cursorError) console.error('Cursor works error:', cursorError);

    if (boltData) setWebsites(boltData);
    if (cursorData) setApps(cursorData);
  };

  const WorkCard = ({ work }: { work: StudentWork }) => (
    <div className="cyber-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '200px',
        background: work.image_url
          ? `url(${work.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, rgba(0, 255, 249, 0.3), rgba(255, 0, 255, 0.3))',
        marginBottom: '20px',
        borderRadius: '4px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: work.tool_type === 'bolt' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
          color: 'var(--bg-dark)',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {work.tool_type === 'bolt' ? 'Bolt.new' : 'Cursor AI'}
        </div>
      </div>

      <h3 style={{
        fontSize: '22px',
        marginBottom: '10px',
        color: 'var(--neon-cyan)'
      }}>
        {work.project_title}
      </h3>

      <div style={{
        fontSize: '14px',
        color: 'var(--neon-green)',
        marginBottom: '15px'
      }}>
        {work.student_name}, {work.student_age} лет
      </div>

      <p style={{
        opacity: 0.8,
        marginBottom: '20px',
        lineHeight: '1.7',
        flex: 1
      }}>
        {work.project_description}
      </p>

      {work.project_url ? (
        <a
          href={work.project_url}
          target="_blank"
          rel="noopener noreferrer"
          className="cyber-button"
          style={{
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            padding: '12px 24px'
          }}
        >
          Перейти на сайт
        </a>
      ) : (
        <div
          style={{
            display: 'block',
            textAlign: 'center',
            fontSize: '14px',
            padding: '12px 24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'default'
          }}
        >
          Ссылка скоро появится
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          textAlign: 'center',
          marginBottom: '20px',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan), var(--neon-pink))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Работы учеников
        </h1>
        <p style={{
          textAlign: 'center',
          fontSize: '18px',
          opacity: 0.8,
          marginBottom: '50px',
          maxWidth: '800px',
          margin: '0 auto 50px',
          lineHeight: '1.7'
        }}>
          Здесь собраны проекты, созданные учениками <strong>онлайн школы вайб-кодинга</strong>.
          Каждая работа - реальный результат <strong>обучения Cursor AI</strong> и <strong>Bolt.ai</strong>!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '40px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              marginBottom: '30px',
              color: 'var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{
                background: 'var(--neon-cyan)',
                color: 'var(--bg-dark)',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 700
              }}>
                BOLT.NEW
              </span>
              Сайты
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {websites.length > 0 ? (
                websites.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))
              ) : (
                <div className="cyber-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ opacity: 0.6 }}>Пока нет работ</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '28px',
              marginBottom: '30px',
              color: 'var(--neon-pink)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{
                background: 'var(--neon-pink)',
                color: 'var(--bg-dark)',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 700
              }}>
                CURSOR AI
              </span>
              Приложения
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {apps.length > 0 ? (
                apps.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))
              ) : (
                <div className="cyber-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ opacity: 0.6 }}>Пока нет работ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .works-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
