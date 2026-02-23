import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Course, CourseModule, CourseLesson, LessonProgress, HomeworkSubmission } from '../types';

interface LessonWithStatus extends CourseLesson {
  progress?: LessonProgress;
  homework?: HomeworkSubmission;
  isUnlocked: boolean;
}

interface ModuleWithLessons extends CourseModule {
  lessons: LessonWithStatus[];
}

export default function StudentCoursePage() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && slug) {
      loadCourse();
    }
  }, [profile, slug]);

  const loadCourse = async () => {
    if (!profile || !slug) return;
    setLoading(true);
    setError(null);

    try {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (courseError) {
      setError('Не удалось загрузить курс');
      setLoading(false);
      return;
    }

    if (!courseData) {
      navigate('/student/dashboard');
      return;
    }

    const { data: enrollmentData } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('student_id', profile.id)
      .eq('course_id', courseData.id)
      .maybeSingle();

    if (!enrollmentData) {
      navigate('/student/dashboard');
      return;
    }

    setCourse(courseData);

    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseData.id)
      .order('order_index');

    if (!modulesData || modulesData.length === 0) {
      setModules([]);
      setLoading(false);
      return;
    }

    const moduleIds = modulesData.map(m => m.id);

    const { data: lessonsData } = await supabase
      .from('course_lessons')
      .select('*')
      .in('module_id', moduleIds)
      .order('order_index');

    const lessonIds = lessonsData?.map(l => l.id) || [];

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', profile.id)
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['']);

    const { data: homeworkData } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('student_id', profile.id)
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['']);

    let total = 0;
    let completed = 0;
    let previousLessonCompleted = true;
    let previousHomeworkApproved = true;

    const modulesWithLessons: ModuleWithLessons[] = modulesData.map((module, moduleIndex) => {
      const moduleLessons = (lessonsData?.filter(l => l.module_id === module.id) || [])
        .sort((a, b) => a.order_index - b.order_index);

      const lessonsWithStatus: LessonWithStatus[] = moduleLessons.map((lesson, lessonIndex) => {
        const progress = progressData?.find(p => p.lesson_id === lesson.id);
        const homework = homeworkData?.find(h => h.lesson_id === lesson.id);

        total++;
        if (progress?.is_completed) {
          completed++;
        }

        const isFirstLesson = moduleIndex === 0 && lessonIndex === 0;
        const isUnlocked = isFirstLesson || (previousLessonCompleted && previousHomeworkApproved);

        const hasHomework = lesson.homework_description && lesson.homework_description.trim() !== '';

        previousLessonCompleted = progress?.is_completed || false;
        previousHomeworkApproved = !hasHomework || homework?.status === 'approved';

        return {
          ...lesson,
          progress,
          homework,
          isUnlocked
        };
      });

      return {
        ...module,
        lessons: lessonsWithStatus
      };
    });

    setTotalLessons(total);
    setCompletedLessons(completed);
    setModules(modulesWithLessons);

    const firstIncompleteModule = modulesWithLessons.find(m =>
      m.lessons.some(l => !l.progress?.is_completed)
    );
    if (firstIncompleteModule) {
      setExpandedModules(new Set([firstIncompleteModule.id]));
    } else if (modulesWithLessons.length > 0) {
      setExpandedModules(new Set([modulesWithLessons[0].id]));
    }

    setLoading(false);
    } catch {
      setError('Произошла ошибка при загрузке курса');
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getProgressPercentage = () => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const getLessonStatusIcon = (lesson: LessonWithStatus) => {
    if (!lesson.isUnlocked) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    }
    if (lesson.progress?.is_completed) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
      );
    }
    if (lesson.homework) {
      if (lesson.homework.status === 'pending') {
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffa500" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      }
      if (lesson.homework.status === 'rejected') {
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      }
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    );
  };

  const getLessonStatusText = (lesson: LessonWithStatus) => {
    if (!lesson.isUnlocked) return 'Заблокировано';
    if (lesson.progress?.is_completed) return 'Завершен';
    if (lesson.homework?.status === 'pending') return 'На проверке';
    if (lesson.homework?.status === 'rejected') return 'На доработку';
    return 'Доступен';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(0, 255, 249, 0.3)',
          borderTop: '3px solid var(--neon-cyan)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '60px',
          background: 'rgba(255, 0, 110, 0.2)',
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>!</div>
        <h2 style={{ fontSize: '24px', color: 'var(--neon-pink)' }}>Ошибка</h2>
        <p style={{ opacity: 0.7, textAlign: 'center' }}>{error}</p>
        <button onClick={() => loadCourse()} className="cyber-button">
          ПОПРОБОВАТЬ СНОВА
        </button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const progress = getProgressPercentage();

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '60px'
    }}>
      <div style={{
        background: `linear-gradient(180deg, rgba(0, 255, 249, 0.1) 0%, transparent 100%)`,
        padding: '40px 20px',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neon-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              fontFamily: 'Rajdhani, sans-serif'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Назад к курсам
          </button>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            marginBottom: '15px',
            color: 'var(--neon-cyan)'
          }}>
            {course.title}
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <span>Прогресс курса</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
                  {completedLessons} / {totalLessons} уроков ({progress}%)
                </span>
              </div>
              <div style={{
                height: '10px',
                background: 'rgba(0, 255, 249, 0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress === 100
                    ? 'linear-gradient(90deg, var(--neon-green), #00ff88)'
                    : 'linear-gradient(90deg, var(--neon-cyan), #00b8b8)',
                  borderRadius: '5px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <a
              href="https://t.me/vibecodingby"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                background: 'rgba(0, 136, 204, 0.2)',
                border: '2px solid #0088cc'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              ЗАДАТЬ ВОПРОС
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {modules.length === 0 ? (
          <div className="cyber-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>📚</div>
            <h3 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--neon-cyan)' }}>
              Контент курса в разработке
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.7 }}>
              Уроки скоро появятся. Следите за обновлениями!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {modules.map((module, moduleIndex) => {
              const moduleLessonsCompleted = module.lessons.filter(l => l.progress?.is_completed).length;
              const moduleTotalLessons = module.lessons.length;

              return (
                <div
                  key={module.id}
                  className="cyber-card"
                  style={{ padding: 0, overflow: 'hidden' }}
                >
                  <div
                    onClick={() => toggleModule(module.id)}
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: expandedModules.has(module.id) ? 'rgba(0, 255, 249, 0.05)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: moduleLessonsCompleted === moduleTotalLessons && moduleTotalLessons > 0
                          ? 'var(--neon-green)'
                          : 'var(--neon-cyan)',
                        color: 'var(--bg-dark)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{module.title}</h3>
                        <p style={{ fontSize: '13px', opacity: 0.6 }}>
                          {moduleLessonsCompleted} / {moduleTotalLessons} уроков завершено
                        </p>
                      </div>
                    </div>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: expandedModules.has(module.id) ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                        opacity: 0.6
                      }}
                    >
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </div>

                  {expandedModules.has(module.id) && (
                    <div style={{ borderTop: '1px solid rgba(0, 255, 249, 0.1)' }}>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          onClick={() => lesson.isUnlocked && navigate(`/student/lesson/${lesson.id}`)}
                          style={{
                            padding: '16px 24px 16px 76px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: lesson.isUnlocked ? 'pointer' : 'not-allowed',
                            opacity: lesson.isUnlocked ? 1 : 0.5,
                            borderBottom: lessonIndex < module.lessons.length - 1
                              ? '1px solid rgba(255, 255, 255, 0.05)'
                              : 'none',
                            transition: 'background 0.2s',
                            background: 'transparent'
                          }}
                          onMouseEnter={e => {
                            if (lesson.isUnlocked) {
                              e.currentTarget.style.background = 'rgba(0, 255, 249, 0.05)';
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                            {getLessonStatusIcon(lesson)}
                            <div style={{ flex: 1 }}>
                              <p style={{
                                fontSize: '15px',
                                fontWeight: 500,
                                marginBottom: '2px'
                              }}>
                                {lesson.title}
                              </p>
                              <p style={{
                                fontSize: '12px',
                                opacity: 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <span>{lesson.duration}</span>
                                {lesson.homework_description && (
                                  <span style={{
                                    color: lesson.homework?.status === 'approved' ? 'var(--neon-green)' :
                                      lesson.homework?.status === 'rejected' ? 'var(--neon-pink)' :
                                      lesson.homework?.status === 'pending' ? '#ffa500' :
                                      'var(--neon-cyan)'
                                  }}>
                                    ДЗ: {getLessonStatusText(lesson)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {lesson.isUnlocked && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                              <polyline points="9,18 15,12 9,6" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
