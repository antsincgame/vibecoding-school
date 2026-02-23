import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Lesson {
  title: string;
  duration: string;
  youtube_url?: string;
}

interface Module {
  title: string;
  lessonsCount: number;
  totalDuration: string;
  lessons: Lesson[];
}

const boltProgram: Module[] = [
  {
    title: 'Введение',
    lessonsCount: 3,
    totalDuration: '35мин',
    lessons: [
      { title: 'Первое приложение в bolt.new за 15 минут', duration: '13:40' },
      { title: 'Как "разговаривать" с bolt.new: промпты, ограничения, критерии готовности', duration: '10:20' },
      { title: 'Ошибки новичков: почему ИИ генерирует ерунду и как это чинить', duration: '11:15' },
    ],
  },
  {
    title: 'Bolt.new тренинг',
    lessonsCount: 8,
    totalDuration: '1ч 7мин',
    lessons: [
      { title: 'Интерфейс bolt.new: проекты, файлы, предпросмотр', duration: '07:45' },
      { title: 'Быстрый старт: генерация шаблона и чистка мусора', duration: '08:50' },
      { title: 'Итерации: "сгенерируй - поправь - улучши" на практике', duration: '09:30' },
      { title: 'Работа с компонентами: переиспользование и структура', duration: '06:40' },
      { title: 'Стили и дизайн-система: цвета, типографика, отступы', duration: '10:15' },
      { title: 'Формы и состояния: loading/error/success', duration: '08:05' },
      { title: 'Дебаг с ИИ: как находить причину, а не симптом', duration: '07:20' },
      { title: 'Рефакторинг: упрощаем код без поломок', duration: '09:10' },
    ],
  },
  {
    title: 'Дизайн и фронтенд в bolt.new',
    lessonsCount: 6,
    totalDuration: '47мин',
    lessons: [
      { title: 'UX-карта: страницы, сценарии, "что пользователь делает"', duration: '05:10' },
      { title: 'Сетка и адаптив: mobile-first без боли', duration: '08:45' },
      { title: 'Лендинг: Hero + CTA + доверие (social proof)', duration: '09:05' },
      { title: 'Секции Features и Pricing: как объяснять ценность', duration: '07:55' },
      { title: 'FAQ и микро-UX: мелочи, которые повышают конверсию', duration: '07:30' },
      { title: 'Навигация и футер: структура, ссылки, юридические блоки', duration: '08:20' },
    ],
  },
  {
    title: 'Supabase: данные и auth',
    lessonsCount: 6,
    totalDuration: '53мин',
    lessons: [
      { title: 'Supabase за 10 минут: проект, ключи, подключение', duration: '06:30' },
      { title: 'База данных: таблицы, связи, индексы (основа)', duration: '09:40' },
      { title: 'CRUD: список, создание, редактирование, удаление', duration: '10:25' },
      { title: 'Auth: регистрация, логин, выход, protected pages', duration: '08:50' },
      { title: 'RLS: как реально защитить данные пользователей', duration: '09:05' },
      { title: 'Storage: загрузка изображений/файлов, права доступа', duration: '08:15' },
    ],
  },
  {
    title: 'GitHub + Netlify',
    lessonsCount: 3,
    totalDuration: '27мин',
    lessons: [
      { title: 'GitHub с нуля: репозиторий, коммиты, ветки', duration: '09:10' },
      { title: 'Netlify: деплой из GitHub и переменные окружения', duration: '10:05' },
      { title: 'Продакшен-дебаг: логи, ошибки сборки, откаты', duration: '07:55' },
    ],
  },
  {
    title: 'SEO и аналитика',
    lessonsCount: 2,
    totalDuration: '18мин',
    lessons: [
      { title: 'SEO-основа: структура страниц, мета, заголовки, ЧПУ', duration: '09:20' },
      { title: 'Индексация и измерение: sitemap/robots + базовая аналитика', duration: '08:10' },
    ],
  },
  {
    title: 'ИИ-инструменты и финальная сборка',
    lessonsCount: 2,
    totalDuration: '20мин',
    lessons: [
      { title: 'ИИ-фича в продукте: генерация контента с контролем качества', duration: '10:30' },
      { title: 'Финальная полировка: производительность, UX, чеклист релиза', duration: '09:15' },
    ],
  },
];

const cursorProgram: Module[] = [
  {
    title: 'Введение',
    lessonsCount: 3,
    totalDuration: '34мин',
    lessons: [
      { title: 'Зачем Cursor AI: ускорение без потери контроля', duration: '12:30' },
      { title: 'Как писать ТЗ для ИИ: контекст, ограничения, критерии готовности', duration: '10:10' },
      { title: 'Чеклист качества: как проверять ответы ИИ и не ломать проект', duration: '11:05' },
    ],
  },
  {
    title: 'Cursor тренинг: базовые фичи',
    lessonsCount: 10,
    totalDuration: '1ч 13мин',
    lessons: [
      { title: 'Установка и первый запуск: аккаунт, приватность, основы', duration: '07:40' },
      { title: 'Базовые настройки: модели, автодополнение, индексация проекта', duration: '08:55' },
      { title: 'Workspace и структура: что Cursor "понимает" о вашем проекте', duration: '06:20' },
      { title: 'Inline-правки: быстрые изменения прямо в коде', duration: '04:10' },
      { title: 'Chat: вопросы по коду и патчи без хаоса', duration: '09:30' },
      { title: 'Tab: автодополнение как ускоритель', duration: '05:05' },
      { title: 'Cmd+K: генерация/рефактор выделенного фрагмента', duration: '03:50' },
      { title: 'Composer: многофайловые изменения и сборка фичи', duration: '12:10' },
      { title: 'Правила проекта: .cursorrules и стандарты кода', duration: '08:15' },
      { title: 'Привычки профи: итерации "сделай - улучши - проверь"', duration: '06:35' },
    ],
  },
  {
    title: 'Работа с кодовой базой и контекстом',
    lessonsCount: 5,
    totalDuration: '42мин',
    lessons: [
      { title: 'Контекст для ИИ: @files / @folders / @codebase', duration: '09:10' },
      { title: 'Навигация по проекту: поиск, символы, зависимости', duration: '10:05' },
      { title: 'Диагностика ошибок: от стектрейса к точному фиксу', duration: '07:45' },
      { title: 'Рефакторинг по слоям: компонент - модуль - архитектура', duration: '08:30' },
      { title: 'Документация без "воды": README, комментарии, заметки', duration: '06:50' },
    ],
  },
  {
    title: 'Инженерный workflow: Git и PR',
    lessonsCount: 3,
    totalDuration: '24мин',
    lessons: [
      { title: 'Git в Cursor: диффы, коммиты, понятные сообщения', duration: '09:15' },
      { title: 'Ветки и PR: как просить ИИ делать изменения безопасно', duration: '07:40' },
      { title: 'Code review с ИИ: баги, стиль, читаемость', duration: '06:35' },
    ],
  },
  {
    title: 'Архитектура и качество кода',
    lessonsCount: 4,
    totalDuration: '35мин',
    lessons: [
      { title: 'Типизация и контракты: как "заземлять" ИИ и снижать ошибки', duration: '10:20' },
      { title: 'Тесты с ИИ: полезные кейсы вместо формальности', duration: '09:05' },
      { title: 'Линтинг/форматирование: автоматизация качества', duration: '08:10' },
      { title: 'Безопасность: секреты, инъекции, опасные паттерны', duration: '07:50' },
    ],
  },
  {
    title: 'Интеграции и продакшен-подход',
    lessonsCount: 3,
    totalDuration: '23мин',
    lessons: [
      { title: 'Терминал и команды: воспроизводим проблему и фиксируем', duration: '08:30' },
      { title: 'Env variables: ключи, конфиги, разные окружения', duration: '07:15' },
      { title: 'Деплой и продакшен-дебаг: логи, откаты, hotfix', duration: '07:40' },
    ],
  },
  {
    title: 'Финальный проект: сборка и релиз',
    lessonsCount: 2,
    totalDuration: '23мин',
    lessons: [
      { title: 'Собираем фичу "от задачи до релиза" в режиме Composer', duration: '12:15' },
      { title: 'Полировка: производительность, UX, финальный чеклист', duration: '11:10' },
    ],
  },
];

const coursePrograms: Record<string, Module[]> = {
  'vibecoding-bolt-new': boltProgram,
  'cursor-ai': cursorProgram,
};

interface CourseProgramProps {
  isExpanded: boolean;
  onToggle: () => void;
  courseSlug: string;
  courseId?: string;
}

const calculateTotalDuration = (lessons: Lesson[]): string => {
  let totalMinutes = 0;
  lessons.forEach(l => {
    const parts = l.duration.split(':');
    if (parts.length === 2) {
      totalMinutes += parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
  });
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}ч ${mins}мин`;
  }
  return `${Math.round(totalMinutes)}мин`;
};

export default function CourseProgram({ isExpanded, onToggle, courseSlug, courseId }: CourseProgramProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [dbProgram, setDbProgram] = useState<Module[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseId && isExpanded) {
      loadProgramFromDb();
    }
  }, [courseId, isExpanded]);

  const loadProgramFromDb = async () => {
    if (!courseId) return;

    setLoading(true);
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

      const program: Module[] = modulesData.map(module => {
        const lessons = (lessonsData?.filter(l => l.module_id === module.id) || []).map(l => ({
          title: l.title,
          duration: l.duration,
          youtube_url: l.youtube_url || undefined,
        }));
        return {
          title: module.title,
          lessonsCount: lessons.length,
          totalDuration: calculateTotalDuration(lessons),
          lessons,
        };
      });

      setDbProgram(program);
    }
    setLoading(false);
  };

  const program = dbProgram || coursePrograms[courseSlug] || boltProgram;

  const toggleModule = (index: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const totalLessons = program.reduce((sum, m) => sum + m.lessonsCount, 0);

  return (
    <div>
      <button
        onClick={onToggle}
        className="cyber-button"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <span>Читать программу курса</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 255, 249, 0.3)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
              Загрузка программы...
            </div>
          ) : program.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
              Программа курса скоро будет добавлена
            </div>
          ) : (
          <>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(0, 255, 249, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 255, 249, 0.05)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--neon-cyan)' }}>
              Программа курса
            </span>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>
              {program.length} модулей / {totalLessons} уроков
            </span>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {program.map((module, moduleIndex) => (
              <div key={moduleIndex}>
                <button
                  onClick={() => toggleModule(moduleIndex)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: expandedModules.has(moduleIndex)
                      ? 'rgba(0, 255, 249, 0.1)'
                      : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {module.title}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      {module.lessonsCount} {module.lessonsCount === 1 ? 'урок' : module.lessonsCount < 5 ? 'урока' : 'уроков'} / {module.totalDuration}
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: expandedModules.has(moduleIndex) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      opacity: 0.5,
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {expandedModules.has(moduleIndex) && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        style={{
                          padding: '10px 20px 10px 40px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          fontSize: '13px',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--neon-green)"
                          strokeWidth="2"
                          style={{ flexShrink: 0, opacity: 0.7 }}
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span style={{ flex: 1, opacity: 0.85 }}>{lesson.title}</span>
                        <span style={{ opacity: 0.5, fontSize: '12px' }}>{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
