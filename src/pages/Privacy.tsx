import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const SEO = {
  title: 'Политика конфиденциальности | Vibecoding',
  description: 'Политика конфиденциальности Vibecoding. Как мы защищаем персональные данные в соответствии с Законом РБ «О защите персональных данных». Cookies, права пользователей, безопасность.',
  keywords: 'политика конфиденциальности Vibecoding, защита данных, персональные данные Vibecoding'
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

  const sectionHeadingStyle = {
    fontSize: '24px',
    marginBottom: '20px',
    color: 'var(--neon-cyan)',
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 600,
  } as const;

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
            <h2 style={sectionHeadingStyle}>
              1. Общие положения
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              1.1. Настоящая Политика конфиденциальности (далее — Политика) определяет порядок
              сбора, обработки и защиты персональных данных пользователей сайта vibecoding.by
              (далее — Сайт).
            </p>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              1.2. Политика разработана в соответствии с Законом Республики Беларусь
              от 07.05.2021 №99-З «О защите персональных данных» (далее — Закон) и иными
              нормативными правовыми актами Республики Беларусь.
            </p>
            <p style={{ opacity: 0.9 }}>
              1.3. Использование Сайта означает безоговорочное согласие пользователя с настоящей
              Политикой и указанными в ней условиями обработки его персональных данных.
              В случае несогласия с Политикой пользователь должен прекратить использование Сайта.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              2. Оператор персональных данных
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              2.1. Оператором персональных данных является Орлов Дмитрий Дмитриевич,
              самозанятое физическое лицо, плательщик налога на профессиональный доход,
              оказывающий услуги по обучению работе с персональным компьютером
              и программным обеспечением под брендом «Vibecoding».
            </p>
            <p style={{ opacity: 0.9 }}>
              2.2. Контактные данные оператора для обращений по вопросам персональных данных:
              email — info@vibecoding.by, телефон — +375 (29) 282-88-78.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              3. Собираемые персональные данные
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              3.1. Мы собираем и обрабатываем следующие персональные данные:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Имя и контактная информация (email, телефон) — при регистрации, оформлении заявки на обучение</li>
              <li style={{ marginBottom: '10px' }}>Данные об использовании Сайта (IP-адрес, тип и версия браузера, время посещения, просмотренные страницы) — автоматически</li>
              <li style={{ marginBottom: '10px' }}>Информация, предоставленная добровольно через формы обратной связи</li>
              <li style={{ marginBottom: '10px' }}>Данные об оплате — при совершении платежей (обрабатываются платёжными системами)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              4. Основания и цели обработки данных
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              4.1. Правовые основания обработки персональных данных (статья 4 Закона):
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Согласие субъекта персональных данных</li>
              <li style={{ marginBottom: '10px' }}>Исполнение договора, стороной которого является субъект (договор оферты)</li>
              <li style={{ marginBottom: '10px' }}>Законные интересы оператора (обеспечение безопасности Сайта)</li>
            </ul>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              4.2. Цели обработки:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Предоставление доступа к учебным материалам и Услугам</li>
              <li style={{ marginBottom: '10px' }}>Связь с пользователем по вопросам обучения и поддержки</li>
              <li style={{ marginBottom: '10px' }}>Исполнение обязательств по договору оферты</li>
              <li style={{ marginBottom: '10px' }}>Улучшение качества Услуг и работы Сайта</li>
              <li style={{ marginBottom: '10px' }}>Информирование о новых курсах и акциях (с согласия пользователя)</li>
              <li style={{ marginBottom: '10px' }}>Обеспечение безопасности и предотвращение мошенничества</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              5. Использование cookies
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              5.1. Сайт использует файлы cookie для:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Обеспечения корректной работы функциональности Сайта (авторизация, сохранение сессии)</li>
              <li style={{ marginBottom: '10px' }}>Анализа использования Сайта и улучшения пользовательского опыта</li>
              <li style={{ marginBottom: '10px' }}>Сохранения пользовательских настроек и предпочтений</li>
            </ul>
            <p style={{ marginTop: '15px', opacity: 0.9 }}>
              5.2. Вы можете отключить использование cookies в настройках своего браузера,
              однако это может повлиять на работу Сайта.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              6. Защита данных
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              6.1. Мы применяем технические и организационные меры безопасности для защиты
              персональных данных от несанкционированного доступа, изменения, раскрытия
              или уничтожения в соответствии с требованиями Закона.
            </p>
            <p style={{ opacity: 0.9 }}>
              6.2. Передача данных между браузером и сервером осуществляется по защищённому
              протоколу HTTPS. Доступ к персональным данным имеет исключительно оператор.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              7. Передача данных третьим лицам и трансграничная передача
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              7.1. Мы не передаём персональные данные третьим лицам без вашего согласия,
              за исключением случаев, предусмотренных законодательством Республики Беларусь.
            </p>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              7.2. Для обеспечения работы Сайта мы используем сервисы, серверы которых могут
              находиться за пределами Республики Беларусь (хостинг, база данных, платёжные системы).
              Трансграничная передача персональных данных осуществляется в соответствии
              со статьёй 8 Закона и при условии обеспечения надлежащего уровня защиты данных.
            </p>
            <p style={{ opacity: 0.9 }}>
              7.3. Передача данных платёжным системам для обработки оплаты курсов осуществляется
              в объёме, необходимом для выполнения платёжной операции.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              8. Сроки хранения данных
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              8.1. Персональные данные хранятся в течение срока действия договора оферты
              и 3 (трёх) лет после его прекращения (срок исковой давности по ГК РБ).
            </p>
            <p style={{ opacity: 0.9 }}>
              8.2. Данные об использовании Сайта (логи, cookies) хранятся не более 1 (одного) года.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              9. Права пользователей
            </h2>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>
              9.1. В соответствии со статьёй 11 Закона Республики Беларусь «О защите персональных
              данных» вы имеете право:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Получать информацию об обработке своих персональных данных</li>
              <li style={{ marginBottom: '10px' }}>Требовать внесения изменений в персональные данные, если они являются неполными, устаревшими или неточными</li>
              <li style={{ marginBottom: '10px' }}>Требовать прекращения обработки персональных данных, в том числе их удаления</li>
              <li style={{ marginBottom: '10px' }}>Отозвать согласие на обработку персональных данных</li>
              <li style={{ marginBottom: '10px' }}>Обжаловать действия (бездействие) оператора, связанные с обработкой персональных данных</li>
            </ul>
            <p style={{ marginTop: '15px', opacity: 0.9 }}>
              9.2. Для реализации указанных прав направьте запрос на email: info@vibecoding.by.
              Срок рассмотрения обращения — 15 календарных дней с момента получения запроса
              (статья 14 Закона).
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={sectionHeadingStyle}>
              10. Изменения политики
            </h2>
            <p style={{ opacity: 0.9 }}>
              10.1. Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.
              Актуальная версия всегда доступна на данной странице.
              Дата последнего обновления: 28 февраля 2026 года.
            </p>
          </section>

          <section>
            <h2 style={sectionHeadingStyle}>
              11. Контактная информация
            </h2>
            <p style={{ marginBottom: '10px', opacity: 0.9 }}>
              По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться:
            </p>
            <ul style={{ marginLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>Email: info@vibecoding.by</li>
              <li style={{ marginBottom: '10px' }}>Телефон: +375 (29) 282-88-78</li>
              <li style={{ marginBottom: '10px' }}>Через форму обратной связи на Сайте</li>
            </ul>
            <p style={{ marginTop: '15px', opacity: 0.9 }}>
              Вы также вправе обратиться в Национальный центр защиты персональных данных
              Республики Беларусь (cpd.by) в случае нарушения ваших прав при обработке
              персональных данных.
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
