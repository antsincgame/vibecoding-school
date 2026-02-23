import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { CourseModule, CourseLesson } from '../types';

interface CourseLessonsManagerProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export default function CourseLessonsManager({ courseId, courseTitle, onClose }: CourseLessonsManagerProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Partial<CourseModule> | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Partial<CourseLesson> } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [dragOverModule, setDragOverModule] = useState<string | null>(null);
  const [dragOverLesson, setDragOverLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    setLoading(true);
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (modulesData) {
      const moduleIds = modulesData.map(m => m.id);
      const { data: lessonsData } = await supabase
        .from('course_lessons')
        .select('*')
        .in('module_id', moduleIds.length > 0 ? moduleIds : [''])
        .order('order_index');

      const modulesWithLessons = modulesData.map(module => ({
        ...module,
        lessons: lessonsData?.filter(l => l.module_id === module.id) || []
      }));

      setModules(modulesWithLessons);
      setExpandedModules(new Set(moduleIds));
    }
    setLoading(false);
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

  const saveModule = async () => {
    if (!editingModule?.title) return;

    if (editingModule.id) {
      await supabase
        .from('course_modules')
        .update({ title: editingModule.title })
        .eq('id', editingModule.id);
    } else {
      await supabase.from('course_modules').insert({
        course_id: courseId,
        title: editingModule.title,
        order_index: modules.length
      });
    }

    setEditingModule(null);
    loadModules();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Удалить модуль и все его уроки?')) return;
    await supabase.from('course_modules').delete().eq('id', id);
    loadModules();
  };

  const saveLesson = async () => {
    if (!editingLesson?.lesson?.title) return;

    const lesson = editingLesson.lesson;
    if (lesson.id) {
      await supabase
        .from('course_lessons')
        .update({
          title: lesson.title,
          duration: lesson.duration || '00:00',
          youtube_url: lesson.youtube_url || '',
          kinescope_embed: lesson.kinescope_embed || '',
          homework_description: lesson.homework_description || ''
        })
        .eq('id', lesson.id);
    } else {
      const module = modules.find(m => m.id === editingLesson.moduleId);
      const lessonsCount = module?.lessons?.length || 0;
      await supabase.from('course_lessons').insert({
        module_id: editingLesson.moduleId,
        title: lesson.title,
        duration: lesson.duration || '00:00',
        youtube_url: lesson.youtube_url || '',
        kinescope_embed: lesson.kinescope_embed || '',
        homework_description: lesson.homework_description || '',
        order_index: lessonsCount
      });
    }

    setEditingLesson(null);
    loadModules();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Удалить урок?')) return;
    await supabase.from('course_lessons').delete().eq('id', id);
    loadModules();
  };

  const handleModuleDragStart = (moduleId: string) => {
    setDraggedModule(moduleId);
  };

  const handleModuleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault();
    if (draggedModule && draggedModule !== moduleId) {
      setDragOverModule(moduleId);
    }
  };

  const handleModuleDrop = async (targetModuleId: string) => {
    if (!draggedModule || draggedModule === targetModuleId) {
      setDraggedModule(null);
      setDragOverModule(null);
      return;
    }

    const draggedIndex = modules.findIndex(m => m.id === draggedModule);
    const targetIndex = modules.findIndex(m => m.id === targetModuleId);

    const newModules = [...modules];
    const [removed] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, removed);

    setModules(newModules);
    setDraggedModule(null);
    setDragOverModule(null);

    for (let i = 0; i < newModules.length; i++) {
      await supabase
        .from('course_modules')
        .update({ order_index: i })
        .eq('id', newModules[i].id);
    }
  };

  const handleLessonDragStart = (moduleId: string, lessonId: string) => {
    setDraggedLesson({ moduleId, lessonId });
  };

  const handleLessonDragOver = (e: React.DragEvent, moduleId: string, lessonId: string) => {
    e.preventDefault();
    if (draggedLesson && (draggedLesson.moduleId !== moduleId || draggedLesson.lessonId !== lessonId)) {
      setDragOverLesson({ moduleId, lessonId });
    }
  };

  const handleLessonDrop = async (targetModuleId: string, targetLessonId: string) => {
    if (!draggedLesson) {
      setDraggedLesson(null);
      setDragOverLesson(null);
      return;
    }

    const sourceModule = modules.find(m => m.id === draggedLesson.moduleId);
    const targetModule = modules.find(m => m.id === targetModuleId);

    if (!sourceModule || !targetModule) {
      setDraggedLesson(null);
      setDragOverLesson(null);
      return;
    }

    const sourceLessons = [...(sourceModule.lessons || [])];
    const sourceIndex = sourceLessons.findIndex(l => l.id === draggedLesson.lessonId);
    const [movedLesson] = sourceLessons.splice(sourceIndex, 1);

    if (draggedLesson.moduleId === targetModuleId) {
      const targetIndex = sourceLessons.findIndex(l => l.id === targetLessonId);
      sourceLessons.splice(targetIndex, 0, movedLesson);

      const newModules = modules.map(m => {
        if (m.id === targetModuleId) {
          return { ...m, lessons: sourceLessons };
        }
        return m;
      });
      setModules(newModules);

      for (let i = 0; i < sourceLessons.length; i++) {
        await supabase
          .from('course_lessons')
          .update({ order_index: i })
          .eq('id', sourceLessons[i].id);
      }
    } else {
      const targetLessons = [...(targetModule.lessons || [])];
      const targetIndex = targetLessons.findIndex(l => l.id === targetLessonId);
      targetLessons.splice(targetIndex, 0, { ...movedLesson, module_id: targetModuleId });

      const newModules = modules.map(m => {
        if (m.id === draggedLesson.moduleId) {
          return { ...m, lessons: sourceLessons };
        }
        if (m.id === targetModuleId) {
          return { ...m, lessons: targetLessons };
        }
        return m;
      });
      setModules(newModules);

      await supabase
        .from('course_lessons')
        .update({ module_id: targetModuleId })
        .eq('id', movedLesson.id);

      for (let i = 0; i < sourceLessons.length; i++) {
        await supabase
          .from('course_lessons')
          .update({ order_index: i })
          .eq('id', sourceLessons[i].id);
      }

      for (let i = 0; i < targetLessons.length; i++) {
        await supabase
          .from('course_lessons')
          .update({ order_index: i })
          .eq('id', targetLessons[i].id);
      }
    }

    setDraggedLesson(null);
    setDragOverLesson(null);
  };

  const getTotalDuration = (lessons: CourseLesson[]) => {
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

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(0, 255, 249, 0.3)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '15px',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
  };

  const buttonPrimary = {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, var(--neon-cyan) 0%, #00b8b8 100%)',
    color: 'var(--bg-dark)',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
  };

  const buttonSecondary = {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid rgba(0, 255, 249, 0.5)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  };

  const buttonDanger = {
    padding: '8px 14px',
    background: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid rgba(255, 107, 107, 0.5)',
    borderRadius: '6px',
    color: '#ff6b6b',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  };

  return (
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
    >
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(19, 19, 26, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)',
          border: '2px solid var(--neon-cyan)',
          borderRadius: '16px',
          padding: '0',
          maxWidth: '900px',
          width: '100%',
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0, 255, 249, 0.2)',
        }}
      >
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid rgba(0, 255, 249, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 255, 249, 0.05)',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '22px',
              color: 'var(--neon-cyan)',
              margin: 0,
            }}>
              Программа курса
            </h2>
            <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '14px' }}>
              {courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '5px',
              opacity: 0.7,
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: '24px 30px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setEditingModule({ title: '', order_index: modules.length })}
              style={buttonPrimary}
            >
              + Добавить модуль
            </button>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>
              Перетаскивайте модули и уроки для изменения порядка
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              Загрузка...
            </div>
          ) : modules.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px dashed rgba(0, 255, 249, 0.3)',
            }}>
              <p style={{ fontSize: '16px', opacity: 0.7 }}>
                Пока нет модулей. Добавьте первый модуль для курса.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  draggable
                  onDragStart={() => handleModuleDragStart(module.id)}
                  onDragOver={(e) => handleModuleDragOver(e, module.id)}
                  onDrop={() => handleModuleDrop(module.id)}
                  onDragEnd={() => { setDraggedModule(null); setDragOverModule(null); }}
                  style={{
                    background: dragOverModule === module.id ? 'rgba(0, 255, 249, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                    border: dragOverModule === module.id ? '2px solid var(--neon-cyan)' : '1px solid rgba(0, 255, 249, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    opacity: draggedModule === module.id ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: expandedModules.has(module.id) ? 'rgba(0, 255, 249, 0.08)' : 'transparent',
                      cursor: 'grab',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, cursor: 'pointer' }}
                      onClick={() => toggleModule(module.id)}
                    >
                      <span style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--neon-cyan)',
                        color: 'var(--bg-dark)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}>
                        {moduleIndex + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{module.title}</div>
                        <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>
                          {module.lessons?.length || 0} уроков / {getTotalDuration(module.lessons || [])}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setEditingModule(module); }}
                        style={{ ...buttonSecondary, padding: '6px 12px', fontSize: '13px' }}
                      >
                        Изменить
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteModule(module.id); }}
                        style={{ ...buttonDanger, padding: '6px 12px' }}
                      >
                        Удалить
                      </button>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        onClick={() => toggleModule(module.id)}
                        style={{
                          transform: expandedModules.has(module.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          opacity: 0.5,
                          cursor: 'pointer',
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  {expandedModules.has(module.id) && (
                    <div style={{ borderTop: '1px solid rgba(0, 255, 249, 0.1)' }}>
                      {module.lessons && module.lessons.length > 0 ? (
                        <div>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              draggable
                              onDragStart={(e) => { e.stopPropagation(); handleLessonDragStart(module.id, lesson.id); }}
                              onDragOver={(e) => { e.stopPropagation(); handleLessonDragOver(e, module.id, lesson.id); }}
                              onDrop={(e) => { e.stopPropagation(); handleLessonDrop(module.id, lesson.id); }}
                              onDragEnd={() => { setDraggedLesson(null); setDragOverLesson(null); }}
                              style={{
                                padding: '14px 20px 14px 62px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: dragOverLesson?.lessonId === lesson.id ? 'rgba(0, 255, 249, 0.1)' : 'transparent',
                                opacity: draggedLesson?.lessonId === lesson.id ? 0.5 : 1,
                                cursor: 'grab',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <span style={{
                                  width: '24px',
                                  height: '24px',
                                  background: 'rgba(57, 255, 20, 0.2)',
                                  color: 'var(--neon-green)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}>
                                  {lessonIndex + 1}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{lesson.title}</div>
                                  <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', gap: '12px', marginTop: '2px' }}>
                                    <span>{lesson.duration}</span>
                                    {lesson.kinescope_embed && <span style={{ color: 'var(--neon-cyan)' }}>Kinescope</span>}
                                    {lesson.youtube_url && <span style={{ color: '#ff0000' }}>YouTube</span>}
                                    {lesson.homework_description && <span style={{ color: 'var(--neon-green)' }}>ДЗ</span>}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingLesson({ moduleId: module.id, lesson }); }}
                                  style={{ ...buttonSecondary, padding: '5px 10px', fontSize: '12px' }}
                                >
                                  Изменить
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}
                                  style={{ ...buttonDanger, padding: '5px 10px', fontSize: '12px' }}
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: '20px 20px 20px 62px',
                          fontSize: '14px',
                          opacity: 0.5,
                          fontStyle: 'italic',
                        }}>
                          В этом модуле пока нет уроков
                        </div>
                      )}
                      <div style={{ padding: '12px 20px 16px 62px' }}>
                        <button
                          onClick={() => setEditingLesson({
                            moduleId: module.id,
                            lesson: {
                              title: '',
                              duration: '00:00',
                              youtube_url: '',
                              kinescope_embed: '',
                              homework_description: '',
                              order_index: module.lessons?.length || 0
                            }
                          })}
                          style={{
                            ...buttonSecondary,
                            padding: '8px 14px',
                            fontSize: '13px',
                            borderStyle: 'dashed',
                          }}
                        >
                          + Добавить урок
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingModule && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', marginBottom: '20px' }}>
              {editingModule.id ? 'Редактировать модуль' : 'Новый модуль'}
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                Название модуля
              </label>
              <input
                type="text"
                value={editingModule.title || ''}
                onChange={e => setEditingModule({ ...editingModule, title: e.target.value })}
                placeholder="Например: Введение"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveModule} style={buttonPrimary}>
                Сохранить
              </button>
              <button onClick={() => setEditingModule(null)} style={buttonSecondary}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLesson && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '40px 20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '700px',
              width: '100%',
            }}
          >
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', marginBottom: '20px' }}>
              {editingLesson.lesson.id ? 'Редактировать урок' : 'Новый урок'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                Название урока *
              </label>
              <input
                type="text"
                value={editingLesson.lesson.title || ''}
                onChange={e => setEditingLesson({
                  ...editingLesson,
                  lesson: { ...editingLesson.lesson, title: e.target.value }
                })}
                placeholder="Например: Установка и первый запуск"
                style={inputStyle}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                Длительность
              </label>
              <input
                type="text"
                value={editingLesson.lesson.duration || ''}
                onChange={e => setEditingLesson({
                  ...editingLesson,
                  lesson: { ...editingLesson.lesson, duration: e.target.value }
                })}
                placeholder="MM:SS"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                Kinescope Embed код
              </label>
              <textarea
                value={editingLesson.lesson.kinescope_embed || ''}
                onChange={e => setEditingLesson({
                  ...editingLesson,
                  lesson: { ...editingLesson.lesson, kinescope_embed: e.target.value }
                })}
                placeholder='<iframe src="https://kinescope.io/embed/..." ...></iframe>'
                style={textareaStyle}
              />
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
                Вставьте полный embed код из Kinescope
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                YouTube URL (альтернатива)
              </label>
              <input
                type="text"
                value={editingLesson.lesson.youtube_url || ''}
                onChange={e => setEditingLesson({
                  ...editingLesson,
                  lesson: { ...editingLesson.lesson, youtube_url: e.target.value }
                })}
                placeholder="https://www.youtube.com/watch?v=..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                Домашнее задание
              </label>
              <textarea
                value={editingLesson.lesson.homework_description || ''}
                onChange={e => setEditingLesson({
                  ...editingLesson,
                  lesson: { ...editingLesson.lesson, homework_description: e.target.value }
                })}
                placeholder="Опишите задание для ученика..."
                style={{ ...textareaStyle, minHeight: '120px' }}
              />
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
                Если заполнено, ученик должен выполнить задание для перехода к следующему уроку
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveLesson} style={buttonPrimary}>
                Сохранить
              </button>
              <button onClick={() => setEditingLesson(null)} style={buttonSecondary}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
