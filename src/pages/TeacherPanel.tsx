import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { HomeworkSubmission, Course, CourseModule, CourseLesson } from '../types';

interface ExtendedHomework extends HomeworkSubmission {
  student: {
    id: string;
    email: string;
    full_name: string | null;
  };
  lesson: CourseLesson & {
    module: CourseModule & {
      course: Course;
    };
  };
}

interface StudentCourse {
  id: string;
  title: string;
  status: string;
  enrolled_at: string;
}

interface StudentProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface StudentEnrollment {
  student: StudentProfile;
  course: { id: string; title: string };
  status: string;
  enrolled_at: string;
}

interface StudentProgress {
  id: string;
  is_completed: boolean;
  completed_at: string | null;
  lesson: CourseLesson & {
    module: CourseModule & {
      course: Course;
    };
  };
}

interface StudentHomework {
  id: string;
  status: string;
  submitted_at: string;
  lesson: CourseLesson & {
    module: CourseModule & {
      course: Course;
    };
  };
}

interface Student extends StudentProfile {
  courses: StudentCourse[];
  progress?: StudentProgress[];
  homework?: StudentHomework[];
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function TeacherPanel() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'homework' | 'students'>('homework');
  const [homework, setHomework] = useState<ExtendedHomework[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<ExtendedHomework | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
      navigate('/student/dashboard');
      return;
    }
    loadData();
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadHomework();
    }
  }, [filterStatus, filterCourse, profile]);

  const loadData = async () => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('title');

    setCourses(coursesData || []);
    await loadHomework();
  };

  const loadHomework = async () => {
    setLoading(true);

    let query = supabase
      .from('homework_submissions')
      .select(`
        *,
        student:profiles!homework_submissions_student_id_fkey(id, email, full_name),
        lesson:course_lessons!homework_submissions_lesson_id_fkey(
          *,
          module:course_modules!course_lessons_module_id_fkey(
            *,
            course:courses!course_modules_course_id_fkey(*)
          )
        )
      `)
      .order('submitted_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query;

    let filteredData = data || [];

    if (filterCourse !== 'all') {
      filteredData = filteredData.filter(
        (h: ExtendedHomework) => h.lesson?.module?.course?.id === filterCourse
      );
    }

    setHomework(filteredData as ExtendedHomework[]);
    setLoading(false);
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedHomework || !profile) return;
    setSubmitting(true);

    await supabase
      .from('homework_submissions')
      .update({
        status,
        teacher_id: profile.id,
        teacher_feedback: feedback,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', selectedHomework.id);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      await fetch(`${supabaseUrl}/functions/v1/send-homework-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          studentEmail: selectedHomework.student.email,
          studentName: selectedHomework.student.full_name || 'Ученик',
          lessonTitle: selectedHomework.lesson.title,
          courseTitle: selectedHomework.lesson.module?.course?.title || '',
          status,
          feedback: feedback
        }),
      });
    } catch (e) {
      console.error('Failed to send notification:', e);
    }

    setSelectedHomework(null);
    setFeedback('');
    setSubmitting(false);
    loadHomework();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; border: string; color: string }> = {
      pending: { bg: 'rgba(255, 165, 0, 0.2)', border: '#ffa500', color: '#ffa500' },
      approved: { bg: 'rgba(57, 255, 20, 0.2)', border: 'var(--neon-green)', color: 'var(--neon-green)' },
      rejected: { bg: 'rgba(255, 0, 110, 0.2)', border: 'var(--neon-pink)', color: 'var(--neon-pink)' }
    };
    const style = styles[status] || styles.pending;
    const labels: Record<string, string> = {
      pending: 'На проверке',
      approved: 'Принято',
      rejected: 'На доработку'
    };

    return (
      <span style={{
        padding: '4px 10px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '4px',
        color: style.color,
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase'
      }}>
        {labels[status] || status}
      </span>
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            margin: 0
          }} className="glitch" data-text="УЧИТЕЛЬСКАЯ">
            <span className="neon-text">УЧИТЕЛЬСКАЯ</span>
          </h1>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="cyber-button"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                background: 'rgba(0, 255, 249, 0.2)',
                border: '2px solid var(--neon-cyan)'
              }}
            >
              ЛИЧНЫЙ КАБИНЕТ
            </button>
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
            onClick={() => setActiveTab('homework')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'homework' ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'homework' ? '3px solid var(--neon-cyan)' : '3px solid transparent',
              color: activeTab === 'homework' ? 'var(--neon-cyan)' : 'var(--text-primary)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Домашние задания
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'students' ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'students' ? '3px solid var(--neon-cyan)' : '3px solid transparent',
              color: activeTab === 'students' ? 'var(--neon-cyan)' : 'var(--text-primary)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Ученики
          </button>
        </div>

        {activeTab === 'homework' && (
          <div>
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Статус
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 255, 249, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '14px',
                    minWidth: '160px'
                  }}
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">На проверке</option>
                  <option value="approved">Принятые</option>
                  <option value="rejected">На доработку</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Курс
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 255, 249, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '14px',
                    minWidth: '200px'
                  }}
                >
                  <option value="all">Все курсы</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
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
            ) : homework.length === 0 ? (
              <div className="cyber-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>📝</div>
                <h3 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--neon-cyan)' }}>
                  Нет домашних заданий
                </h3>
                <p style={{ fontSize: '16px', opacity: 0.7 }}>
                  {filterStatus === 'pending'
                    ? 'Нет заданий, ожидающих проверки'
                    : 'Домашние задания с выбранными фильтрами не найдены'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {homework.map(hw => (
                  <div
                    key={hw.id}
                    className="cyber-card"
                    style={{
                      padding: '20px 24px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onClick={() => {
                      setSelectedHomework(hw);
                      setFeedback(hw.teacher_feedback || '');
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '10px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(0, 255, 249, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'var(--neon-cyan)'
                          }}>
                            {hw.student?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '15px' }}>
                              {hw.student?.full_name || 'Ученик'}
                            </p>
                            <p style={{ fontSize: '13px', opacity: 0.6 }}>
                              {hw.student?.email}
                            </p>
                          </div>
                        </div>

                        <p style={{
                          fontSize: '14px',
                          color: 'var(--neon-cyan)',
                          marginBottom: '6px'
                        }}>
                          {hw.lesson?.module?.course?.title}
                        </p>
                        <p style={{ fontSize: '14px', opacity: 0.8 }}>
                          {hw.lesson?.module?.title} → {hw.lesson?.title}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {getStatusBadge(hw.status)}
                        <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '10px' }}>
                          {formatDate(hw.submitted_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <StudentsList />
        )}
      </div>

      {selectedHomework && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px 20px',
            overflowY: 'auto',
          }}
          onClick={() => setSelectedHomework(null)}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(19, 19, 26, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '20px',
                  color: 'var(--neon-cyan)',
                  marginBottom: '8px'
                }}>
                  Проверка домашнего задания
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  {selectedHomework.lesson?.module?.course?.title} → {selectedHomework.lesson?.module?.title} → {selectedHomework.lesson?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedHomework(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '28px',
                  cursor: 'pointer',
                  opacity: 0.7
                }}
              >
                x
              </button>
            </div>

            <div style={{
              background: 'rgba(0, 255, 249, 0.05)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '6px' }}>Ученик</p>
              <p style={{ fontWeight: 600 }}>
                {selectedHomework.student?.full_name || 'Ученик'} ({selectedHomework.student?.email})
              </p>
              <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px' }}>
                Отправлено: {formatDate(selectedHomework.submitted_at)}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '13px',
                opacity: 0.7,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Задание
              </p>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '14px'
              }}>
                {selectedHomework.lesson?.homework_description || 'Описание задания отсутствует'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '13px',
                opacity: 0.7,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Ответ ученика
              </p>
              <div style={{
                background: 'rgba(0, 255, 249, 0.05)',
                border: '1px solid rgba(0, 255, 249, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '15px',
                minHeight: '100px'
              }}>
                {selectedHomework.answer_text}
              </div>
            </div>

            {selectedHomework.attachments && selectedHomework.attachments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '13px',
                  opacity: 0.7,
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Приложения ({selectedHomework.attachments.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {selectedHomework.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(0, 255, 249, 0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-cyan)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.2)'}
                    >
                      {att.type === 'image' ? (
                        <div>
                          <img
                            src={att.url}
                            alt={att.name || 'Screenshot'}
                            style={{
                              width: '180px',
                              height: '120px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <div style={{
                            padding: '8px 10px',
                            fontSize: '12px',
                            opacity: 0.8,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px'
                          }}>
                            {att.name || 'Скриншот'}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          maxWidth: '250px'
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <span style={{
                            color: 'var(--neon-cyan)',
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {att.name || att.url}
                          </span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--neon-cyan)'
              }}>
                Комментарий преподавателя
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Напишите комментарий к работе..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(0, 255, 249, 0.3)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '15px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleReview('rejected')}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 0, 110, 0.2)',
                  border: '2px solid var(--neon-pink)',
                  borderRadius: '8px',
                  color: 'var(--neon-pink)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                НА ДОРАБОТКУ
              </button>
              <button
                onClick={() => handleReview('approved')}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(57, 255, 20, 0.2)',
                  border: '2px solid var(--neon-green)',
                  borderRadius: '8px',
                  color: 'var(--neon-green)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                ПРИНЯТЬ
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);

    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        student:profiles!student_enrollments_student_id_fkey(id, email, full_name),
        course:courses!student_enrollments_course_id_fkey(id, title)
      `)
      .order('enrolled_at', { ascending: false });

    const studentMap = new Map<string, Student>();

    enrollments?.forEach((e: StudentEnrollment) => {
      if (!studentMap.has(e.student.id)) {
        studentMap.set(e.student.id, {
          ...e.student,
          courses: []
        });
      }
      studentMap.get(e.student.id).courses.push({
        ...e.course,
        status: e.status,
        enrolled_at: e.enrolled_at
      });
    });

    setStudents(Array.from(studentMap.values()));
    setLoading(false);
  };

  const loadStudentProgress = async (studentId: string) => {
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lesson:course_lessons!lesson_progress_lesson_id_fkey(
          *,
          module:course_modules!course_lessons_module_id_fkey(
            *,
            course:courses!course_modules_course_id_fkey(*)
          )
        )
      `)
      .eq('student_id', studentId);

    const { data: homeworkData } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        lesson:course_lessons!homework_submissions_lesson_id_fkey(
          *,
          module:course_modules!course_lessons_module_id_fkey(
            *,
            course:courses!course_modules_course_id_fkey(*)
          )
        )
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    return { progress: progressData || [], homework: homeworkData || [] };
  };

  if (loading) {
    return (
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
    );
  }

  if (students.length === 0) {
    return (
      <div className="cyber-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>👨‍🎓</div>
        <h3 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--neon-cyan)' }}>
          Нет учеников
        </h3>
        <p style={{ fontSize: '16px', opacity: 0.7 }}>
          Ученики появятся здесь после записи на курсы
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {students.map(student => (
        <div
          key={student.id}
          className="cyber-card"
          style={{
            padding: '24px',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}
          onClick={async () => {
            const data = await loadStudentProgress(student.id);
            setSelectedStudent({ ...student, ...data });
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 249, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '20px',
              color: 'var(--neon-cyan)'
            }}>
              {student.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>
                {student.full_name || 'Ученик'}
              </p>
              <p style={{ fontSize: '13px', opacity: 0.6 }}>
                {student.email}
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {student.courses.map((course: StudentCourse) => (
              <span
                key={course.id}
                style={{
                  padding: '4px 10px',
                  background: course.status === 'completed' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0, 255, 249, 0.2)',
                  border: `1px solid ${course.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: course.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)'
                }}
              >
                {course.title}
              </span>
            ))}
          </div>
        </div>
      ))}

      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px 20px',
            overflowY: 'auto',
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(19, 19, 26, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 249, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: 'var(--neon-cyan)'
                }}>
                  {selectedStudent.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '20px',
                    color: 'var(--neon-cyan)'
                  }}>
                    {selectedStudent.full_name || 'Ученик'}
                  </h2>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '28px',
                  cursor: 'pointer',
                  opacity: 0.7
                }}
              >
                x
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Курсы ({selectedStudent.courses.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {selectedStudent.courses.map((course: StudentCourse) => (
                  <span
                    key={course.id}
                    style={{
                      padding: '8px 14px',
                      background: course.status === 'completed' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0, 255, 249, 0.2)',
                      border: `1px solid ${course.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: course.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)'
                    }}
                  >
                    {course.title}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Прогресс по урокам ({selectedStudent.progress?.filter((p: StudentProgress) => p.is_completed).length || 0} завершено)
              </h3>
              {selectedStudent.progress?.length > 0 ? (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {selectedStudent.progress.filter((p: StudentProgress) => p.is_completed).map((p: StudentProgress) => (
                    <div key={p.id} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '14px'
                    }}>
                      {p.lesson?.module?.course?.title} → {p.lesson?.module?.title} → {p.lesson?.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ opacity: 0.6, fontSize: '14px' }}>Нет завершенных уроков</p>
              )}
            </div>

            <div>
              <h3 style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Домашние задания ({selectedStudent.homework?.length || 0})
              </h3>
              {selectedStudent.homework?.length > 0 ? (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {selectedStudent.homework.map((hw: StudentHomework) => (
                    <div key={hw.id} style={{
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '14px' }}>
                        {hw.lesson?.module?.course?.title} → {hw.lesson?.title}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: hw.status === 'approved' ? 'rgba(57, 255, 20, 0.2)' :
                          hw.status === 'rejected' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(255, 165, 0, 0.2)',
                        color: hw.status === 'approved' ? 'var(--neon-green)' :
                          hw.status === 'rejected' ? 'var(--neon-pink)' : '#ffa500'
                      }}>
                        {hw.status === 'approved' ? 'Принято' : hw.status === 'rejected' ? 'На доработку' : 'На проверке'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ opacity: 0.6, fontSize: '14px' }}>Нет сданных заданий</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
