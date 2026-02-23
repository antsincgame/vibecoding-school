const audienceData = [
  {
    emoji: '💼',
    title: 'Предпринимателям',
    description: 'Создавайте MVP и прототипы для бизнеса без найма разработчиков. Тестируйте идеи быстро и недорого.',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '🎓',
    title: 'Студентам',
    description: 'Начните зарабатывать на создании сайтов уже во время учебы. Выход на фриланс с первых месяцев.',
    image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '👶',
    title: 'Женщинам в декрете',
    description: 'Удаленная работа с гибким графиком. Освойте новую профессию, не выходя из дома.',
    image: 'https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '🎨',
    title: 'Дизайнерам',
    description: 'Превращайте свои макеты в работающие сайты самостоятельно. Больше не нужен разработчик.',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '📈',
    title: 'Маркетологам',
    description: 'Создавайте лендинги и промо-страницы без помощи разработчиков. Запускайте кампании быстрее.',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '💻',
    title: 'Фрилансерам',
    description: 'Расширьте спектр услуг и увеличьте доход. Веб-разработка — востребованное направление.',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '🚀',
    title: 'Школьникам от 16 лет',
    description: 'Первые заработки на создании сайтов. Начните карьеру в IT раньше сверстников.',
    image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    emoji: '🔄',
    title: 'Специалистам любых областей',
    description: 'Быстрый старт в IT без сложного программирования. Смена карьеры стала проще.',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

export default function TargetAudienceSection() {
  return (
    <section style={{
      padding: '60px 16px',
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 42px)',
        textAlign: 'center',
        marginBottom: '20px',
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 0 30px rgba(0, 255, 249, 0.4)'
      }}>
        Для кого подходит обучение
      </h2>
      <p style={{
        textAlign: 'center',
        fontSize: '18px',
        opacity: 0.8,
        marginBottom: '50px',
        maxWidth: '700px',
        margin: '0 auto 50px'
      }}>
        Вайбкодинг открывает двери в IT для людей любых профессий и возрастов
      </p>

      <div className="audience-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px'
      }}>
        {audienceData.map((item, index) => (
          <div
            key={index}
            className="audience-card"
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)',
              border: '1px solid rgba(0, 255, 249, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
          >
            <div style={{
              height: '140px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.6) saturate(0.8)',
                  transition: 'transform 0.3s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 20, 0.9) 100%)'
              }} />
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontSize: '32px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
              }}>
                {item.emoji}
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                marginBottom: '10px',
                color: 'var(--neon-cyan)',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                opacity: 0.85,
                margin: 0
              }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .audience-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 255, 249, 0.5) !important;
          box-shadow: 0 10px 30px rgba(0, 255, 249, 0.15), 0 0 20px rgba(0, 255, 249, 0.1);
        }
        .audience-card:hover img {
          transform: scale(1.05);
        }
        @media (max-width: 1200px) {
          .audience-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .audience-grid {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
