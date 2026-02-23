import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const SEO = {
  title: 'Политика конфиденциальности | Школа вайбкодинга Vibecoding',
  description: 'Политика конфиденциальности школы вайбкодинга Vibecoding. Как мы защищаем персональные данные учеников курсов вайбкодинга. Cookies, права пользователей, безопасность.',
  keywords: 'политика конфиденциальности Vibecoding, школа вайбкодинга данные, защита данных курсы вайбкодинга'
};

export default function Privacy() {
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
    canonicalLink.href = 'https://vibecoding.by/privacy';

    return () => {
      canonicalLink.href = 'https://vibecoding.by/';
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      color: '#ffffff'
    }}>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '120px 20px 80px'
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          marginBottom: '40px',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center'
        }}>
          Политика конфиденциальности
        </h1>

        <div style={{
          backgroundColor: 'rgba(10, 10, 30, 0.6)',
          border: '2px solid var(--neon-cyan)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 255, 249, 0.2)',
          lineHeight: '1.8'
        }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              1. Общие положения
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации о физических лицах,
              использующих сайт vibecoding.by (далее — Сайт).
            </p>
            <p style={{ opacity: 0.9 }}>
              Использование Сайта означает безоговорочное согласие пользователя с настоящей Политикой и указанными в ней
              условиями обработки его персональной информации.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              2. Персональные данные
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              Мы собираем и обрабатываем следующие персональные данные:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Имя и контактная информация (email, телефон) при регистрации на пробное занятие</li>
              <li style={{ marginBottom: '10px' }}>Данные об использовании Сайта (IP-адрес, тип браузера, время посещения)</li>
              <li style={{ marginBottom: '10px' }}>Информация, предоставленная добровольно при обращении через формы обратной связи</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              3. Использование cookies
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              Сайт использует файлы cookie для:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Обеспечения корректной работы функциональности Сайта</li>
              <li style={{ marginBottom: '10px' }}>Анализа использования Сайта и улучшения пользовательского опыта</li>
              <li style={{ marginBottom: '10px' }}>Сохранения пользовательских настроек и предпочтений</li>
            </ul>
            <p style={{ marginTop: '15px', opacity: 0.9 }}>
              Вы можете отключить использование cookies в настройках своего браузера, однако это может повлиять на работу Сайта.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              4. Цели обработки данных
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              Персональные данные используются для:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Предоставления доступа к образовательным материалам и услугам</li>
              <li style={{ marginBottom: '10px' }}>Связи с пользователем по вопросам обучения</li>
              <li style={{ marginBottom: '10px' }}>Улучшения качества образовательных услуг</li>
              <li style={{ marginBottom: '10px' }}>Информирования о новых курсах и акциях (с согласия пользователя)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              5. Защита данных
            </h2>
            <p style={{ opacity: 0.9 }}>
              Мы применяем технические и организационные меры безопасности для защиты персональных данных от
              несанкционированного доступа, изменения, раскрытия или уничтожения. Доступ к персональным данным имеют
              только уполномоченные сотрудники, которые обязаны соблюдать конфиденциальность.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              6. Права пользователей
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              Вы имеете право:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Получать информацию о своих персональных данных</li>
              <li style={{ marginBottom: '10px' }}>Требовать исправления неточных данных</li>
              <li style={{ marginBottom: '10px' }}>Требовать удаления ваших персональных данных</li>
              <li style={{ marginBottom: '10px' }}>Отозвать согласие на обработку персональных данных</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              7. Третьи стороны
            </h2>
            <p style={{ opacity: 0.9 }}>
              Мы не передаем персональные данные третьим лицам без вашего согласия, за исключением случаев,
              предусмотренных законодательством, или когда это необходимо для предоставления образовательных услуг
              (например, платежные системы для обработки оплаты курсов).
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              8. Изменения политики
            </h2>
            <p style={{ opacity: 0.9 }}>
              Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.
              Актуальная версия всегда доступна на данной странице. Дата последнего обновления: 26 декабря 2024 года.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600
            }}>
              9. Контактная информация
            </h2>
            <p style={{ opacity: 0.9 }}>
              По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам через форму
              обратной связи на Сайте или по email, указанному в разделе "Контакты".
            </p>
          </section>

          <div style={{
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '1px solid rgba(0, 255, 249, 0.3)',
            textAlign: 'center'
          }}>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#0a0a1e',
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 0 20px rgba(0, 255, 249, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
