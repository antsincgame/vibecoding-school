import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LessonFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  description: string;
}

interface Lesson {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  order_index: number;
  duration_minutes: number;
  difficulty_level: string;
  is_published: boolean;
  files?: LessonFile[];
}

export default function LessonsManager() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index');

    if (lessonsData) {
      const lessonIds = lessonsData.map((l) => l.id);
      const { data: filesData } = await supabase
        .from('lesson_files')
        .select('*')
        .in('lesson_id', lessonIds);

      const lessonsWithFiles = lessonsData.map((lesson) => ({
        ...lesson,
        files: filesData?.filter((f) => f.lesson_id === lesson.id) || [],
      }));

      setLessons(lessonsWithFiles);
    }
  };

  const extractYouTubeVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return url;
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    try {
      const videoId = extractYouTubeVideoId(editingLesson.youtube_url);

      if (editingLesson.id) {
        await supabase
          .from('lessons')
          .update({
            title: editingLesson.title,
            description: editingLesson.description,
            youtube_url: editingLesson.youtube_url,
            youtube_video_id: videoId,
            order_index: editingLesson.order_index,
            duration_minutes: editingLesson.duration_minutes,
            difficulty_level: editingLesson.difficulty_level,
            is_published: editingLesson.is_published,
          })
          .eq('id', editingLesson.id);
      } else {
        await supabase.from('lessons').insert({
          title: editingLesson.title,
          description: editingLesson.description,
          youtube_url: editingLesson.youtube_url,
          youtube_video_id: videoId,
          order_index: editingLesson.order_index,
          duration_minutes: editingLesson.duration_minutes,
          difficulty_level: editingLesson.difficulty_level,
          is_published: editingLesson.is_published,
        });
      }

      setEditingLesson(null);
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Ошибка при сохранении урока');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Удалить урок?')) return;

    try {
      await supabase.from('lessons').delete().eq('id', id);
      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleFileUpload = async (lessonId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles({ ...uploadingFiles, [lessonId]: true });

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${lessonId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('lesson-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('lesson-files')
          .getPublicUrl(filePath);

        await supabase.from('lesson_files').insert({
          lesson_id: lessonId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          description: '',
        });
      }

      loadLessons();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setUploadingFiles({ ...uploadingFiles, [lessonId]: false });
    }
  };

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    if (!confirm('Удалить файл?')) return;

    try {
      const path = fileUrl.split('/lesson-files/')[1];
      if (path) {
        await supabase.storage.from('lesson-files').remove([path]);
      }

      await supabase.from('lesson_files').delete().eq('id', fileId);
      loadLessons();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--neon-cyan)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '14px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: 'var(--neon-cyan)',
    color: 'var(--bg-dark)',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px' }}>
          Управление уроками
        </h2>
        <button
          onClick={() =>
            setEditingLesson({
              title: '',
              description: '',
              youtube_url: '',
              youtube_video_id: '',
              order_index: lessons.length,
              duration_minutes: 0,
              difficulty_level: 'beginner',
              is_published: false,
            })
          }
          style={buttonStyle}
        >
          Добавить урок
        </button>
      </div>

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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setEditingLesson(null)}
        >
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
              {editingLesson.id ? 'Редактировать урок' : 'Новый урок'}
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Название
              </label>
              <input
                type="text"
                value={editingLesson.title}
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Описание
              </label>
              <textarea
                value={editingLesson.description}
                onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                YouTube URL
              </label>
              <input
                type="text"
                value={editingLesson.youtube_url}
                onChange={(e) => setEditingLesson({ ...editingLesson, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Порядок
                </label>
                <input
                  type="number"
                  value={editingLesson.order_index}
                  onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Длительность (мин)
                </label>
                <input
                  type="number"
                  value={editingLesson.duration_minutes}
                  onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Уровень сложности
              </label>
              <select
                value={editingLesson.difficulty_level}
                onChange={(e) => setEditingLesson({ ...editingLesson, difficulty_level: e.target.value })}
                style={inputStyle}
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editingLesson.is_published}
                  onChange={(e) => setEditingLesson({ ...editingLesson, is_published: e.target.checked })}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontWeight: 600 }}>Опубликовано</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveLesson} style={buttonStyle}>
                Сохранить
              </button>
              <button
                onClick={() => setEditingLesson(null)}
                style={{
                  ...buttonStyle,
                  background: 'transparent',
                  border: '1px solid var(--neon-cyan)',
                  color: 'var(--text-primary)',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--neon-cyan)',
              borderRadius: '4px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', marginBottom: '5px', fontWeight: 600 }}>
                  {lesson.title}
                  {!lesson.is_published && (
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: '#ff6b6b' }}>
                      (Черновик)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  {lesson.description.substring(0, 100)}...
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Порядок: {lesson.order_index} | Длительность: {lesson.duration_minutes} мин | Уровень: {lesson.difficulty_level}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setEditingLesson(lesson)}
                  style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px' }}
                >
                  Изменить
                </button>
                <button
                  onClick={() => lesson.id && handleDeleteLesson(lesson.id)}
                  style={{
                    ...buttonStyle,
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#ff6b6b',
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>

            <div style={{ marginTop: '15px', borderTop: '1px solid rgba(0, 255, 249, 0.2)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Файлы ({lesson.files?.length || 0})</h4>
                <label style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                  {uploadingFiles[lesson.id!] ? 'Загрузка...' : 'Добавить файл'}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => lesson.id && handleFileUpload(lesson.id, e)}
                    style={{ display: 'none' }}
                    disabled={uploadingFiles[lesson.id!]}
                  />
                </label>
              </div>

              {lesson.files && lesson.files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lesson.files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{file.file_name}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {formatFileSize(file.file_size)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.file_url)}
                        style={{
                          padding: '4px 8px',
                          background: '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
