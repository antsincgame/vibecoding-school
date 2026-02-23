import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { StudentEnrollment, Course, CourseModule, CourseLesson, LessonProgress, HomeworkSubmission } from '../types';

interface EnrollmentWithProgress extends StudentEnrollment {
  course: Course;
  totalLessons: number;
  completedLessons: number;
  lastLesson?: {
    id: string;
    title: string;
    moduleTitle: string;
  };
}

export default function StudentDashboard() {
  const { profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadEnrollments();
    }
  }, [profile]);

  const loadEnrollments = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    try {
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('student_id', profile.id)
      .order('enrolled_at', { ascending: false });

    if (enrollmentError) {
      setError('Не удалось загрузить курсы');
      setLoading(false);
      return;
    }

    if (!enrollmentData || enrollmentData.length === 0) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollmentData.map(e => e.course_id);

    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*, lessons:course_lessons(*)')
      .in('course_id', courseIds)
      .order('order_index');

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', profile.id);

    const enrichedEnrollments: EnrollmentWithProgress[] = enrollmentData.map(enrollment => {
      const courseModules = modulesData?.filter(m => m.course_id === enrollment.course_id) || [];
      const allLessons: CourseLesson[] = courseModules.flatMap(m => m.lessons || []);
      const lessonIds = allLessons.map(l => l.id);
      const completedProgress = progressData?.filter(
        p => lessonIds.includes(p.lesson_id) && p.is_completed
      ) || [];

      let lastLesson: EnrollmentWithProgress['lastLesson'] = undefined;

      for (const module of courseModules.sort((a, b) => a.order_index - b.order_index)) {
        const sortedLessons = (module.lessons || []).sort((a: CourseLesson, b: CourseLesson) => a.order_index - b.order_index);
        for (const lesson of sortedLessons) {
          const progress = progressData?.find(p => p.lesson_id === lesson.id);
          if (!progress?.is_completed) {
            lastLesson = {
              id: lesson.id,
              title: lesson.title,
              moduleTitle: module.title
            };
            break;
          }
        }
        if (lastLesson) break;
      }

      if (!lastLesson && allLessons.length > 0) {
        const firstModule = courseModules.sort((a, b) => a.order_index - b.order_index)[0];
        const firstLesson = (firstModule?.lessons || []).sort((a: CourseLesson, b: CourseLesson) => a.order_index - b.order_index)[0];
        if (firstLesson) {
          lastLesson = {
            id: firstLesson.id,
            title: firstLesson.title,
            moduleTitle: firstModule.title
          };
        }
      }

      return {
        ...enrollment,
        course: enrollment.course,
        totalLessons: allLessons.length,
        completedLessons: completedProgress.length,
        lastLesson
      };
    });

    setEnrollments(enrichedEnrollments);
    setLoading(false);
    } catch {
      setError('Произошла ошибка при загрузке данных');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName });
    if (error) {
      alert('Ошибка сохранения профиля');
    } else {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      default: return 'Ученик';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            margin: 0
          }} className="glitch" data-text="ЛИЧНЫЙ КАБИНЕТ">
            <span className="neon-text">ЛИЧНЫЙ КАБИНЕТ</span>
          </h1>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {(profile?.role === 'admin' || profile?.role === 'teacher') && (
              <button
                onClick={() => navigate(profile.role === 'admin' ? '/admin' : '/teacher')}
                className="cyber-button"
                style={{
                  fontSize: '14px',
                  padding: '12px 24px',
                  background: 'rgba(57, 255, 20, 0.2)',
                  border: '2px solid var(--neon-green)'
                }}
              >
                {profile.role === 'admin' ? 'АДМИН-ПАНЕЛЬ' : 'УЧИТЕЛЬСКАЯ'}
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="cyber-button"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                background: 'rgba(255, 0, 110, 0.2)',
                border: '2px solid var(--neon-pink)'
              }}
            >
              ВЫЙТИ
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid rgba(0, 255, 249, 0.2)',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'courses' ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'courses' ? '3px solid var(--neon-cyan)' : '3px solid transparent',
              color: activeTab === 'courses' ? 'var(--neon-cyan)' : 'var(--text-primary)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            Мои курсы
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'profile' ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid var(--neon-cyan)' : '3px solid transparent',
              color: activeTab === 'profile' ? 'var(--neon-cyan)' : 'var(--text-primary)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            Профиль
          </button>
        </div>

        {activeTab === 'courses' && (
          <div>
            {error ? (
              <div className="cyber-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '60px',
                  marginBottom: '20px',
                  background: 'rgba(255, 0, 110, 0.2)',
                  borderRadius: '50%',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>!</div>
                <h3 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--neon-pink)' }}>
                  {error}
                </h3>
                <button onClick={() => loadEnrollments()} className="cyber-button">
                  ПОПРОБОВАТЬ СНОВА
                </button>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid rgba(0, 255, 249, 0.3)',
                  borderTop: '3px solid var(--neon-cyan)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="cyber-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>📚</div>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '15px',
                  color: 'var(--neon-cyan)'
                }}>
                  Пока нет активных курсов
                </h3>
                <p style={{
                  fontSize: '16px',
                  opacity: 0.7,
                  marginBottom: '30px',
                  maxWidth: '400px',
                  margin: '0 auto 30px'
                }}>
                  Запишитесь на курс, чтобы начать обучение программированию с помощью нейросетей
                </p>
                <button
                  onClick={() => navigate('/courses')}
                  className="cyber-button"
                >
                  ПОСМОТРЕТЬ КУРСЫ
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '24px'
              }}>
                {enrollments.map(enrollment => {
                  const progress = getProgressPercentage(enrollment.completedLessons, enrollment.totalLessons);
                  return (
                    <div
                      key={enrollment.id}
                      className="cyber-card"
                      style={{
                        padding: '0',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(200px, 300px) 1fr',
                        gap: '0'
                      }}
                    >
                      <div style={{
                        background: `url(${enrollment.course.image_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}) center/cover`,
                        minHeight: '200px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: '15px',
                          left: '15px',
                          background: enrollment.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)',
                          color: 'var(--bg-dark)',
                          padding: '6px 14px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '12px',
                          textTransform: 'uppercase'
                        }}>
                          {enrollment.status === 'completed' ? 'Завершен' : 'Активен'}
                        </div>
                      </div>

                      <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{
                          fontSize: '22px',
                          marginBottom: '10px',
                          color: 'var(--neon-cyan)'
                        }}>
                          {enrollment.course.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          opacity: 0.7,
                          marginBottom: '20px',
                          lineHeight: 1.5
                        }}>
                          {enrollment.course.description?.slice(0, 150)}...
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>
                            <span>Прогресс</span>
                            <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
                              {enrollment.completedLessons} / {enrollment.totalLessons} уроков ({progress}%)
                            </span>
                          </div>
                          <div style={{
                            height: '8px',
                            background: 'rgba(0, 255, 249, 0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progress}%`,
                              background: progress === 100
                                ? 'linear-gradient(90deg, var(--neon-green), #00ff88)'
                                : 'linear-gradient(90deg, var(--neon-cyan), #00b8b8)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>

                        {enrollment.lastLesson && (
                          <p style={{
                            fontSize: '13px',
                            opacity: 0.6,
                            marginBottom: '20px'
                          }}>
                            Продолжить: <span style={{ color: 'var(--neon-cyan)' }}>
                              {enrollment.lastLesson.moduleTitle} → {enrollment.lastLesson.title}
                            </span>
                          </p>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => navigate(`/student/course/${enrollment.course.slug || enrollment.course.id}`)}
                            className="cyber-button"
                            style={{ flex: 1 }}
                          >
                            {progress === 0 ? 'НАЧАТЬ ОБУЧЕНИЕ' : 'ПРОДОЛЖИТЬ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="cyber-card" style={{ padding: '40px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '3px solid var(--neon-cyan)',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid var(--neon-cyan)',
                  background: 'rgba(0, 255, 249, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: 700,
                  color: 'var(--neon-cyan)'
                }}>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '28px',
                  marginBottom: '10px',
                  color: 'var(--neon-cyan)'
                }}>
                  {profile?.full_name || 'Ученик'}
                </h2>
                <p style={{
                  fontSize: '16px',
                  opacity: 0.8,
                  marginBottom: '5px'
                }}>
                  {profile?.email}
                </p>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.6,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Роль: {getRoleLabel(profile?.role || 'user')}
                </p>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(0, 255, 249, 0.3)',
              paddingTop: '30px'
            }}>
              <h3 style={{
                fontSize: '20px',
                marginBottom: '20px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Редактировать профиль
              </h3>

              {isEditing ? (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '10px',
                      fontSize: '14px',
                      color: 'var(--neon-cyan)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 600
                    }}>
                      Имя
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="cyber-input"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="cyber-button"
                      style={{
                        opacity: saving ? 0.5 : 1,
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || '');
                      }}
                      className="cyber-button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      ОТМЕНА
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="cyber-button"
                >
                  РЕДАКТИРОВАТЬ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .cyber-card[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
