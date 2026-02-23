import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { CourseLesson, CourseModule, Course, LessonProgress, HomeworkSubmission, HomeworkAttachment } from '../types';

interface NavigationLesson {
  id: string;
  title: string;
  moduleTitle: string;
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [module, setModule] = useState<CourseModule | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [homework, setHomework] = useState<HomeworkSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [homeworkAnswer, setHomeworkAnswer] = useState('');
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prevLesson, setPrevLesson] = useState<NavigationLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<NavigationLesson | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && lessonId) {
      loadLesson();
    }
  }, [profile, lessonId]);

  const loadLesson = async () => {
    if (!profile || !lessonId) return;
    setLoading(true);
    setError(null);

    try {
    const { data: lessonData, error: lessonError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError) {
      setError('Не удалось загрузить урок');
      setLoading(false);
      return;
    }

    if (!lessonData) {
      navigate('/student/dashboard');
      return;
    }

    setLesson(lessonData);

    const { data: moduleData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', lessonData.module_id)
      .maybeSingle();

    if (!moduleData) {
      navigate('/student/dashboard');
      return;
    }

    setModule(moduleData);

    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', moduleData.course_id)
      .maybeSingle();

    setCourse(courseData);

    const { data: enrollmentData } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('student_id', profile.id)
      .eq('course_id', moduleData.course_id)
      .maybeSingle();

    if (!enrollmentData) {
      navigate('/student/dashboard');
      return;
    }

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', profile.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    setProgress(progressData);

    const { data: homeworkData } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('student_id', profile.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    setHomework(homeworkData);
    if (homeworkData) {
      if (homeworkData.status === 'rejected') {
        setHomeworkAnswer('');
        setAttachments([]);
      } else {
        setHomeworkAnswer(homeworkData.answer_text);
        setAttachments(homeworkData.attachments || []);
      }
    } else {
      setHomeworkAnswer('');
      setAttachments([]);
    }

    const { data: allModules } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', moduleData.course_id)
      .order('order_index');

    const { data: allLessons } = await supabase
      .from('course_lessons')
      .select('*')
      .in('module_id', allModules?.map(m => m.id) || [])
      .order('order_index');

    const { data: allProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', profile.id);

    const { data: allHomework } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('student_id', profile.id);

    const sortedLessons: { lesson: CourseLesson; module: CourseModule }[] = [];
    allModules?.sort((a, b) => a.order_index - b.order_index).forEach(mod => {
      const modLessons = allLessons?.filter(l => l.module_id === mod.id).sort((a, b) => a.order_index - b.order_index) || [];
      modLessons.forEach(l => {
        sortedLessons.push({ lesson: l, module: mod });
      });
    });

    const currentIndex = sortedLessons.findIndex(sl => sl.lesson.id === lessonId);

    let unlocked = true;
    const homeworkOptional = courseData?.homework_optional || false;
    for (let i = 0; i < currentIndex; i++) {
      const prevL = sortedLessons[i].lesson;
      const prevProg = allProgress?.find(p => p.lesson_id === prevL.id);
      const prevHw = allHomework?.find(h => h.lesson_id === prevL.id);
      const hasHomework = prevL.homework_description && prevL.homework_description.trim() !== '';

      if (!prevProg?.is_completed) {
        unlocked = false;
        break;
      }
      if (hasHomework && !homeworkOptional && prevHw?.status !== 'approved') {
        unlocked = false;
        break;
      }
    }

    setIsUnlocked(unlocked);

    if (currentIndex > 0) {
      const prev = sortedLessons[currentIndex - 1];
      setPrevLesson({
        id: prev.lesson.id,
        title: prev.lesson.title,
        moduleTitle: prev.module.title
      });
    } else {
      setPrevLesson(null);
    }

    if (currentIndex < sortedLessons.length - 1) {
      const next = sortedLessons[currentIndex + 1];
      const nextProg = allProgress?.find(p => p.lesson_id === lessonData.id);
      const nextHw = allHomework?.find(h => h.lesson_id === lessonData.id);
      const hasHomework = lessonData.homework_description && lessonData.homework_description.trim() !== '';
      const canGoNext = nextProg?.is_completed && (!hasHomework || homeworkOptional || nextHw?.status === 'approved');

      if (canGoNext) {
        setNextLesson({
          id: next.lesson.id,
          title: next.lesson.title,
          moduleTitle: next.module.title
        });
      } else {
        setNextLesson(null);
      }
    } else {
      setNextLesson(null);
    }

    setLoading(false);
    } catch {
      setError('Произошла ошибка при загрузке урока');
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!profile || !lessonId) return;

    if (progress) {
      await supabase
        .from('lesson_progress')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', progress.id);
    } else {
      await supabase.from('lesson_progress').insert({
        student_id: profile.id,
        lesson_id: lessonId,
        is_completed: true,
        is_unlocked: true,
        completed_at: new Date().toISOString()
      });
    }

    loadLesson();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('homework-attachments')
      .upload(fileName, file);

    if (uploadError) {
      alert('Не удалось загрузить изображение. Попробуйте еще раз.');
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('homework-attachments')
      .getPublicUrl(fileName);

    setAttachments(prev => [...prev, {
      type: 'image',
      url: urlData.publicUrl,
      name: file.name
    }]);
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    setAttachments(prev => [...prev, {
      type: 'link',
      url: newLinkUrl.trim(),
      name: newLinkName.trim() || newLinkUrl.trim()
    }]);
    setNewLinkUrl('');
    setNewLinkName('');
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const submitHomework = async () => {
    if (!profile || !lessonId || !homeworkAnswer.trim()) return;
    setSubmitting(true);

    if (homework) {
      const oldAttachments = homework.attachments || [];
      for (const att of oldAttachments) {
        if (att.type === 'image' && att.url.includes('homework-attachments')) {
          const pathMatch = att.url.match(/homework-attachments\/(.+)$/);
          if (pathMatch) {
            await supabase.storage.from('homework-attachments').remove([pathMatch[1]]);
          }
        }
      }

      const { error } = await supabase
        .from('homework_submissions')
        .update({
          answer_text: homeworkAnswer,
          attachments: attachments,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          teacher_feedback: '',
          teacher_id: null,
          reviewed_at: null
        })
        .eq('id', homework.id);

      if (error) {
        alert('Не удалось отправить домашнее задание. Попробуйте еще раз.');
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.from('homework_submissions').insert({
        student_id: profile.id,
        lesson_id: lessonId,
        answer_text: homeworkAnswer,
        attachments: attachments,
        status: 'pending'
      });

      if (error) {
        alert('Не удалось отправить домашнее задание. Попробуйте еще раз.');
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    loadLesson();
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
        <button onClick={() => loadLesson()} className="cyber-button">
          ПОПРОБОВАТЬ СНОВА
        </button>
      </div>
    );
  }

  if (!lesson || !module || !course || !isUnlocked) {
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
        <div style={{ fontSize: '60px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>Урок заблокирован</h2>
        <p style={{ opacity: 0.7, textAlign: 'center' }}>
          Завершите предыдущие уроки и получите одобрение домашних заданий, чтобы разблокировать этот урок.
        </p>
        <button
          onClick={() => navigate(`/student/course/${course?.slug || course?.id}`)}
          className="cyber-button"
        >
          ВЕРНУТЬСЯ К КУРСУ
        </button>
      </div>
    );
  }

  const hasHomework = lesson.homework_description && lesson.homework_description.trim() !== '';
  const canSubmitHomework = !homework || homework.status === 'rejected';

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '60px'
    }}>
      <div style={{
        background: 'rgba(0, 255, 249, 0.05)',
        padding: '20px',
        borderBottom: '1px solid rgba(0, 255, 249, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(`/student/course/${course.slug || course.id}`)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neon-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontFamily: 'Rajdhani, sans-serif'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            {course.title}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>
            {module.title}
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--neon-cyan)' }}>
            {lesson.title}
          </h1>
        </div>

        <div style={{
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '30px',
          aspectRatio: lesson.kinescope_embed ? undefined : '16/9',
          border: '2px solid rgba(0, 255, 249, 0.2)'
        }}>
          {lesson.kinescope_embed ? (
            <div
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.kinescope_embed, {
                ALLOWED_TAGS: ['iframe', 'div', 'script'],
                ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style', 'class', 'id', 'data-*'],
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allowfullscreen', 'allow']
              }) }}
              style={{ width: '100%' }}
            />
          ) : lesson.youtube_url ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.youtube_url)}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--neon-cyan)',
              opacity: 0.5
            }}>
              Видео недоступно
            </div>
          )}
        </div>

        {!progress?.is_completed && (
          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={markAsCompleted}
              className="cyber-button"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px'
              }}
            >
              ОТМЕТИТЬ КАК ПРОСМОТРЕННЫЙ
            </button>
          </div>
        )}

        {progress?.is_completed && (
          <div style={{
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid var(--neon-green)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
              Урок просмотрен
            </span>
          </div>
        )}

        {hasHomework && (
          <div className="cyber-card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '20px',
              marginBottom: '20px',
              color: 'var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Домашнее задание
            </h3>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}>
              {lesson.homework_description}
            </div>

            {homework?.status === 'approved' && (
              <div style={{
                background: 'rgba(57, 255, 20, 0.1)',
                border: '1px solid var(--neon-green)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  color: 'var(--neon-green)',
                  fontWeight: 600
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                  Задание принято
                </div>
                {homework.attachments && homework.attachments.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>Приложения:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {homework.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 255, 249, 0.2)',
                            borderRadius: '6px',
                            color: 'var(--neon-cyan)',
                            textDecoration: 'none',
                            fontSize: '13px'
                          }}
                        >
                          {att.type === 'image' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21,15 16,10 5,21" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                          )}
                          {att.name || (att.type === 'image' ? 'Скриншот' : 'Ссылка')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {homework.teacher_feedback && (
                  <div>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>Комментарий преподавателя:</p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{homework.teacher_feedback}</p>
                  </div>
                )}
              </div>
            )}

            {homework?.status === 'pending' && (
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '1px solid #ffa500',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffa500',
                  fontWeight: 600,
                  marginBottom: homework.attachments && homework.attachments.length > 0 ? '12px' : 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  Ваш ответ на проверке
                </div>
                {homework.attachments && homework.attachments.length > 0 && (
                  <div>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>Приложения:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {homework.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 255, 249, 0.2)',
                            borderRadius: '6px',
                            color: 'var(--neon-cyan)',
                            textDecoration: 'none',
                            fontSize: '13px'
                          }}
                        >
                          {att.type === 'image' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21,15 16,10 5,21" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                          )}
                          {att.name || (att.type === 'image' ? 'Скриншот' : 'Ссылка')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {homework?.status === 'rejected' && (
              <div style={{
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid var(--neon-pink)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--neon-pink)',
                    fontWeight: 600
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Требуется доработка
                  </div>
                  {homework.reviewed_at && (
                    <span style={{ fontSize: '13px', opacity: 0.6 }}>
                      {new Date(homework.reviewed_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                {homework.teacher_feedback && (
                  <div>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>Комментарий преподавателя:</p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{homework.teacher_feedback}</p>
                  </div>
                )}
              </div>
            )}

            {canSubmitHomework && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--neon-cyan)'
                }}>
                  Ваш ответ
                </label>
                <textarea
                  value={homeworkAnswer}
                  onChange={(e) => setHomeworkAnswer(e.target.value)}
                  placeholder="Введите ваш ответ на задание..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 255, 249, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '15px',
                    resize: 'vertical',
                    marginBottom: '16px'
                  }}
                />

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--neon-cyan)'
                  }}>
                    Скриншоты и ссылки (опционально)
                  </label>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(0, 255, 249, 0.1)',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '6px',
                        color: 'var(--neon-cyan)',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: uploadingImage ? 0.5 : 1
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                      {uploadingImage ? 'Загрузка...' : 'Добавить скриншот'}
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(0, 255, 249, 0.3)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                      <input
                        type="text"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        placeholder="Название (опц.)"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(0, 255, 249, 0.3)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addLink}
                      disabled={!newLinkUrl.trim()}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(0, 255, 249, 0.1)',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '6px',
                        color: 'var(--neon-cyan)',
                        cursor: newLinkUrl.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: newLinkUrl.trim() ? 1 : 0.5
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      Добавить ссылку
                    </button>
                  </div>

                  {attachments.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginTop: '16px'
                    }}>
                      {attachments.map((att, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 255, 249, 0.2)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}
                        >
                          {att.type === 'image' ? (
                            <div style={{ width: '120px' }}>
                              <img
                                src={att.url}
                                alt={att.name || 'Screenshot'}
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  objectFit: 'cover'
                                }}
                              />
                              <div style={{
                                padding: '6px 8px',
                                fontSize: '11px',
                                opacity: 0.7,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {att.name || 'Screenshot'}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              maxWidth: '200px'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'var(--neon-cyan)',
                                  fontSize: '13px',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {att.name || att.url}
                              </a>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              background: 'rgba(255, 0, 110, 0.8)',
                              border: 'none',
                              borderRadius: '50%',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              lineHeight: 1
                            }}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={submitHomework}
                  disabled={submitting || !homeworkAnswer.trim()}
                  className="cyber-button"
                  style={{
                    opacity: submitting || !homeworkAnswer.trim() ? 0.5 : 1,
                    cursor: submitting || !homeworkAnswer.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'ОТПРАВКА...' : homework ? 'ОТПРАВИТЬ ПОВТОРНО' : 'ОТПРАВИТЬ НА ПРОВЕРКУ'}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {prevLesson ? (
            <button
              onClick={() => navigate(`/student/lesson/${prevLesson.id}`)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 249, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Rajdhani, sans-serif',
                color: 'var(--text-primary)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 255, 249, 0.3)'}
            >
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '6px' }}>
                Предыдущий урок
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>
                {prevLesson.title}
              </div>
            </button>
          ) : (
            <div style={{ flex: 1, minWidth: '200px' }} />
          )}

          {nextLesson ? (
            <button
              onClick={() => navigate(`/student/lesson/${nextLesson.id}`)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px 20px',
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'right',
                fontFamily: 'Rajdhani, sans-serif',
                color: 'var(--text-primary)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 255, 249, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 255, 249, 0.1)'}
            >
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '6px' }}>
                Следующий урок
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>
                {nextLesson.title}
              </div>
            </button>
          ) : hasHomework && homework?.status !== 'approved' ? (
            <div style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px 20px',
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid #ffa500',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#ffa500' }}>
                Сдайте домашнее задание, чтобы открыть следующий урок
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: '200px' }} />
          )}
        </div>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(0, 136, 204, 0.1)',
          border: '1px solid #0088cc',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '15px', fontSize: '15px' }}>
            Возникли вопросы по уроку? Задайте их в нашем чате поддержки
          </p>
          <a
            href="https://t.me/vibecodingby"
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              background: 'rgba(0, 136, 204, 0.3)',
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
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : '';
}
