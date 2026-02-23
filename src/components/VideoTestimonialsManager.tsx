import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { VideoTestimonial } from '../types';

export default function VideoTestimonialsManager() {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<VideoTestimonial> | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('video_testimonials')
      .select('*')
      .order('order_index');

    if (data) {
      setTestimonials(data);
    }
    setLoading(false);
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return null;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('video-testimonials')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('video-testimonials')
        .getPublicUrl(filePath);

      setUploadingVideo(false);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Ошибка загрузки видео');
      setUploadingVideo(false);
      return null;
    }
  };

  const saveTestimonial = async () => {
    if (!editingTestimonial?.student_name) {
      alert('Введите имя студента');
      return;
    }

    if (!editingTestimonial.video_url && !editingTestimonial.testimonial_text) {
      alert('Добавьте видео или текст отзыва');
      return;
    }

    if (editingTestimonial.id) {
      await supabase
        .from('video_testimonials')
        .update({
          student_name: editingTestimonial.student_name,
          video_url: editingTestimonial.video_url || '',
          thumbnail_url: editingTestimonial.thumbnail_url || '',
          testimonial_text: editingTestimonial.testimonial_text || '',
          order_index: editingTestimonial.order_index || 0,
          is_active: editingTestimonial.is_active ?? true
        })
        .eq('id', editingTestimonial.id);
    } else {
      await supabase.from('video_testimonials').insert({
        student_name: editingTestimonial.student_name,
        video_url: editingTestimonial.video_url || '',
        thumbnail_url: editingTestimonial.thumbnail_url || '',
        testimonial_text: editingTestimonial.testimonial_text || '',
        order_index: editingTestimonial.order_index || testimonials.length,
        is_active: editingTestimonial.is_active ?? true
      });
    }

    setEditingTestimonial(null);
    loadTestimonials();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return;
    await supabase.from('video_testimonials').delete().eq('id', id);
    loadTestimonials();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('video_testimonials')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    loadTestimonials();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(0, 255, 249, 0.3)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
  };

  const buttonPrimary = {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, var(--neon-cyan) 0%, #00b8b8 100%)',
    color: 'var(--bg-dark)',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  };

  const buttonSecondary = {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(0, 255, 249, 0.5)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const buttonDanger = {
    padding: '8px 16px',
    background: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid rgba(255, 107, 107, 0.5)',
    borderRadius: '6px',
    color: '#ff6b6b',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const hasVideo = (testimonial: VideoTestimonial) => {
    return testimonial.video_url && (
      testimonial.video_url.includes('youtube.com') ||
      testimonial.video_url.includes('youtu.be') ||
      testimonial.video_url.includes('.mp4') ||
      testimonial.video_url.includes('.webm')
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>Отзывы учеников</h2>
        <button
          onClick={() => setEditingTestimonial({ student_name: '', video_url: '', thumbnail_url: '', testimonial_text: '', order_index: testimonials.length, is_active: true })}
          style={buttonPrimary}
        >
          + Добавить отзыв
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>Загрузка...</div>
      ) : testimonials.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          border: '1px dashed rgba(0, 255, 249, 0.3)',
        }}>
          <p style={{ fontSize: '16px', opacity: 0.7 }}>
            Пока нет отзывов. Добавьте первый!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              style={{
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 249, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                opacity: testimonial.is_active ? 1 : 0.5,
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--neon-cyan)',
                background: '#000'
              }}>
                {testimonial.thumbnail_url ? (
                  <img
                    src={testimonial.thumbnail_url}
                    alt={testimonial.student_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'var(--neon-cyan)'
                  }}>
                    {testimonial.student_name.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '5px' }}>
                  {testimonial.student_name}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '5px' }}>
                  {hasVideo(testimonial) ? 'Видеоотзыв' : 'Текстовый отзыв'} | Порядок: {testimonial.order_index}
                </div>
                {testimonial.testimonial_text && (
                  <div style={{ fontSize: '13px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                    {testimonial.testimonial_text.substring(0, 80)}...
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleActive(testimonial.id, testimonial.is_active)}
                  style={{
                    ...buttonSecondary,
                    borderColor: testimonial.is_active ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.3)',
                    color: testimonial.is_active ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {testimonial.is_active ? 'Активен' : 'Скрыт'}
                </button>
                <button
                  onClick={() => setEditingTestimonial(testimonial)}
                  style={buttonSecondary}
                >
                  Изменить
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial.id)}
                  style={buttonDanger}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTestimonial && (
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
          }}
          onClick={() => setEditingTestimonial(null)}
        >
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
              {editingTestimonial.id ? 'Редактировать отзыв' : 'Новый отзыв'}
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Имя студента *
              </label>
              <input
                type="text"
                value={editingTestimonial.student_name || ''}
                onChange={e => setEditingTestimonial({ ...editingTestimonial, student_name: e.target.value })}
                placeholder="Александр К."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Фото студента (URL)
              </label>
              <input
                type="text"
                value={editingTestimonial.thumbnail_url || ''}
                onChange={e => setEditingTestimonial({ ...editingTestimonial, thumbnail_url: e.target.value })}
                placeholder="https://images.pexels.com/..."
                style={inputStyle}
              />
              <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '8px' }}>
                Можно использовать фото с Pexels или Unsplash
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Текст отзыва
              </label>
              <textarea
                value={editingTestimonial.testimonial_text || ''}
                onChange={e => setEditingTestimonial({ ...editingTestimonial, testimonial_text: e.target.value })}
                placeholder="Напишите текст отзыва студента..."
                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
              />
              <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '8px' }}>
                Рекомендуется 100-200 слов
              </div>
            </div>

            <div style={{
              padding: '15px',
              background: 'rgba(0, 255, 249, 0.1)',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(0, 255, 249, 0.2)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--neon-cyan)' }}>
                Видео (опционально)
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '15px' }}>
                Если добавить видео, оно заменит текстовый отзыв с фото
              </div>
              <input
                type="text"
                value={editingTestimonial.video_url || ''}
                onChange={e => setEditingTestimonial({ ...editingTestimonial, video_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
                style={{ ...inputStyle, marginBottom: '10px' }}
              />
              <input
                type="file"
                accept="video/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleVideoUpload(file);
                    if (url) {
                      setEditingTestimonial({ ...editingTestimonial, video_url: url });
                    }
                  }
                }}
                style={{ ...inputStyle, padding: '8px' }}
                disabled={uploadingVideo}
              />
              {uploadingVideo && (
                <div style={{ marginTop: '10px', color: 'var(--neon-cyan)', fontSize: '14px' }}>
                  Загрузка видео...
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Порядок отображения
              </label>
              <input
                type="number"
                value={editingTestimonial.order_index || 0}
                onChange={e => setEditingTestimonial({ ...editingTestimonial, order_index: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editingTestimonial.is_active ?? true}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, is_active: e.target.checked })}
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600 }}>Показывать на сайте</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveTestimonial} style={buttonPrimary} disabled={uploadingVideo}>
                Сохранить
              </button>
              <button onClick={() => setEditingTestimonial(null)} style={buttonSecondary}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
