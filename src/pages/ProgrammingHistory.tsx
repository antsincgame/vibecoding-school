import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const fullTimeline = [
  { year: '100 до н.э.', event: 'Антикитерский механизм', desc: '82 шестеренки предсказывают звезды. Первый компьютер человечества.', color: 'gold' },
  { year: '1804', event: 'Жаккар: Перфокарты', desc: 'Joseph Marie Jacquard изобретает первую программируемую машину для ткацких станков.', color: 'cyan' },
  { year: '1843', event: 'Ada Lovelace: Первая программа', desc: 'Первый программист в истории. Алгоритм для чисел Бернулли. Язык Ada (1983) назван в её честь.', color: 'pink' },
  { year: '1912-1914', event: 'Torres Quevedo: El Ajedrecista', desc: 'Первая машина, которая сама принимает решения. Автоматический шахматный игрок.', color: 'green' },
  { year: '1930', event: 'Vannevar Bush: Differential Analyzer', desc: 'Первый аналоговый компьютер XX века. Автоматически решал дифференциальные уравнения.', color: 'cyan' },
  { year: '1942', event: 'Hedy Lamarr: Frequency Hopping', desc: 'Актриса + изобретательница. Патент US 2,292,387. Основа для Wi-Fi, Bluetooth, GPS.', color: 'pink' },
  { year: '1952', event: 'Grace Hopper: Первый компилятор', desc: 'A-0 компилятор. Машина пишет машинный код автоматически. COBOL, FORTRAN.', color: 'gold' },
  { year: '1957', event: 'FORTRAN', desc: 'FORmula TRANslating system. Первый коммерчески успешный язык высокого уровня.', color: 'green' },
  { year: '1996', event: 'IntelliSense (VB 5.0)', desc: 'Microsoft Visual Basic 5.0. Первое "умное" автодополнение в IDE.', color: 'cyan' },
  { year: '2018-2019', event: 'TabNine', desc: 'Первый AI-ассистент на GPT-2. Автодополнение целых функций.', color: 'pink' },
  { year: '2021', event: 'GitHub Copilot', desc: 'OpenAI Codex. 12 млрд параметров. 37% задач с первого раза.', color: 'gold' },
  { year: '2022', event: 'ChatGPT', desc: '30 ноября 2022. 100M пользователей за 2 месяца. Генерация целых приложений.', color: 'green' },
  { year: '2023-2024', event: 'Cursor, Claude Artifacts', desc: 'AI пишет целые проекты. GPT-4 + Claude в IDE.', color: 'cyan' },
  { year: '2025', event: 'Термин "Вайбкодинг"', desc: 'Andrej Karpathy, 3 февраля 2025. Название для 2000-летней идеи.', color: 'pink' },
];

const antikytheraSpecs = [
  { label: 'Количество шестеренок', value: '37-82', detail: '27 идентифицированных, 10+ выведено математически' },
  { label: 'Материал', value: 'Бронза', detail: 'Олово и медь, типичный сплав для эллинистического периода' },
  { label: 'Дата создания', value: '100-50 до н.э.', detail: 'I век до нашей эры, эллинистическая Греция' },
  { label: 'Размеры', value: '180 x 150 мм', detail: 'Главный фрагмент, размер современного ноутбука' },
  { label: 'Способ работы', value: 'Ручной кривошип', detail: 'Поворот ручки + система зубчатых передач' },
  { label: 'Фрагментов найдено', value: '82 куска', detail: '7 из них механически значимых' },
];

const antikytheraCapabilities = [
  {
    category: 'ПРЕДСКАЗАНИЕ ЗАТМЕНИЙ',
    items: [
      { name: 'Цикл Сарос (18 лет 11 дней)', desc: 'Предсказание солнечных и лунных затмений. Через каждые 18 лет затмения повторяются в том же порядке.', detail: 'Применение: предсказание дат затмений за десятилетия вперед' },
      { name: 'Цикл Экселигмос (54 года)', desc: 'Расширение Сарос цикла (3 x Saros). Затмения происходят в одном и том же географическом месте.', detail: 'Точность: через 54 года затмение вернется на ту же широту' },
      { name: 'Метонический цикл (19 лет)', desc: 'Фазы Луны повторяются на те же дни года через 19 лет. Спираль на задней панели с 235 ячейками (лунные месяцы).', detail: 'Применение: синхронизация лунного и солнечного календарей' },
    ],
    color: 'gold',
  },
  {
    category: 'ОТСЛЕЖИВАНИЕ ЛУНЫ',
    items: [
      { name: 'Лунные фазы', desc: 'Половинка бронзовой сферы (черная и белая). Система дифференциального привода, вращающая сферу.', detail: 'Точность: период синодического месяца = 29.53 дня. Современное значение: 29.530589 дней. Ошибка менее 0.001%!' },
      { name: 'Аномалистический месяц', desc: 'Луна движется быстрее в перигее (ближе к Земле), медленнее в апогее.', detail: 'Решение: механизм штифт-паз (pin-and-slot). Один зубец входит в паз другого, изменяя радиус вращения.' },
    ],
    color: 'cyan',
  },
  {
    category: 'ОТСЛЕЖИВАНИЕ СОЛНЦА',
    items: [
      { name: 'Положение в Зодиаке', desc: 'Движение Солнца через 12 знаков зодиака. На циферблате: 365-дневный год.', detail: 'Удивительная точность для того времени!' },
      { name: 'Солнечная аномалия', desc: 'Земля не движется с одинаковой скоростью вокруг Солнца.', detail: 'Решение: система из 3 шестерен с эксцентрическим приводом.' },
      { name: 'Солнцестояния и равноденствия', desc: 'Дни летнего и зимнего солнцестояния, весеннего и осеннего равноденствия.', detail: 'Критические дни для земледелия, религиозных обрядов, календаря' },
    ],
    color: 'orange',
  },
  {
    category: 'ОТСЛЕЖИВАНИЕ ПЛАНЕТ',
    items: [
      { name: '5 классических планет', desc: 'Меркурий, Венера, Марс, Юпитер, Сатурн - все видимые невооруженным глазом планеты.', detail: 'Механизм отслеживал положение каждой планеты на небесной сфере' },
      { name: 'Синодические циклы', desc: 'Венера: 462 года. Сатурн: 442 года.', detail: 'Маркировки на корпусе: инструкции на задней крышке для расчета' },
      { name: 'Восхождения звезд (Heliacal Rising)', desc: 'Когда звезды появляются и исчезают на горизонте.', detail: 'Критически важно для древней навигации' },
    ],
    color: 'pink',
  },
  {
    category: 'КАЛЕНДАРЬ И ОЛИМПИЙСКИЕ ИГРЫ',
    items: [
      { name: 'Египетский календарь', desc: 'Указатель даты на передней панели. 365 дней на кольцевом диске.', detail: 'Практичный календарь для повседневного использования' },
      { name: 'Олимпийский цикл (4 года)', desc: 'Вспомогательный циферблат на задней панели. Панеллинские игры.', detail: 'Спортивные и религиозные мероприятия всей Греции' },
    ],
    color: 'green',
  },
  {
    category: 'КОСМИЧЕСКИЙ ПОРЯДОК',
    items: [
      { name: 'Греческий космос', desc: 'Кольцо из дисков, отображающее древнегреческое понимание устройства космоса.', detail: 'Планетарные кольца с индексными буквами (Front Cover Inscriptions - FCI)' },
      { name: 'Концентрические кольца', desc: 'Все планеты одновременно на системе концентрических колец.', detail: 'Механическая модель геоцентрической вселенной Птолемея' },
    ],
    color: 'cyan',
  },
];

const researchHistory = [
  { year: '1901', event: 'Обнаружение', desc: 'Ныряльщики за губками находят обломки древнего корабля у острова Антикитера.' },
  { year: '1902', event: 'Первое изучение', desc: 'Археолог Валериос Стаис замечает шестеренку. Находку считают простыми часами.' },
  { year: '1951', event: 'Первая реконструкция', desc: 'Дерек Прайс начинает серьезное исследование. Гипотеза о вычислительном устройстве.' },
  { year: '1974', event: 'Публикация Прайса', desc: 'Монография "Gears from the Greeks". Мир узнает о сложности механизма.' },
  { year: '2005', event: 'CT-сканирование', desc: 'Прорыв! Рентгеновская томография. Обнаружено более 3000 символов надписей.' },
  { year: '2006', event: 'Расшифровка', desc: 'Публикация в Nature. Подтверждено: полноценный аналоговый компьютер.' },
  { year: '2021', event: 'Полная модель', desc: 'UCL публикует первую полную гипотетическую модель всех шестеренок.' },
];

const pioneers = [
  {
    id: 'jacquard',
    year: '1804',
    name: 'Joseph Marie Jacquard',
    title: 'Изобретатель перфокарт',
    image: '/joseph-marie-jacquard-1752-1834-french-inventor-loom-weaving-550nw-5850855oh.jpg',
    story: 'Французский ткач, который революционизировал текстильную промышленность. Его механизм позволял ткацкому станку автоматически создавать сложные узоры по программе, записанной на перфокартах.',
    achievement: 'Первая программируемая машина после Антикитерского механизма',
    legacy: 'Перфокарты Жаккара вдохновили Чарльза Бэббиджа и использовались в компьютерах до 1970-х годов.',
    quote: '"Машина автоматически ткала сложные узоры - швея говорит машине ЧТО делать через карты"',
    facts: ['Перфокарты из дерева с отверстиями', 'Нити поднимались автоматически', 'Первая "программируемая" машина'],
    color: 'cyan',
  },
  {
    id: 'ada',
    year: '1843',
    name: 'Ada Lovelace',
    title: 'Первый программист в истории',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/440px-Ada_Lovelace_portrait.jpg',
    story: 'Дочь поэта Байрона. Работала с Чарльзом Бэббиджем над Analytical Engine. Написала первый в истории алгоритм, предназначенный для выполнения машиной - вычисление чисел Бернулли.',
    achievement: 'Первая компьютерная программа в истории человечества',
    legacy: 'Язык программирования Ada (1983) назван в её честь. День Ады Лавлейс отмечается ежегодно.',
    quote: '"The Analytical Engine weaves algebraic patterns, just as the Jacquard loom weaves flowers and leaves"',
    facts: ['Алгоритм для чисел Бернулли', 'Предсказала будущее компьютеров', 'Поняла универсальность машины'],
    color: 'pink',
  },
  {
    id: 'torres',
    year: '1912-1914',
    name: 'Leonardo Torres Quevedo',
    title: 'Создатель первой "думающей" машины',
    image: '/image%20copy%20copy%20copy%20copy%20copy%20copy%20copy.png',
    story: 'Испанский инженер, создавший "El Ajedrecista" - автоматического шахматного игрока. Это была первая машина, которая сама принимала решения на основе логики, а не просто выполняла заранее запрограммированные действия.',
    achievement: 'Первая машина с искусственным интеллектом',
    legacy: 'Показал, что машины могут "думать" и принимать решения. Предтеча всех современных AI-систем.',
    quote: '"Как Антикитера решала, где будут планеты, теперь машина решает, какой ход лучше"',
    facts: ['Автоматически делал ходы в шахматах', 'Сам выбирал лучший ход', 'Машина "думала" о ходах'],
    color: 'green',
  },
  {
    id: 'bush',
    year: '1930',
    name: 'Vannevar Bush',
    title: 'Создатель Differential Analyzer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Vannevar_Bush_portrait.jpg/440px-Vannevar_Bush_portrait.jpg',
    story: 'Американский инженер из MIT, создавший первый аналоговый компьютер XX века. Огромная машина с шестернями и трубками автоматически решала дифференциальные уравнения.',
    achievement: 'Первый практический аналоговый компьютер',
    legacy: 'Позже предложил концепцию Memex - прообраз гипертекста и World Wide Web.',
    quote: '"Машина автоматически решала дифференциальные уравнения - задачи, на которые математикам требовались недели"',
    facts: ['Огромная машина с шестернями', 'Автоматическое решение уравнений', 'Прообраз современных компьютеров'],
    color: 'cyan',
  },
  {
    id: 'hedy',
    year: '1942',
    name: 'Hedy Lamarr',
    title: 'Мать Wi-Fi, Bluetooth и GPS',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Hedy_Lamarr_Publicity_Photo_for_The_Heavenly_Body_1944.jpg/440px-Hedy_Lamarr_Publicity_Photo_for_The_Heavenly_Body_1944.jpg',
    story: 'Голливудская актриса 1940-х, которую называли "самой красивой женщиной в мире". Днём снималась в фильмах, ночью изобретала оружие. Вместе с композитором George Antheil создала систему Frequency Hopping Spread Spectrum.',
    achievement: 'Патент US 2,292,387 на систему управления торпедами',
    legacy: 'Технология стала основой для Wi-Fi, Bluetooth, GPS, 4G/5G. Pioneer Award в 83 года (1997).',
    quote: '"88 частот = 88 клавиш пианино. Вдохновение пришло от автоматического пианино!"',
    facts: ['Frequency Hopping Spread Spectrum', 'Армия не использовала до 1962 года', '88 частот для шифрования'],
    color: 'pink',
  },
  {
    id: 'hopper',
    year: '1952',
    name: 'Grace Murray Hopper',
    title: 'Мать компиляторов',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg/440px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg',
    story: 'Адмирал ВМС США, создавшая первый компилятор A-0. Революционная идея: машина АВТОМАТИЧЕСКИ переводит код с человеческого языка в машинный. До неё программисты писали в машинных кодах вручную.',
    achievement: 'Первый компилятор в истории (A-0, 1952)',
    legacy: 'COBOL (1960), FORTRAN. Миллионы программ до сих пор работают на языках, которые она помогла создать.',
    quote: '"Компилятор - это перевод. Из языка человека в язык машины."',
    facts: ['A-0 компилятор', 'COBOL для бизнеса', 'FORTRAN для науки'],
    color: 'gold',
  },
];

const aiEvolution = [
  {
    year: '2018-2019',
    name: 'TabNine',
    desc: 'Первый AI-ассистент на GPT-2. Автодополнение целых функций, а не просто слов.',
    tech: 'GPT-2, обучен на GitHub',
    color: 'gold',
  },
  {
    year: '2018-2020',
    name: 'Microsoft IntelliCode',
    desc: 'AI-предсказания в IntelliSense. Звездочка возле самых вероятных методов.',
    tech: 'Deep Learning на GitHub репозиториях',
    color: 'cyan',
  },
  {
    year: 'Август 2021',
    name: 'OpenAI Codex',
    desc: '12 млрд параметров. 159 GB кода GitHub. 37% задач решал с первого раза.',
    tech: 'GPT-3 + 159 GB кода',
    color: 'pink',
  },
  {
    year: 'Июнь 2021 - Июнь 2022',
    name: 'GitHub Copilot',
    desc: 'Первый коммерческий AI-ассистент. $10/месяц за автоматизацию кода.',
    tech: 'OpenAI Codex',
    color: 'green',
  },
  {
    year: '30 ноября 2022',
    name: 'ChatGPT',
    desc: '100M пользователей за 2 месяца. Не просто дополнение - полное создание с нуля.',
    tech: 'GPT-3.5, затем GPT-4',
    color: 'gold',
  },
  {
    year: '2023',
    name: 'Cursor IDE',
    desc: 'Форк VS Code + GPT-4. Весь IDE с интегрированным AI.',
    tech: 'GPT-4, Claude',
    color: 'cyan',
  },
  {
    year: '2024',
    name: 'Claude Artifacts',
    desc: 'AI создает интерактивные приложения прямо в чате.',
    tech: 'Claude 3, Claude 3.5',
    color: 'pink',
  },
  {
    year: '2024',
    name: 'Devin, Windsurf',
    desc: 'AI-агенты, которые сами пишут, тестируют и деплоят код.',
    tech: 'Agentic AI',
    color: 'green',
  },
  {
    year: '3 февраля 2025',
    name: 'Термин "Вайбкодинг"',
    desc: 'Андрей Карпатый (ex-Tesla, ex-OpenAI) дает имя 2000-летней идее.',
    tech: 'Культурный феномен',
    color: 'gold',
  },
];

function FloatingParticles() {
  return (
    <div className="history-particles">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="history-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

function AntikytheraSection() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <section className="antikythera-section">
      <div className="antikythera-bg" />
      <div className="antikythera-container">
        <div className="antikythera-header">
          <span className="antikythera-badge">ПЕРВЫЙ КОМПЬЮТЕР ЧЕЛОВЕЧЕСТВА</span>
          <h2 className="antikythera-title">Антикитерский механизм</h2>
          <p className="antikythera-subtitle">100 год до нашей эры - 2000 лет до электричества</p>
        </div>

        <div className="antikythera-main">
          <div className="antikythera-image-block">
            <div className="antikythera-image-frame">
              <img
                src="/image%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy.png"
                alt="Антикитерский механизм - древний аналоговый компьютер"
                className="antikythera-image"
              />
              <div className="antikythera-image-overlay" />
            </div>
            <div className="antikythera-specs-grid">
              {antikytheraSpecs.map((spec, index) => (
                <div key={index} className="antikythera-spec-card">
                  <span className="antikythera-spec-value">{spec.value}</span>
                  <span className="antikythera-spec-label">{spec.label}</span>
                  <span className="antikythera-spec-detail">{spec.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="antikythera-content">
            <p className="antikythera-text">
              В <strong>1901 году</strong> ныряльщики у острова Антикитера обнаружили обломки древнего корабля.
              Среди амфор и статуй лежал покрытый коррозией механизм - <strong>82 фрагмента бронзы</strong>,
              которые 100 лет считали простыми астрономическими часами.
            </p>
            <p className="antikythera-text">
              Только <strong>CT-сканирование в 2005 году</strong> раскрыло правду: это был
              <strong> аналоговый компьютер</strong>, созданный за 2000 лет до изобретения электричества.
              Исследователи обнаружили более <strong>3000 символов</strong> надписей, скрытых под коркой морской соли.
            </p>
            <p className="antikythera-text">
              Поворотом ручки древний грек мог узнать положение Солнца, Луны и пяти планет
              на любую дату - в прошлом или будущем. Механизм предсказывал затмения на
              <strong> 54 года вперед</strong> и рассчитывал даты Олимпийских игр.
            </p>
            <div className="antikythera-definition">
              <div className="antikythera-definition-icon">?</div>
              <div>
                <strong>Почему это компьютер?</strong>
                <p><strong>Определение:</strong> "Устройство, которое принимает входные данные, обрабатывает информацию и выводит результаты"</p>
                <ul className="antikythera-definition-list">
                  <li><strong>Вход:</strong> поворот ручки (кривошипа) на определенную дату</li>
                  <li><strong>Обработка:</strong> система 37+ шестерен с разными передаточными числами</li>
                  <li><strong>Выход:</strong> положение Солнца, Луны, 5 планет, фазы, затмения на циферблатах</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="antikythera-precision">
          <h3 className="antikythera-precision-title">Невероятная точность</h3>
          <div className="antikythera-precision-grid">
            <div className="antikythera-precision-card">
              <span className="antikythera-precision-value">29.53</span>
              <span className="antikythera-precision-label">дня - расчет механизма</span>
              <span className="antikythera-precision-detail">Лунный (синодический) месяц</span>
            </div>
            <div className="antikythera-precision-card">
              <span className="antikythera-precision-value">29.530589</span>
              <span className="antikythera-precision-label">дней - реальное значение</span>
              <span className="antikythera-precision-detail">Современные измерения</span>
            </div>
            <div className="antikythera-precision-card antikythera-precision-highlight">
              <span className="antikythera-precision-value">&lt;0.001%</span>
              <span className="antikythera-precision-label">ошибка</span>
              <span className="antikythera-precision-detail">Такая точность была недостижима до XVII века!</span>
            </div>
          </div>
          <p className="antikythera-precision-note">
            <strong>Гиппарх Родосский (II век до н.э.)</strong> изучал лунную аномалию.
            Древние греки измерили неравномерность движения Луны. Такая точность была недостижима
            до изобретения телескопов и открытия законов Кеплера в XVII веке.
          </p>
        </div>

        <div className="antikythera-capabilities">
          <h3 className="antikythera-capabilities-title">Полный список возможностей</h3>
          <div className="antikythera-categories">
            {antikytheraCapabilities.map((cat, catIndex) => (
              <div
                key={catIndex}
                className={`antikythera-category antikythera-category-${cat.color} ${activeCategory === catIndex ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === catIndex ? null : catIndex)}
              >
                <div className="antikythera-category-header">
                  <span className="antikythera-category-number">{String(catIndex + 1).padStart(2, '0')}</span>
                  <h4 className="antikythera-category-title">{cat.category}</h4>
                  <span className="antikythera-category-toggle">{activeCategory === catIndex ? '-' : '+'}</span>
                </div>
                {activeCategory === catIndex && (
                  <div className="antikythera-category-content">
                    {cat.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="antikythera-item">
                        <strong className="antikythera-item-name">{item.name}</strong>
                        <p className="antikythera-item-desc">{item.desc}</p>
                        <p className="antikythera-item-detail">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="antikythera-research">
          <h3 className="antikythera-research-title">История исследования</h3>
          <div className="antikythera-timeline">
            {researchHistory.map((item, index) => (
              <div key={index} className="antikythera-timeline-item">
                <span className="antikythera-timeline-year">{item.year}</span>
                <div className="antikythera-timeline-content">
                  <strong>{item.event}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="antikythera-lesson">
          <div className="antikythera-lesson-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <strong>1700 ЛЕТ МОЛЧАНИЯ</strong>
            <p>После Антикитерского механизма человечество не создавало ничего столь сложного
            <strong> 1700 лет</strong> - до механических часов XIV века. Технологии могут быть
            утеряны на тысячелетия. Это был не просто механизм - это был <strong>компьютер, который вычислял космос</strong>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PioneersSection() {
  const [activePioneer, setActivePioneer] = useState<string | null>(null);

  return (
    <section className="pioneers-section">
      <div className="pioneers-bg" />
      <div className="pioneers-container">
        <div className="pioneers-header">
          <span className="pioneers-badge">ГИГАНТЫ, НА ПЛЕЧАХ КОТОРЫХ МЫ СТОИМ</span>
          <h2 className="pioneers-title">Пионеры автоматизации</h2>
          <p className="pioneers-subtitle">От перфокарт Жаккара до компиляторов Хоппер: 6 революционеров за 150 лет</p>
        </div>

        <div className="pioneers-grid">
          {pioneers.map((pioneer) => (
            <div
              key={pioneer.id}
              className={`pioneer-card pioneer-color-${pioneer.color} ${activePioneer === pioneer.id ? 'pioneer-active' : ''}`}
              onMouseEnter={() => setActivePioneer(pioneer.id)}
              onMouseLeave={() => setActivePioneer(null)}
            >
              <div className="pioneer-image-container">
                <img src={pioneer.image} alt={pioneer.name} className="pioneer-image" loading="lazy" />
                <div className="pioneer-image-overlay" />
                <span className="pioneer-year">{pioneer.year}</span>
              </div>

              <div className="pioneer-content">
                <h3 className="pioneer-name">{pioneer.name}</h3>
                <span className="pioneer-title">{pioneer.title}</span>

                <p className="pioneer-story">{pioneer.story}</p>

                <div className="pioneer-achievement">
                  <strong>Достижение:</strong>
                  <p>{pioneer.achievement}</p>
                </div>

                <blockquote className="pioneer-quote">"{pioneer.quote}"</blockquote>

                <div className="pioneer-facts">
                  {pioneer.facts.map((fact, index) => (
                    <span key={index} className="pioneer-fact">{fact}</span>
                  ))}
                </div>

                <div className="pioneer-legacy">
                  <strong>Наследие:</strong>
                  <p>{pioneer.legacy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pioneers-insight">
          <div className="pioneers-insight-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <p>
            <strong>Обратите внимание:</strong> Три из шести пионеров - женщины. Ada Lovelace, Hedy Lamarr и Grace Hopper
            внесли фундаментальный вклад в историю вычислительной техники. Программирование, Wi-Fi и компиляторы -
            все это изобретения женщин.
          </p>
        </div>
      </div>
    </section>
  );
}

function AIEvolutionSection() {
  return (
    <section className="ai-evolution-section">
      <div className="ai-evolution-bg" />
      <div className="ai-evolution-container">
        <div className="ai-evolution-header">
          <span className="ai-evolution-badge">ОТ GPT-2 К ВАЙБКОДИНГУ</span>
          <h2 className="ai-evolution-title">Эволюция AI-ассистентов</h2>
          <p className="ai-evolution-subtitle">7 лет революции: 2018-2025</p>
        </div>

        <div className="ai-evolution-intro">
          <p>
            <strong>Код писал себя ДО вайбкодинга.</strong> Термин появился 3 февраля 2025 года,
            но инструменты работали с 2018 года. Это не новая идея - это идея, которой 2000 лет.
            Андрей Карпатый просто дал ей имя.
          </p>
        </div>

        <div className="ai-evolution-timeline">
          {aiEvolution.map((item, index) => (
            <div key={index} className={`ai-evolution-item ai-evolution-color-${item.color}`}>
              <div className="ai-evolution-marker">
                <span className="ai-evolution-year">{item.year}</span>
              </div>
              <div className="ai-evolution-content">
                <h3 className="ai-evolution-name">{item.name}</h3>
                <p className="ai-evolution-desc">{item.desc}</p>
                <span className="ai-evolution-tech">{item.tech}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-evolution-karpathy">
          <div className="karpathy-portrait">
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Andrej Karpathy"
              className="karpathy-image"
            />
          </div>
          <div className="karpathy-content">
            <span className="karpathy-date">3 февраля 2025</span>
            <h3 className="karpathy-name">Andrej Karpathy</h3>
            <span className="karpathy-title">ex-Tesla AI Director, ex-OpenAI</span>
            <blockquote className="karpathy-quote">
              "Vibe Coding" - термин для стиля программирования, где ты описываешь задачу на естественном языке,
              а AI пишет код за тебя. Ты направляешь, AI реализует.
            </blockquote>
            <p className="karpathy-insight">
              <strong>Ключевой инсайт:</strong> Карпатый не изобрел концепцию - он назвал то, что существовало
              2000 лет. Как Стив Джобс не изобрел смартфон, но дал ему имя "iPhone".
            </p>
          </div>
        </div>

        <div className="ai-evolution-comparison">
          <h3 className="ai-comparison-title">Сравнение эпох</h3>
          <div className="ai-comparison-grid">
            <div className="ai-comparison-card">
              <span className="ai-comparison-year">2015</span>
              <span className="ai-comparison-label">Программист пишет ВСЁ сам</span>
              <p>Медленно, строка за строкой. Монотонный звук печати клавиатуры.</p>
            </div>
            <div className="ai-comparison-card ai-comparison-modern">
              <span className="ai-comparison-year">2024+</span>
              <span className="ai-comparison-label">Опиши, что нужно - AI напишет за 2 секунды</span>
              <p>Курсор просто скользит по уже написанному коду. Волшебный звук "ding".</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FullTimelineSection() {
  return (
    <section className="full-timeline-section">
      <div className="full-timeline-bg" />
      <div className="full-timeline-container">
        <div className="full-timeline-header">
          <span className="full-timeline-badge">2000+ ЛЕТ ИСТОРИИ</span>
          <h2 className="full-timeline-title">Полная хронология</h2>
          <p className="full-timeline-subtitle">От Антикитеры до вайбкодинга: одна идея через тысячелетия</p>
        </div>

        <div className="full-timeline-visual">
          {fullTimeline.map((item, index) => (
            <div key={index} className={`full-timeline-item full-timeline-color-${item.color}`}>
              <div className="full-timeline-node" />
              <div className="full-timeline-card">
                <span className="full-timeline-year">{item.year}</span>
                <h3 className="full-timeline-event">{item.event}</h3>
                <p className="full-timeline-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="full-timeline-conclusion">
          <div className="full-timeline-conclusion-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3>ОДНА ИДЕЯ: ДАТЬ МАШИНЕ ИНСТРУКЦИИ</h3>
            <p>
              От Антикитеры, которая считала орбиты планет 2000 лет назад, к ChatGPT, который пишет код сегодня.
              От механизма с 82 шестернями к нейросетям с миллиардами параметров.
              <strong> Технология автоматического "программирования" существовала 2000 лет. Термин - несколько месяцев.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProgrammingHistory() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.title = 'История программирования | От Антикитерского механизма до вайбкодинга - 2000 лет автоматизации';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Полная история программирования за 2000 лет: Антикитерский механизм (100 до н.э.), Жаккар (1804), Ada Lovelace (1843), Hedy Lamarr (1942), Grace Hopper (1952), TabNine (2018), GitHub Copilot (2021), ChatGPT (2022), Cursor (2023), вайбкодинг Андрея Карпатого (2025).');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'история программирования, антикитерский механизм, первый компьютер, вайбкодинг, Андрей Карпатый, Ada Lovelace, Grace Hopper, Hedy Lamarr Wi-Fi, Joseph Marie Jacquard, Torres Quevedo, Vannevar Bush, TabNine, GitHub Copilot, ChatGPT, Cursor IDE, AI программирование, история автоматизации, цикл Сарос, Метонический цикл, перфокарты');
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="history-page">
      <div
        className="history-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />
      <FloatingParticles />

      <section className="history-hero">
        <div className="history-hero-overlay" />
        <div className="history-hero-content">
          <Link to="/" className="history-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            На главную
          </Link>

          <h1 className="history-title">
            <span className="history-title-main glitch" data-text="КОД ПИСАЛ СЕБЯ">КОД ПИСАЛ СЕБЯ</span>
            <span className="history-title-sub">2000+ ЛЕТ</span>
          </h1>

          <p className="history-subtitle">
            От бронзовых шестеренок Антикитеры до нейросетей ChatGPT: полная история автоматизации
          </p>

          <div className="history-hero-stats">
            <div className="history-hero-stat">
              <span className="history-hero-stat-value">2000+</span>
              <span className="history-hero-stat-label">лет истории</span>
            </div>
            <div className="history-hero-stat">
              <span className="history-hero-stat-value">6</span>
              <span className="history-hero-stat-label">великих пионеров</span>
            </div>
            <div className="history-hero-stat">
              <span className="history-hero-stat-value">82</span>
              <span className="history-hero-stat-label">шестерни первого компьютера</span>
            </div>
            <div className="history-hero-stat">
              <span className="history-hero-stat-value">1</span>
              <span className="history-hero-stat-label">термин в 2025</span>
            </div>
          </div>

          <div className="history-scroll-indicator">
            <div className="history-scroll-mouse">
              <div className="history-scroll-wheel" />
            </div>
            <span>Листайте вниз</span>
          </div>
        </div>
      </section>

      <section className="history-intro">
        <div className="history-intro-card">
          <div className="history-intro-glow" />
          <h2 className="history-intro-title">Это не рилс про новый тренд</h2>
          <p className="history-intro-text">
            Это история о том, как человечество <strong className="history-highlight-cyan">2000 лет</strong> училось
            делегировать работу машинам. От древнегреческого инженера, который создал компьютер из бронзы,
            к голливудской актрисе, изобретшей Wi-Fi. От первой женщины-программиста к военному адмиралу,
            создавшей компиляторы.
          </p>
          <p className="history-intro-text history-intro-text-italic">
            И вот, в 2025 году, Андрей Карпатый просто дал этой двухтысячелетней идее имя:
            <span className="history-highlight-pink"> "Вайбкодинг"</span>
          </p>
          <div className="history-intro-divider" />
          <p className="history-intro-conclusion">
            <span className="history-highlight-green">Технология существовала 2000 лет. Термин - несколько месяцев.</span>
          </p>
        </div>
      </section>

      <AntikytheraSection />
      <PioneersSection />
      <AIEvolutionSection />
      <FullTimelineSection />

      <section className="history-conclusion">
        <div className="history-conclusion-content">
          <div className="history-conclusion-glow" />
          <h2 className="history-conclusion-title">ВО ИМЯ ОМНИССИИ</h2>
          <p className="history-conclusion-text">
            От Антикитеры, которая считала орбиты планет, к ChatGPT, который пишет код.
            От механизма с <span className="history-highlight-cyan">82 шестернями</span> к нейросетям с
            <span className="history-highlight-pink"> миллиардами параметров</span>.
          </p>
          <p className="history-conclusion-subtext">
            Четыре женщины, два тысячелетия, одна революция: делегирование работы машинам.
            <strong> Спасибо, что стояли на плечах гигантов.</strong>
          </p>
          <div className="history-conclusion-cta">
            <Link to="/courses" className="history-cta-button">
              Научиться вайбкодингу
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="history-seo-content">
        <div className="seo-neural-bg">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="seo-neural-node"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 8}s`,
              }}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="seo-neural-line"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                width: `${50 + Math.random() * 150}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="history-seo-container">
          <article className="seo-article">
            <div className="seo-glow-orb seo-glow-orb-1" />
            <div className="seo-glow-orb seo-glow-orb-2" />
            <div className="seo-glow-orb seo-glow-orb-3" />
            <header className="seo-header">
              <div className="seo-header-icon">
                <svg viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="url(#seoGrad1)" strokeWidth="1" opacity="0.3" />
                  <circle cx="50" cy="50" r="35" stroke="url(#seoGrad1)" strokeWidth="1" opacity="0.5" />
                  <circle cx="50" cy="50" r="25" stroke="url(#seoGrad1)" strokeWidth="1.5" opacity="0.7" />
                  <circle cx="50" cy="50" r="8" fill="url(#seoGrad1)" opacity="0.9" />
                  <circle cx="50" cy="20" r="4" fill="rgba(0,200,255,0.8)" />
                  <circle cx="80" cy="50" r="4" fill="rgba(255,100,150,0.8)" />
                  <circle cx="50" cy="80" r="4" fill="rgba(0,255,200,0.8)" />
                  <circle cx="20" cy="50" r="4" fill="rgba(255,200,100,0.8)" />
                  <line x1="50" y1="28" x2="50" y2="42" stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
                  <line x1="72" y1="50" x2="58" y2="50" stroke="rgba(255,100,150,0.5)" strokeWidth="1" />
                  <line x1="50" y1="72" x2="50" y2="58" stroke="rgba(0,255,200,0.5)" strokeWidth="1" />
                  <line x1="28" y1="50" x2="42" y2="50" stroke="rgba(255,200,100,0.5)" strokeWidth="1" />
                  <defs>
                    <linearGradient id="seoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0,200,255,1)" />
                      <stop offset="50%" stopColor="rgba(255,100,150,1)" />
                      <stop offset="100%" stopColor="rgba(0,255,200,1)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="seo-header-badge">ПОЛНАЯ ИСТОРИЯ</span>
              <h2>История программирования: 2000 лет автоматизации от Антикитерского механизма до вайбкодинга</h2>
              <p className="seo-lead">
                История программирования началась не с компьютеров, не с перфокарт и даже не с электричества.
                Она началась более двух тысяч лет назад, когда неизвестный греческий инженер создал устройство,
                которое автоматически вычисляло положение небесных тел. Эта страница рассказывает полную историю
                автоматизации вычислений - от древней Греции до современных AI-систем и термина "вайбкодинг",
                введенного Андреем Карпатым в феврале 2025 года.
              </p>
            </header>

            <section className="seo-section">
              <h3>Антикитерский механизм: первый компьютер в истории человечества</h3>
              <p>
                В 1901 году греческие ныряльщики за губками обнаружили у берегов острова Антикитера обломки
                древнего корабля, затонувшего примерно в 70-60 годах до нашей эры. Среди античных статуй
                и амфор с вином археологи нашли загадочный бронзовый механизм, покрытый коркой морской соли
                и коррозии. На протяжении почти столетия находку считали простыми астрономическими часами,
                пока CT-сканирование в 2005 году не раскрыло поразительную правду.
              </p>
              <p>
                Антикитерский механизм оказался полноценным аналоговым компьютером, созданным за два тысячелетия
                до изобретения электричества. Устройство содержало от 37 до 82 бронзовых шестерен, образующих
                сложнейшую систему дифференциальных передач. Поворотом ручки древний грек мог узнать положение
                Солнца, Луны и пяти известных планет на любую дату - как в прошлом, так и в будущем.
                Механизм предсказывал солнечные и лунные затмения по циклу Сарос с периодом 18 лет 11 дней,
                рассчитывал фазы Луны по Метоническому циклу и даже определял даты Олимпийских игр.
              </p>
              <p>
                Точность расчетов поражает современных ученых. Антикитерский механизм определял длительность
                лунного (синодического) месяца как 29,53 дня, тогда как современные измерения дают значение
                29,530589 дней - ошибка составляет менее 0,001 процента. Такая точность была недостижима
                до изобретения телескопов и открытия законов Кеплера в XVII веке. После создания Антикитерского
                механизма человечество не производило ничего столь же сложного почти 1700 лет, вплоть до появления
                механических часов в XIV веке.
              </p>
            </section>

            <section className="seo-section">
              <h3>Эпоха перфокарт: Жаккар и рождение программируемых машин</h3>
              <p>
                Следующая революция в автоматизации произошла в начале XIX века благодаря французскому ткачу
                Жозефу Мари Жаккару. В 1804 году он изобрел механизм, позволявший ткацкому станку автоматически
                создавать сложные узоры по программе, записанной на перфокартах. Деревянные карточки с отверстиями
                управляли поднятием нитей: там, где было отверстие, нить поднималась, создавая узор на ткани.
              </p>
              <p>
                Жаккаров станок стал первой программируемой машиной после Антикитерского механизма. Оператор
                мог сменить набор перфокарт и получить совершенно другой узор, не перестраивая сам станок.
                Это была та же идея, которая легла в основу всех компьютеров: разделение аппаратного обеспечения
                и программного обеспечения, железа и софта. Перфокарты Жаккара вдохновили английского математика
                Чарльза Бэббиджа на создание Аналитической машины и использовались в компьютерах вплоть до 1970-х годов.
              </p>
            </section>

            <section className="seo-section">
              <h3>Ада Лавлейс: первый программист в истории</h3>
              <p>
                Августа Ада Кинг, графиня Лавлейс, дочь знаменитого поэта лорда Байрона, стала первым в истории
                программистом. В 1843 году, работая с Чарльзом Бэббиджем над Аналитической машиной, она написала
                алгоритм вычисления чисел Бернулли - первую в мире компьютерную программу, предназначенную
                для выполнения машиной.
              </p>
              <p>
                Ада Лавлейс не просто написала код. Она поняла универсальность вычислительных машин за сто лет
                до их появления. В своих заметках она писала: "Аналитическая машина ткет алгебраические узоры
                так же, как Жаккаров станок ткет цветы и листья". Она предсказала, что машины смогут сочинять
                музыку, создавать графику и обрабатывать любые символы, а не только числа. В 1983 году язык
                программирования Ada был назван в её честь, а День Ады Лавлейс отмечается ежегодно во всем мире.
              </p>
            </section>

            <section className="seo-section">
              <h3>Леонардо Торрес Кеведо и первая "думающая" машина</h3>
              <p>
                Испанский инженер Леонардо Торрес Кеведо в 1912-1914 годах создал El Ajedrecista - автоматического
                шахматного игрока, ставшего первой машиной с элементами искусственного интеллекта. В отличие
                от предшественников, его автомат не просто выполнял заранее запрограммированные действия,
                а самостоятельно принимал решения на основе логики. Машина анализировала позицию на доске
                и выбирала лучший ход, играя эндшпиль король и ладья против короля.
              </p>
              <p>
                El Ajedrecista доказал, что машины способны "думать" в определенном смысле - оценивать ситуацию
                и принимать решения. Это был предтеча всех современных AI-систем, от шахматных программ
                до нейросетей ChatGPT. Как Антикитерский механизм вычислял, где будут планеты, машина Торреса
                Кеведо решала, какой шахматный ход лучше.
              </p>
            </section>

            <section className="seo-section">
              <h3>Ванневар Буш и аналоговые компьютеры XX века</h3>
              <p>
                В 1930 году американский инженер из Массачусетского технологического института Ванневар Буш
                создал Differential Analyzer - первый практический аналоговый компьютер XX века. Огромная машина,
                занимавшая целую комнату, состояла из сотен шестерен, валов и интеграторов. Она автоматически
                решала дифференциальные уравнения - задачи, на которые математикам требовались недели ручных вычислений.
              </p>
              <p>
                Позднее Ванневар Буш предложил концепцию Memex - гипотетического устройства для хранения
                и связывания информации, ставшего прообразом гипертекста и World Wide Web. Его идеи о связанных
                документах и ассоциативном поиске информации предвосхитили интернет на полвека вперед.
              </p>
            </section>

            <section className="seo-section">
              <h3>Хеди Ламарр: голливудская звезда, изобретшая Wi-Fi</h3>
              <p>
                Хеди Ламарр была не только одной из самых красивых актрис Голливуда 1940-х годов, но и блестящим
                изобретателем. В 1942 году, в разгар Второй мировой войны, она вместе с композитором Джорджем
                Антейлом запатентовала систему Frequency Hopping Spread Spectrum - технологию расширения спектра
                со скачкообразной перестройкой частоты.
              </p>
              <p>
                Идея была гениальной в своей простоте: сигнал управления торпедой постоянно переключался
                между 88 различными частотами, как 88 клавиш пианино. Вдохновение действительно пришло
                от автоматического пианино, которое Хеди изучала вместе с Антейлом. Враг не мог заглушить
                сигнал, не зная последовательности переключений. Военно-морской флот США не оценил изобретение
                и не использовал его до 1962 года, но технология Frequency Hopping стала основой для Wi-Fi,
                Bluetooth, GPS и современных сетей 4G/5G. В 1997 году, в возрасте 83 лет, Хеди Ламарр получила
                Pioneer Award от Electronic Frontier Foundation за свой вклад в развитие беспроводных коммуникаций.
              </p>
            </section>

            <section className="seo-section">
              <h3>Грейс Хоппер: мать компиляторов и революция в программировании</h3>
              <p>
                Грейс Мюррей Хоппер, контр-адмирал Военно-морских сил США, совершила одну из важнейших революций
                в истории программирования. В 1952 году она создала первый в мире компилятор A-0 - программу,
                которая автоматически переводила код с понятного человеку языка в машинные инструкции.
              </p>
              <p>
                До изобретения Хоппер программисты писали код непосредственно в машинных кодах -
                последовательностях нулей и единиц. Это был медленный, трудоемкий и чреватый ошибками процесс.
                Грейс Хоппер предложила революционную идею: пусть машина сама переводит код с человеческого языка
                в машинный. Компилятор стал посредником между программистом и компьютером.
              </p>
              <p>
                Её работа привела к созданию языков программирования высокого уровня COBOL и FORTRAN,
                которые до сих пор используются в банковских системах, научных вычислениях и государственных
                учреждениях по всему миру. Миллионы строк кода, написанных на языках, созданных при участии
                Грейс Хоппер, продолжают работать и в 2025 году, обрабатывая финансовые транзакции
                и управляя критической инфраструктурой.
              </p>
            </section>

            <section className="seo-section">
              <h3>Эволюция AI-ассистентов: от TabNine до ChatGPT</h3>
              <p>
                Современная эра автоматизации программирования началась в 2018-2019 годах с появлением TabNine -
                первого AI-ассистента на базе GPT-2. Обученный на миллионах репозиториев GitHub, TabNine
                предлагал автодополнение не отдельных слов, а целых функций и блоков кода. Microsoft IntelliCode
                в 2018-2020 годах добавил AI-предсказания в систему IntelliSense, отмечая звездочкой наиболее
                вероятные методы и свойства.
              </p>
              <p>
                Настоящий прорыв произошел в августе 2021 года с выходом OpenAI Codex - модели с 12 миллиардами
                параметров, обученной на 159 гигабайтах кода из GitHub. Codex решал 37 процентов задач
                по программированию с первого раза, что было немыслимо для предыдущих систем. На его основе
                был создан GitHub Copilot - первый коммерческий AI-ассистент для программистов, запущенный
                в июне 2022 года по цене 10 долларов в месяц.
              </p>
              <p>
                30 ноября 2022 года OpenAI выпустил ChatGPT, и мир программирования изменился навсегда.
                За два месяца сервис набрал 100 миллионов пользователей - самый быстрый рост в истории
                потребительских приложений. ChatGPT не просто дополнял код, он создавал целые приложения
                с нуля по текстовому описанию. Программист мог описать задачу на естественном языке
                и получить работающий код через несколько секунд.
              </p>
              <p>
                В 2023-2024 годах появились Cursor IDE, Claude Artifacts, Devin и Windsurf - инструменты,
                где AI интегрирован непосредственно в среду разработки. AI-агенты научились не просто писать код,
                но и самостоятельно тестировать его, исправлять ошибки и деплоить приложения.
              </p>
            </section>

            <section className="seo-section">
              <h3>Вайбкодинг: Андрей Карпатый называет революцию</h3>
              <p>
                3 февраля 2025 года Андрей Карпатый, бывший директор AI в Tesla и сотрудник OpenAI, опубликовал
                пост, который мгновенно стал вирусным. Он ввел термин "вайбкодинг" (vibe coding) для описания
                нового стиля программирования, при котором разработчик описывает задачу на естественном языке,
                а искусственный интеллект пишет код.
              </p>
              <p>
                Ключевой инсайт Карпатого в том, что он не изобрел новую концепцию - он дал имя тому,
                что существовало две тысячи лет. Подобно тому как Стив Джобс не изобрел смартфон,
                но дал ему имя "iPhone", Карпатый назвал двухтысячелетнюю идею делегирования работы машинам.
                От Антикитерского механизма, который автоматически вычислял положение планет, до ChatGPT,
                который автоматически пишет код - это одна и та же идея в разных технологических воплощениях.
              </p>
            </section>

            <section className="seo-section">
              <h3>Заключение: будущее программирования</h3>
              <p>
                История программирования - это история постоянного стремления человечества делегировать
                вычислительную работу машинам. От бронзовых шестерен Антикитерского механизма к перфокартам
                Жаккара, от первой программы Ады Лавлейс к компиляторам Грейс Хоппер, от табуляторов
                до нейросетей с миллиардами параметров - каждое поколение находило способ переложить
                больше работы на машины.
              </p>
              <p>
                Сегодня мы стоим на пороге новой эры, когда программирование становится доступным каждому.
                Не нужно знать синтаксис языков, не нужно помнить тысячи функций и методов - достаточно
                объяснить машине, что ты хочешь получить. Вайбкодинг - это не отказ от программирования,
                а его естественная эволюция. Как компиляторы освободили программистов от машинных кодов,
                AI-ассистенты освобождают их от рутинного написания бойлерплейта.
              </p>
              <p>
                Три из шести великих пионеров автоматизации, описанных на этой странице, - женщины.
                Ада Лавлейс написала первую программу, Хеди Ламарр изобрела основу беспроводных коммуникаций,
                Грейс Хоппер создала компиляторы. Программирование с самого начала было сферой, где женщины
                делали фундаментальные открытия. Эта традиция продолжается и сегодня.
              </p>
              <p>
                От механизма с 82 шестернями к нейросетям с сотнями миллиардов параметров.
                От предсказания затмений к генерации целых приложений. Технология автоматического
                "программирования" существовала две тысячи лет. Термин "вайбкодинг" - несколько месяцев.
                Но идея та же самая: дать машине инструкции и позволить ей выполнить работу за человека.
              </p>
            </section>

            <div className="seo-cosmic-finale">
              <div className="seo-finale-stars">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="seo-finale-star"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1.5 + Math.random() * 1.5}s`,
                    }}
                  />
                ))}
              </div>
              <div className="seo-finale-icon">
                <svg viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="90" stroke="url(#finaleGrad1)" strokeWidth="2" opacity="0.3" />
                  <circle cx="100" cy="100" r="70" stroke="url(#finaleGrad1)" strokeWidth="2" opacity="0.5" />
                  <circle cx="100" cy="100" r="50" stroke="url(#finaleGrad1)" strokeWidth="2" opacity="0.7" />
                  <circle cx="100" cy="100" r="30" stroke="url(#finaleGrad1)" strokeWidth="3" opacity="0.9" />
                  <circle cx="100" cy="100" r="15" fill="url(#finaleGrad1)" />
                  <circle cx="100" cy="30" r="8" fill="rgba(0,220,255,1)">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="170" cy="100" r="8" fill="rgba(255,120,180,1)">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" begin="0.5s" />
                  </circle>
                  <circle cx="100" cy="170" r="8" fill="rgba(0,255,200,1)">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" begin="1s" />
                  </circle>
                  <circle cx="30" cy="100" r="8" fill="rgba(255,220,100,1)">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" begin="1.5s" />
                  </circle>
                  <line x1="100" y1="38" x2="100" y2="70" stroke="rgba(0,220,255,0.6)" strokeWidth="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                  </line>
                  <line x1="162" y1="100" x2="130" y2="100" stroke="rgba(255,120,180,0.6)" strokeWidth="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
                  </line>
                  <line x1="100" y1="162" x2="100" y2="130" stroke="rgba(0,255,200,0.6)" strokeWidth="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
                  </line>
                  <line x1="38" y1="100" x2="70" y2="100" stroke="rgba(255,220,100,0.6)" strokeWidth="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
                  </line>
                  <defs>
                    <linearGradient id="finaleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0,220,255,1)" />
                      <stop offset="33%" stopColor="rgba(255,120,180,1)" />
                      <stop offset="66%" stopColor="rgba(0,255,200,1)" />
                      <stop offset="100%" stopColor="rgba(255,220,100,1)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="seo-finale-title">
                Мы - часть великой вселенной разума
              </h3>
              <p className="seo-finale-subtitle">
                Каждая строка кода - это послание в будущее
              </p>
              <p className="seo-finale-text">
                От древних механизмов до нейронных сетей, от бронзовых шестеренок до квантовых битов -
                человечество всегда стремилось расширить границы возможного. Сегодня мы создаем не просто
                программы - мы создаем новые формы интеллекта, которые будут помогать всем существам на Земле.
              </p>
              <p className="seo-finale-text">
                Вайбкодинг - это не конец истории программирования. Это начало новой главы, где каждый человек
                может стать творцом цифровых миров, где идеи материализуются в код силой мысли и намерения,
                где технологии служат благу всех живых существ.
              </p>
              <blockquote className="seo-finale-quote">
                "Настоящая магия технологий - не в том, чтобы заменить человека, а в том, чтобы усилить
                его способность творить, мечтать и воплощать невозможное в реальность."
                <span className="seo-finale-author">- Философия вайбкодинга</span>
              </blockquote>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
