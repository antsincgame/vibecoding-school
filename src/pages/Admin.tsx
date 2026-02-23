import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadStudentWorkImage, uploadCourseImage, uploadBlogImage } from '../lib/storageService';
import { renderMarkdown, stripMarkdown } from '../lib/markdown';
import { generateSlug } from '../lib/utils';
import EmailSettingsManager from '../components/EmailSettingsManager';
import EmailLogsManager from '../components/EmailLogsManager';
import InboxManager from '../components/InboxManager';
import AdminFormField from '../components/AdminFormField';
import CourseLessonsManager from '../components/CourseLessonsManager';
import VideoTestimonialsManager from '../components/VideoTestimonialsManager';
import FounderQuestionsManager from '../components/FounderQuestionsManager';
import type { Course, FAQ, TrialRegistration, StudentWork, BlogPost, HomePageSettings } from '../types';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'faqs' | 'registrations' | 'works' | 'testimonials' | 'blog' | 'home' | 'email' | 'email-logs' | 'inbox' | 'questions' | 'users'>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [registrations, setRegistrations] = useState<TrialRegistration[]>([]);
  const [studentWorks, setStudentWorks] = useState<StudentWork[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [homeSettings, setHomeSettings] = useState<HomePageSettings | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingWork, setEditingWork] = useState<StudentWork | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [managingLessonsCourse, setManagingLessonsCourse] = useState<Course | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }
      loadData();
    };
    checkAuth();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const loadData = async () => {
    if (activeTab === 'courses') {
      const { data } = await supabase.from('courses').select('*').order('order_index');
      if (data) setCourses(data);
    } else if (activeTab === 'faqs') {
      const { data } = await supabase.from('faqs').select('*').order('category').order('order_index');
      if (data) setFaqs(data);
    } else if (activeTab === 'registrations') {
      const { data } = await supabase
        .from('trial_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRegistrations(data);
    } else if (activeTab === 'works') {
      const { data } = await supabase
        .from('student_works')
        .select('*')
        .order('order_index');
      if (data) setStudentWorks(data);
    } else if (activeTab === 'blog') {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setBlogPosts(data);
    } else if (activeTab === 'home') {
      await loadHomeSettings();
    } else if (activeTab === 'users') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setUsers(data);
    }
  };

  const loadHomeSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['home_title', 'home_subtitle', 'home_description', 'home_meta_title', 'home_meta_description', 'home_meta_keywords']);

    if (data && data.length > 0) {
      const settingsMap: Record<string, string> = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      setHomeSettings({
        title: settingsMap['home_title'] || '',
        subtitle: settingsMap['home_subtitle'] || '',
        description: settingsMap['home_description'] || '',
        meta_title: settingsMap['home_meta_title'] || '',
        meta_description: settingsMap['home_meta_description'] || '',
        meta_keywords: settingsMap['home_meta_keywords'] || '',
      });
    }
  };

  const saveHomeSettings = async (settings: HomePageSettings) => {
    try {
      const updates = [
        { key: 'home_title', value: settings.title, description: 'Title on home page' },
        { key: 'home_subtitle', value: settings.subtitle, description: 'Subtitle on home page' },
        { key: 'home_description', value: settings.description, description: 'Description on home page' },
        { key: 'home_meta_title', value: settings.meta_title, description: 'SEO meta title for home page' },
        { key: 'home_meta_description', value: settings.meta_description, description: 'SEO meta description for home page' },
        { key: 'home_meta_keywords', value: settings.meta_keywords, description: 'SEO keywords for home page' },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: update.key,
            value: update.value,
            description: update.description,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          });

        if (error) {
          console.error('Error updating setting:', update.key, error);
          throw error;
        }
      }

      setHomeSettings(settings);
      alert('Настройки успешно сохранены! Обновите главную страницу для просмотра изменений.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Удалить курс?')) return;
    await supabase.from('courses').delete().eq('id', id);
    loadData();
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Удалить вопрос?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    loadData();
  };

  const saveCourse = async (course: Partial<Course>) => {
    try {
      if (course.id) {
        const { created_at, updated_at, ...courseData } = course;
        const updateData = {
          ...courseData,
          features: Array.isArray(course.features) ? course.features : [],
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('courses').update(updateData).eq('id', course.id);
        if (error) {
          alert(`Ошибка сохранения: ${error.message}`);
          console.error('Error saving course:', error);
          return;
        }
      } else {
        const { id, created_at, updated_at, ...courseWithoutId } = course;
        const insertData = {
          ...courseWithoutId,
          features: Array.isArray(course.features) ? course.features : []
        };

        const { error } = await supabase.from('courses').insert([insertData]);
        if (error) {
          alert(`Ошибка создания курса: ${error.message}`);
          console.error('Error creating course:', error);
          return;
        }
      }
      setEditingCourse(null);
      loadData();
    } catch (err) {
      alert('Произошла ошибка при сохранении');
      console.error('Error:', err);
    }
  };

  const saveFaq = async (faq: Partial<FAQ>) => {
    try {
      if (faq.id) {
        const { id, created_at, updated_at, ...faqData } = faq;
        const { error } = await supabase
          .from('faqs')
          .update({
            ...faqData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          alert(`Ошибка сохранения: ${error.message}`);
          return;
        }
      } else {
        const { id, created_at, updated_at, ...faqWithoutId } = faq;
        const { error } = await supabase.from('faqs').insert([faqWithoutId]);
        if (error) {
          alert(`Ошибка создания: ${error.message}`);
          return;
        }
      }
      setEditingFaq(null);
      loadData();
    } catch (err) {
      alert('Произошла ошибка при сохранении');
      console.error('Error saving FAQ:', err);
    }
  };

  const deleteWork = async (id: string) => {
    if (!confirm('Удалить работу?')) return;
    await supabase.from('student_works').delete().eq('id', id);
    loadData();
  };

  const saveWork = async (work: Partial<StudentWork>) => {
    try {
      if (work.id) {
        const { id, created_at, ...workData } = work;
        const { error } = await supabase
          .from('student_works')
          .update({
            ...workData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (error) {
          alert(`Ошибка сохранения: ${error.message}`);
          return;
        }
      } else {
        const { id, created_at, updated_at, ...workWithoutId } = work;
        const { error } = await supabase.from('student_works').insert([workWithoutId]);
        if (error) {
          alert(`Ошибка создания: ${error.message}`);
          return;
        }
      }
      setEditingWork(null);
      loadData();
    } catch (err) {
      alert('Произошла ошибка при сохранении');
      console.error('Error saving work:', err);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Удалить статью?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    loadData();
  };

  const saveBlogPost = async (post: Partial<BlogPost>) => {
    try {
      if (post.id) {
        const { id, created_at, ...postData } = post;
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (error) {
          alert(`Ошибка сохранения: ${error.message}`);
          return;
        }
      } else {
        const { id, created_at, updated_at, ...postWithoutId } = post;
        const { error } = await supabase.from('blog_posts').insert([postWithoutId]);
        if (error) {
          alert(`Ошибка создания: ${error.message}`);
          return;
        }
      }
      setEditingBlogPost(null);
      loadData();
    } catch (err) {
      alert('Произошла ошибка при сохранении');
      console.error('Error saving blog post:', err);
    }
  };

  const saveUser = async (user: Partial<UserProfile>) => {
    try {
      if (!user.id) {
        alert('Ошибка: ID пользователя не найден');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          role: user.role
        })
        .eq('id', user.id);

      if (error) {
        alert(`Ошибка сохранения: ${error.message}`);
        return;
      }

      setEditingUser(null);
      loadData();
      alert('Данные пользователя успешно обновлены');
    } catch (err) {
      alert('Произошла ошибка при сохранении');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Сессия истекла. Войдите снова.');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Ошибка удаления: ${data.error || 'Unknown error'}`);
        return;
      }

      setEditingUser(null);
      loadData();
      alert('Пользователь успешно удален');
    } catch (err) {
      alert('Произошла ошибка при удалении пользователя');
    }
  };

  const createUser = async (userData: { email: string; password: string; full_name: string; role: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Сессия истекла. Войдите снова.');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Ошибка создания: ${data.error || 'Unknown error'}`);
        return;
      }

      setShowCreateUser(false);
      loadData();
      alert('Пользователь успешно создан');
    } catch (err) {
      alert('Произошла ошибка при создании пользователя');
    }
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    await supabase
      .from('trial_registrations')
      .update({ status })
      .eq('id', id);
    loadData();
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '120px',
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
          <h1 style={{ fontSize: '48px' }} className="neon-text">
            ADMIN PANEL
          </h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate('/')} className="cyber-button" style={{
              borderColor: 'var(--neon-cyan)',
              color: 'var(--neon-cyan)'
            }}>
              На главную
            </button>
            <button onClick={handleLogout} className="cyber-button" style={{
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}>
              Выход
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('courses')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'courses' ? 1 : 0.5
            }}
          >
            Курсы
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'faqs' ? 1 : 0.5
            }}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'registrations' ? 1 : 0.5
            }}
          >
            Заявки
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'works' ? 1 : 0.5,
              borderColor: 'var(--neon-green)',
              color: 'var(--neon-green)'
            }}
          >
            Работы учеников
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'testimonials' ? 1 : 0.5,
              borderColor: 'var(--neon-green)',
              color: 'var(--neon-green)'
            }}
          >
            Видеоотзывы
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'blog' ? 1 : 0.5,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Блог
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'home' ? 1 : 0.5,
              borderColor: 'var(--neon-cyan)',
              color: 'var(--neon-cyan)'
            }}
          >
            Главная страница
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'email' ? 1 : 0.5,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Email настройки
          </button>
          <button
            onClick={() => setActiveTab('email-logs')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'email-logs' ? 1 : 0.5,
              borderColor: '#8b5cf6',
              color: '#8b5cf6'
            }}
          >
            Логи Email
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'inbox' ? 1 : 0.5,
              borderColor: '#ec4899',
              color: '#ec4899'
            }}
          >
            Входящие письма
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'questions' ? 1 : 0.5,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Вопросы основателю
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="cyber-button"
            style={{
              opacity: activeTab === 'users' ? 1 : 0.5,
              borderColor: 'var(--neon-cyan)',
              color: 'var(--neon-cyan)'
            }}
          >
            Пользователи
          </button>
        </div>

        {activeTab === 'courses' && (
          <div>
            <button
              onClick={() => setEditingCourse({
                id: '',
                title: '',
                description: '',
                duration: '',
                age_group: '',
                price: '',
                image_url: '',
                features: [],
                is_active: true,
                order_index: 0,
                created_at: '',
                updated_at: ''
              })}
              className="cyber-button"
              style={{ marginBottom: '30px' }}
            >
              + Добавить курс
            </button>

            <div style={{ display: 'grid', gap: '20px' }}>
              {courses.map((course) => (
                <div key={course.id} className="cyber-card">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {course.image_url && (
                      <div style={{
                        width: '180px',
                        height: '120px',
                        borderRadius: '6px',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img
                          src={course.image_url}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '22px', color: 'var(--neon-cyan)', margin: 0 }}>
                          {course.title}
                        </h3>
                        {!course.is_active && (
                          <span style={{
                            background: 'rgba(255, 100, 100, 0.2)',
                            color: 'var(--neon-pink)',
                            padding: '2px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            Скрыт
                          </span>
                        )}
                        {course.slug && (
                          <span style={{
                            opacity: 0.5,
                            fontSize: '13px'
                          }}>
                            /{course.slug}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--neon-green)', marginBottom: '8px' }}>
                        {course.age_group} | {course.duration} | {course.price}
                      </div>
                      <p style={{ opacity: 0.8, marginBottom: '15px', fontSize: '14px' }}>
                        {stripMarkdown(course.description).substring(0, 150)}{stripMarkdown(course.description).length > 150 ? '...' : ''}
                      </p>
                      {Array.isArray(course.features) && course.features.length > 0 && (
                        <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '15px' }}>
                          Особенности: {course.features.length} шт.
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="cyber-button"
                          style={{ padding: '8px 20px', fontSize: '14px' }}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => setManagingLessonsCourse(course)}
                          className="cyber-button"
                          style={{
                            padding: '8px 20px',
                            fontSize: '14px',
                            borderColor: '#ffd700',
                            color: '#ffd700'
                          }}
                        >
                          Уроки
                        </button>
                        {course.slug && (
                          <a
                            href={`/course/${course.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cyber-button"
                            style={{
                              padding: '8px 20px',
                              fontSize: '14px',
                              textDecoration: 'none',
                              borderColor: 'var(--neon-green)',
                              color: 'var(--neon-green)'
                            }}
                          >
                            Открыть
                          </a>
                        )}
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="cyber-button"
                          style={{
                            padding: '8px 20px',
                            fontSize: '14px',
                            borderColor: 'var(--neon-pink)',
                            color: 'var(--neon-pink)'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="cyber-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ opacity: 0.6 }}>Пока нет курсов. Нажмите "Добавить курс" чтобы создать первый.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div>
            <button
              onClick={() => setEditingFaq({
                id: '',
                question: '',
                answer: '',
                category: 'general',
                order_index: 0,
                is_active: true,
                created_at: '',
                updated_at: ''
              })}
              className="cyber-button"
              style={{ marginBottom: '30px' }}
            >
              + Добавить вопрос
            </button>

            <div style={{ display: 'grid', gap: '20px' }}>
              {faqs.map((faq) => (
                <div key={faq.id} className="cyber-card">
                  <h3 style={{ fontSize: '20px', color: 'var(--neon-cyan)', marginBottom: '10px' }}>
                    {faq.question}
                  </h3>
                  <p style={{ opacity: 0.8, marginBottom: '15px' }}>{faq.answer}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="cyber-button"
                      style={{ padding: '8px 20px', fontSize: '14px' }}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="cyber-button"
                      style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        borderColor: 'var(--neon-pink)',
                        color: 'var(--neon-pink)'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {registrations.map((reg) => (
              <div key={reg.id} className="cyber-card">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      {reg.age_group === 'child' ? 'Родитель' : 'Имя'}
                    </div>
                    <div style={{ color: 'var(--neon-cyan)' }}>{reg.parent_name}</div>
                  </div>
                  {reg.age_group === 'child' && reg.child_name && (
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.6 }}>Подросток</div>
                      <div>{reg.child_name} ({reg.child_age} лет)</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Возрастная группа</div>
                    <div>{reg.age_group === 'child' ? 'Подросток (16-18 лет)' : 'Взрослый (18+)'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Телефон</div>
                    <div>{reg.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Email</div>
                    <div>{reg.email}</div>
                  </div>
                </div>
                {reg.message && (
                  <div style={{ marginBottom: '15px', opacity: 0.8 }}>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Сообщение</div>
                    {reg.message}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={reg.status}
                    onChange={(e) => updateRegistrationStatus(reg.id!, e.target.value)}
                    style={{ padding: '8px' }}
                  >
                    <option value="new">Новая</option>
                    <option value="contacted">Связались</option>
                    <option value="scheduled">Запланировано</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'works' && (
          <div>
            <button
              onClick={() => setEditingWork({
                id: '',
                student_name: '',
                student_age: 14,
                project_title: '',
                project_description: '',
                project_url: '',
                image_url: '',
                tool_type: 'bolt',
                is_active: true,
                order_index: 0,
                created_at: '',
                updated_at: ''
              })}
              className="cyber-button"
              style={{ marginBottom: '30px' }}
            >
              + Добавить работу
            </button>

            <div style={{ display: 'grid', gap: '20px' }}>
              {studentWorks.map((work) => (
                <div key={work.id} className="cyber-card">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {work.image_url && (
                      <div style={{
                        width: '150px',
                        height: '100px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img
                          src={work.image_url}
                          alt={work.project_title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{ fontSize: '20px', color: 'var(--neon-cyan)', margin: 0 }}>
                          {work.project_title}
                        </h3>
                        <span style={{
                          background: work.tool_type === 'bolt' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                          color: 'var(--bg-dark)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {work.tool_type === 'bolt' ? 'Bolt.new' : 'Cursor AI'}
                        </span>
                        {!work.is_active && (
                          <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            Скрыто
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--neon-green)', marginBottom: '8px' }}>
                        {work.student_name}, {work.student_age} лет
                      </div>
                      <p style={{ opacity: 0.8, marginBottom: '15px', fontSize: '14px' }}>
                        {work.project_description}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setEditingWork(work)}
                          className="cyber-button"
                          style={{ padding: '8px 20px', fontSize: '14px' }}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => deleteWork(work.id)}
                          className="cyber-button"
                          style={{
                            padding: '8px 20px',
                            fontSize: '14px',
                            borderColor: 'var(--neon-pink)',
                            color: 'var(--neon-pink)'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div>
            <button
              onClick={() => setEditingBlogPost({
                id: '',
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                image_url: '',
                meta_title: '',
                meta_description: '',
                meta_keywords: '',
                is_published: false,
                published_at: null,
                created_at: '',
                updated_at: ''
              })}
              className="cyber-button"
              style={{ marginBottom: '30px' }}
            >
              + Добавить статью
            </button>

            <div style={{ display: 'grid', gap: '20px' }}>
              {blogPosts.map((post) => (
                <div key={post.id} className="cyber-card">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {post.image_url && (
                      <div style={{
                        width: '200px',
                        height: '120px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <h3 style={{ fontSize: '20px', color: 'var(--neon-pink)', margin: 0 }}>
                          {post.title}
                        </h3>
                        <span style={{
                          background: post.is_published ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.2)',
                          color: post.is_published ? 'var(--bg-dark)' : 'inherit',
                          padding: '2px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {post.is_published ? 'Опубликовано' : 'Черновик'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--neon-cyan)', marginBottom: '8px' }}>
                        /{post.slug}
                      </div>
                      <p style={{ opacity: 0.8, marginBottom: '15px', fontSize: '14px' }}>
                        {post.excerpt || 'Нет описания'}
                      </p>
                      {post.meta_title && (
                        <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '10px' }}>
                          SEO: {post.meta_title}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setEditingBlogPost(post)}
                          className="cyber-button"
                          style={{ padding: '8px 20px', fontSize: '14px' }}
                        >
                          Редактировать
                        </button>
                        {post.is_published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cyber-button"
                            style={{
                              padding: '8px 20px',
                              fontSize: '14px',
                              textDecoration: 'none',
                              borderColor: 'var(--neon-cyan)',
                              color: 'var(--neon-cyan)'
                            }}
                          >
                            Открыть
                          </a>
                        )}
                        <button
                          onClick={() => deleteBlogPost(post.id)}
                          className="cyber-button"
                          style={{
                            padding: '8px 20px',
                            fontSize: '14px',
                            borderColor: 'var(--neon-pink)',
                            color: 'var(--neon-pink)'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {blogPosts.length === 0 && (
                <div className="cyber-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ opacity: 0.6 }}>Пока нет статей. Нажмите "Добавить статью" чтобы создать первую.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'home' && homeSettings && (
          <HomePageSettingsModal
            settings={homeSettings}
            onSave={saveHomeSettings}
          />
        )}

        {activeTab === 'testimonials' && (
          <VideoTestimonialsManager />
        )}

        {activeTab === 'email' && (
          <EmailSettingsManager />
        )}

        {activeTab === 'email-logs' && (
          <EmailLogsManager />
        )}

        {activeTab === 'inbox' && (
          <InboxManager />
        )}

        {activeTab === 'questions' && (
          <FounderQuestionsManager />
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: 'var(--neon-cyan)', margin: 0 }}>
                Пользователи ({users.length})
              </h2>
              <button
                onClick={() => setShowCreateUser(true)}
                className="cyber-button"
                style={{ padding: '10px 20px' }}
              >
                + Добавить пользователя
              </button>
            </div>
            <div style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
            }}>
              {users.map((user) => (
                <div key={user.id} className="cyber-card">
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: user.avatar_url ? `url(${user.avatar_url})` : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {!user.avatar_url && (user.full_name?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '18px',
                        color: 'var(--neon-cyan)',
                        marginBottom: '4px',
                        wordBreak: 'break-word'
                      }}>
                        {user.full_name || 'Без имени'}
                      </h3>
                      <div style={{
                        fontSize: '13px',
                        opacity: 0.8,
                        wordBreak: 'break-all'
                      }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      background: user.role === 'admin' ? 'var(--neon-pink)' : user.role === 'teacher' ? 'var(--neon-green)' : 'var(--neon-cyan)',
                      color: 'var(--bg-dark)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {user.role === 'admin' ? 'Администратор' : user.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    marginBottom: '15px'
                  }}>
                    Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>

                  <button
                    onClick={() => setEditingUser(user)}
                    className="cyber-button"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '14px'
                    }}
                  >
                    Редактировать
                  </button>
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="cyber-card" style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <p style={{ opacity: 0.6, fontSize: '16px' }}>
                  Пользователи не найдены
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {editingCourse && (
        <CourseModal
          course={editingCourse}
          onSave={saveCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {editingFaq && (
        <FaqModal
          faq={editingFaq}
          onSave={saveFaq}
          onClose={() => setEditingFaq(null)}
        />
      )}

      {editingWork && (
        <StudentWorkModal
          work={editingWork}
          onSave={saveWork}
          onClose={() => setEditingWork(null)}
        />
      )}

      {editingBlogPost && (
        <BlogPostModal
          post={editingBlogPost}
          onSave={saveBlogPost}
          onClose={() => setEditingBlogPost(null)}
        />
      )}

      {editingUser && (
        <UserModal
          user={editingUser}
          onSave={saveUser}
          onDelete={deleteUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          onCreate={createUser}
          onClose={() => setShowCreateUser(false)}
        />
      )}

      {managingLessonsCourse && (
        <CourseLessonsManager
          courseId={managingLessonsCourse.id}
          courseTitle={managingLessonsCourse.title}
          onClose={() => setManagingLessonsCourse(null)}
        />
      )}
    </div>
  );
}

function CourseModal({
  course,
  onSave,
  onClose
}: {
  course: Course;
  onSave: (course: Partial<Course>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(course);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadCourseImage(file);
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const features = Array.isArray(formData.features) ? formData.features : [];
      setFormData({
        ...formData,
        features: [...features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const features = Array.isArray(formData.features) ? formData.features : [];
    setFormData({
      ...formData,
      features: features.filter((_, i) => i !== index)
    });
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const features = Array.isArray(formData.features) ? [...formData.features] : [];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= features.length) return;
    [features[index], features[newIndex]] = [features[newIndex], features[index]];
    setFormData({ ...formData, features });
  };

  const features = Array.isArray(formData.features) ? formData.features : [];

  return (
    <div style={{
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
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{ maxWidth: '800px', width: '100%', margin: '40px 0' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px', color: 'var(--neon-cyan)' }}>
          {course.id ? 'Редактировать курс' : 'Новый курс'}
        </h2>

        <div className="admin-form-group">
          <label className="admin-form-label admin-form-label-required">
            Название курса
          </label>
          <div className="admin-form-hint">
            Это название будет отображаться в списке курсов и на странице курса
          </div>
          <input
            type="text"
            className="admin-form-input"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: Веб-разработка для начинающих"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            URL адрес (slug)
          </label>
          <div className="admin-form-hint">
            Уникальный идентификатор для URL: site.com/course/ваш-slug
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: 0.6, fontWeight: 600 }}>/course/</span>
            <input
              type="text"
              className="admin-form-input"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="web-development"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="admin-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label className="admin-form-label admin-form-label-required" style={{ marginBottom: 0 }}>
              Описание (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: 'transparent',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '11px',
                borderRadius: '4px',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 249, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {showPreview ? '✕ Скрыть' : '▼ Показать'} предпросмотр
            </button>
          </div>
          <div className="admin-form-hint">
            Форматирование: **жирный**, *курсив*, # Заголовок, - списки, [ссылка](url)
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Подробное описание курса с поддержкой Markdown"
            className="admin-form-textarea"
            style={{ fontFamily: 'monospace', fontSize: '14px' }}
          />
          {showPreview && formData.description && (
            <div style={{
              marginTop: '15px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 255, 249, 0.3)',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--neon-green)',
                marginBottom: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Предпросмотр:
              </div>
              <div
                style={{ fontSize: '16px', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.description) }}
              />
            </div>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            Изображение обложки курса
          </label>
          <div className="admin-form-hint">
            Рекомендуемый размер: 1200x600px или больше. Формат: JPG, PNG
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="admin-form-input"
            style={{ marginBottom: '10px', padding: '12px 16px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
          />
          {uploadError && (
            <div style={{ color: 'var(--neon-pink)', marginBottom: '10px', fontSize: '14px' }}>
              {uploadError}
            </div>
          )}
          {isUploading && (
            <div style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>
              Загрузка изображения...
            </div>
          )}
          {formData.image_url && (
            <div style={{ marginTop: '10px' }}>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                border: '1px solid var(--neon-cyan)',
                marginBottom: '10px',
                overflow: 'hidden'
              }}>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image_url: '' })}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--neon-pink)',
                  color: 'var(--neon-pink)',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '4px'
                }}
              >
                Удалить изображение
              </button>
            </div>
          )}
          <AdminFormField label="Или укажите URL изображения" hint="Используйте этот метод для внешних изображений">
            <input
              type="url"
              className="admin-form-input"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </AdminFormField>
        </div>

        <div className="admin-form-row">
          <AdminFormField label="Длительность" hint="Пример: 3 месяца или 12 недель" required>
            <input
              type="text"
              className="admin-form-input"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="3 месяца"
            />
          </AdminFormField>

          <AdminFormField label="Возрастная группа" hint="Пример: 16+ или 12-18 лет" required>
            <input
              type="text"
              className="admin-form-input"
              value={formData.age_group}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
              placeholder="16+"
            />
          </AdminFormField>
        </div>

        <div className="admin-form-row">
          <AdminFormField label="Стоимость обучения" hint="Пример: 200 BYN/месяц или Бесплатно" required>
            <input
              type="text"
              className="admin-form-input"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="200 BYN/мес"
            />
          </AdminFormField>

          <AdminFormField label="Порядок отображения" hint="Курсы сортируются по возрастанию этого значения">
            <input
              type="number"
              className="admin-form-input"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </AdminFormField>
        </div>

        <div style={{
          background: 'rgba(0, 255, 100, 0.05)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0, 255, 100, 0.2)'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', color: 'var(--neon-green)', fontWeight: 600 }}>
            Особенности курса (features)
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '10px 15px',
                borderRadius: '6px'
              }}>
                <span style={{ flex: 1 }}>{feature}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    onClick={() => moveFeature(index, 'up')}
                    disabled={index === 0}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--neon-cyan)',
                      color: 'var(--neon-cyan)',
                      width: '28px',
                      height: '28px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.3 : 1,
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeature(index, 'down')}
                    disabled={index === features.length - 1}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--neon-cyan)',
                      color: 'var(--neon-cyan)',
                      width: '28px',
                      height: '28px',
                      cursor: index === features.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === features.length - 1 ? 0.3 : 1,
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--neon-pink)',
                      color: 'var(--neon-pink)',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Добавить особенность..."
              style={{ flex: 1 }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button
              type="button"
              onClick={addFeature}
              className="cyber-button"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              Добавить
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 100, 255, 0.05)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0, 100, 255, 0.3)'
        }}>
          <h3 style={{
            color: 'var(--neon-cyan)',
            marginBottom: '20px',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            SEO настройки
            <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 400 }}>
              (для поисковых систем)
            </span>
          </h3>

          <AdminFormField label="SEO заголовок (meta title)" hint="Отображается в результатах поиска. Рекомендуемая длина: 50-60 символов">
            <input
              type="text"
              className="admin-form-input"
              value={formData.meta_title || ''}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Курс вайбкодинга: создание сайтов с ИИ | Vibecoding"
              maxLength={70}
            />
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
              {(formData.meta_title || '').length}/70 символов
            </div>
          </AdminFormField>

          <AdminFormField label="SEO описание (meta description)" hint="Описание для поисковых систем. Рекомендуемая длина: 150-160 символов">
            <textarea
              className="admin-form-textarea"
              value={formData.meta_description || ''}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Научитесь создавать сайты и приложения с помощью ИИ за 2 месяца. Практический курс вайбкодинга с Cursor AI и Bolt.new. 7+ проектов в портфолио."
              style={{ minHeight: '80px' }}
              maxLength={200}
            />
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
              {(formData.meta_description || '').length}/200 символов
            </div>
          </AdminFormField>

          <AdminFormField label="Ключевые слова (meta keywords)" hint="Ключевые слова через запятую для Яндекса">
            <input
              type="text"
              className="admin-form-input"
              value={formData.meta_keywords || ''}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="вайбкодинг курс, обучение Cursor AI, Bolt.new обучение, создание сайтов с ИИ"
            />
          </AdminFormField>

          <AdminFormField label="SEO текст для страницы курса" hint="Дополнительный текст для индексации. Отображается внизу страницы курса. Поддерживает Markdown">
            <textarea
              className="admin-form-textarea"
              value={formData.seo_text || ''}
              onChange={(e) => setFormData({ ...formData, seo_text: e.target.value })}
              placeholder="Подробный текст о курсе для поисковых систем..."
              style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '14px' }}
            />
          </AdminFormField>

          <AdminFormField label="Canonical URL (необязательно)" hint="Укажите канонический URL, если страница доступна по нескольким адресам">
            <input
              type="url"
              className="admin-form-input"
              value={formData.canonical_url || ''}
              onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
              placeholder="https://vibecoding.by/course/your-course"
            />
          </AdminFormField>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>Курс активен (отображается на сайте)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSave(formData)}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            Сохранить курс
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqModal({
  faq,
  onSave,
  onClose
}: {
  faq: FAQ;
  onSave: (faq: Partial<FAQ>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(faq);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px', color: 'var(--neon-cyan)' }}>
          {faq.id ? 'Редактировать вопрос' : 'Новый вопрос'}
        </h2>

        <AdminFormField label="Вопрос пользователя" hint="Сформулируйте вопрос четко и понятно" required>
          <input
            type="text"
            className="admin-form-input"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Как начать обучение?"
          />
        </AdminFormField>

        <AdminFormField label="Ответ" hint="Дайте подробный и полезный ответ на вопрос" required>
          <textarea
            className="admin-form-textarea"
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder="Введите полный ответ здесь..."
          />
        </AdminFormField>

        <AdminFormField label="Категория" hint="Выберите категорию для группировки вопросов" required>
          <select
            className="admin-form-select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="general">Общие вопросы</option>
            <option value="courses">О курсах</option>
            <option value="payment">Оплата и условия</option>
            <option value="technical">Технические вопросы</option>
          </select>
        </AdminFormField>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentWorkModal({
  work,
  onSave,
  onClose
}: {
  work: StudentWork;
  onSave: (work: Partial<StudentWork>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(work);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadStudentWorkImage(file);
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px', color: 'var(--neon-green)' }}>
          {work.id ? 'Редактировать работу ученика' : 'Добавить работу ученика'}
        </h2>

        <AdminFormField label="Имя ученика" hint="Полное имя автора работы" required>
          <input
            type="text"
            className="admin-form-input"
            value={formData.student_name}
            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
            placeholder="Например: Мария Сидорова"
          />
        </AdminFormField>

        <AdminFormField label="Возраст" hint="Возраст ученика на момент создания работы" required>
          <input
            type="number"
            className="admin-form-input"
            value={formData.student_age}
            onChange={(e) => setFormData({ ...formData, student_age: parseInt(e.target.value) || 0 })}
            min={1}
            max={100}
            placeholder="15"
          />
        </AdminFormField>

        <AdminFormField label="Название проекта" hint="Короткое и информативное название работы" required>
          <input
            type="text"
            className="admin-form-input"
            value={formData.project_title}
            onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
            placeholder="Например: Интерактивный блог о котиках"
          />
        </AdminFormField>

        <AdminFormField label="Описание проекта" hint="Расскажите, что делает проект и какие технологии использованы">
          <textarea
            className="admin-form-textarea"
            value={formData.project_description}
            onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
            style={{ minHeight: '100px' }}
            placeholder="Описание функционала и особенностей проекта..."
          />
        </AdminFormField>

        <AdminFormField label="URL проекта" hint="Ссылка на публикацию или демо проекта">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="url"
              className="admin-form-input"
              value={formData.project_url}
              onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
              placeholder="https://example.com/project"
              style={{ flex: 1 }}
            />
            {formData.project_url && (
              <a
                href={formData.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button"
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                Открыть
              </a>
            )}
          </div>
        </AdminFormField>

        <AdminFormField label="Изображение проекта" hint="Скриншот или изображение работы (JPG, PNG)">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="admin-form-input"
            style={{ marginBottom: '10px', padding: '12px 16px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
          />
          {uploadError && (
            <div style={{ color: 'var(--neon-pink)', marginBottom: '10px', fontSize: '14px' }}>
              {uploadError}
            </div>
          )}
          {isUploading && (
            <div style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>
              Загрузка...
            </div>
          )}
          {formData.image_url && (
            <div style={{
              marginTop: '10px',
              width: '100%',
              height: '150px',
              borderRadius: '4px',
              border: '1px solid var(--neon-cyan)',
              overflow: 'hidden'
            }}>
              <img
                src={formData.image_url}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </AdminFormField>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>Инструмент</label>
          <select
            value={formData.tool_type}
            onChange={(e) => setFormData({ ...formData, tool_type: e.target.value as 'bolt' | 'cursor' })}
          >
            <option value="bolt">Bolt.new (сайты)</option>
            <option value="cursor">Cursor AI (веб-приложения)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>Порядок</label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ color: 'var(--neon-cyan)' }}>Показывать на сайте</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSave(formData)}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogPostModal({
  post,
  onSave,
  onClose
}: {
  post: BlogPost;
  onSave: (post: Partial<BlogPost>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(post);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadBlogImage(file);
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title)
    });
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[data-content-editor="true"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData({ ...formData, content: newValue });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div style={{
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
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{
        maxWidth: '900px',
        width: '100%',
        margin: '40px 0'
      }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px', color: 'var(--neon-pink)' }}>
          {post.id ? 'Редактировать статью' : 'Новая статья в блоге'}
        </h2>

        <AdminFormField label="Заголовок статьи" hint="Привлекательный и информативный заголовок" required>
          <input
            type="text"
            className="admin-form-input"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: Как начать изучать веб-разработку"
          />
        </AdminFormField>

        <AdminFormField label="URL адрес (slug)" hint="Уникальный идентификатор: site.com/blog/ваш-slug" required>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: 0.6, fontWeight: 600 }}>/blog/</span>
            <input
              type="text"
              className="admin-form-input"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="kak-nachat-web-razrabotku"
              style={{ flex: 1 }}
            />
          </div>
        </AdminFormField>

        <AdminFormField label="Краткое описание" hint="Отображается в списке статей как превью (до 200 символов)">
          <textarea
            className="admin-form-textarea"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Краткое описание статьи..."
            style={{ minHeight: '80px' }}
          />
        </AdminFormField>

        <div className="admin-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label className="admin-form-label admin-form-label-required" style={{ marginBottom: 0 }}>
              Содержимое статьи (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: 'transparent',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s ease'
              }}
            >
              {showPreview ? 'Редактор' : 'Предпросмотр'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '10px',
            padding: '10px',
            background: 'rgba(0, 255, 249, 0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 255, 249, 0.15)'
          }}>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**', 'жирный текст')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              title="Жирный текст"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*', 'курсив')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontStyle: 'italic'
              }}
              title="Курсив"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('# ', '', 'Заголовок 1')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Заголовок 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ', '', 'Заголовок 2')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Заголовок 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('### ', '', 'Заголовок 3')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Заголовок 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('[', '](url)', 'текст ссылки')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Ссылка"
            >
              Ссылка
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ', '', 'элемент списка')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Маркированный список"
            >
              Список
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`', 'код')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              title="Код"
            >
              &lt;/&gt;
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('```\n', '\n```', 'код')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              title="Блок кода"
            >
              Блок кода
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ', '', 'цитата')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Цитата"
            >
              Цитата
            </button>
          </div>

          {!showPreview ? (
            <textarea
              data-content-editor="true"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Введите текст статьи здесь. Используйте кнопки для форматирования или markdown синтаксис"
              className="admin-form-textarea"
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                minHeight: '400px'
              }}
            />
          ) : (
            <div style={{
              padding: '20px',
              background: 'rgba(0, 255, 100, 0.05)',
              border: '2px solid var(--neon-green)',
              borderRadius: '6px',
              minHeight: '300px',
              maxHeight: '500px',
              overflowY: 'auto',
              lineHeight: '1.8'
            }}>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }} />
            </div>
          )}
        </div>

        <AdminFormField label="Изображение обложки" hint="Главное изображение для статьи (рекомендуемый размер: 1200x600px)">
          <input
            type="file"
            accept="image/*"
            className="admin-form-input"
            style={{ padding: '12px 16px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {uploadError && (
            <div style={{ color: 'var(--neon-pink)', marginBottom: '10px', fontSize: '14px' }}>
              {uploadError}
            </div>
          )}
          {isUploading && (
            <div style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>
              Загрузка...
            </div>
          )}
          {formData.image_url && (
            <div style={{
              marginTop: '10px',
              width: '100%',
              height: '200px',
              borderRadius: '4px',
              border: '1px solid var(--neon-cyan)',
              overflow: 'hidden'
            }}>
              <img
                src={formData.image_url}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </AdminFormField>

        <div style={{
          background: 'rgba(0, 255, 249, 0.05)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0, 255, 249, 0.2)'
        }}>
          <h3 style={{ color: 'var(--neon-green)', marginBottom: '15px', fontSize: '18px' }}>
            SEO настройки
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Title (заголовок в поиске)
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Заголовок страницы для поисковиков (50-60 символов)"
            />
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              {formData.meta_title.length}/60 символов
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Description (описание в поиске)
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              placeholder="Описание страницы для поисковиков (150-160 символов)"
            />
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              {formData.meta_description.length}/160 символов
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Keywords (ключевые слова)
            </label>
            <input
              type="text"
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="вайбкодинг, Cursor AI, обучение, курсы"
            />
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({
                ...formData,
                is_published: e.target.checked,
                published_at: e.target.checked && !formData.published_at
                  ? new Date().toISOString()
                  : formData.published_at
              })}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>Опубликовать статью</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSave(formData)}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
function HomePageSettingsModal({
  settings,
  onSave,
}: {
  settings: HomePageSettings;
  onSave: (settings: HomePageSettings) => Promise<void>;
}) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(formData);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[data-home-description-editor="true"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData({ ...formData, description: newValue });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      padding: '40px 20px',
    }}>
      <div className="cyber-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '15px', color: 'var(--neon-cyan)' }}>
          Редактирование главной страницы
        </h2>
        <div style={{
          background: 'rgba(0, 255, 249, 0.1)',
          border: '1px solid rgba(0, 255, 249, 0.3)',
          padding: '12px 15px',
          borderRadius: '6px',
          marginBottom: '30px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          После сохранения изменений обновите главную страницу, чтобы увидеть новые настройки
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)', fontWeight: 600 }}>
            Заголовок *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Основной заголовок страницы"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)', fontWeight: 600 }}>
            Подзаголовок *
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Подзаголовок под основным заголовком"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
              Описание *
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: 'transparent',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s ease'
              }}
            >
              {showPreview ? 'Редактор' : 'Предпросмотр'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '10px',
            padding: '10px',
            background: 'rgba(0, 255, 249, 0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 255, 249, 0.15)'
          }}>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**', 'жирный текст')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              title="Жирный текст"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*', 'курсив')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontStyle: 'italic'
              }}
              title="Курсив"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('[', '](url)', 'текст ссылки')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Ссылка"
            >
              Ссылка
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ', '', 'элемент списка')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Маркированный список"
            >
              Список
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`', 'код')}
              style={{
                background: 'rgba(0, 255, 249, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              title="Код"
            >
              &lt;/&gt;
            </button>
          </div>

          {!showPreview ? (
            <textarea
              data-home-description-editor="true"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              placeholder="Основной текст описания на главной странице. Используйте кнопки для форматирования"
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid var(--neon-cyan)',
                borderRadius: '4px',
                color: 'white',
                resize: 'vertical'
              }}
            />
          ) : (
            <div style={{
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--neon-green)',
              borderRadius: '4px',
              minHeight: '120px'
            }}>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.description) }} />
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(0, 255, 249, 0.05)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0, 255, 249, 0.2)'
        }}>
          <h3 style={{ color: 'var(--neon-green)', marginBottom: '15px', fontSize: '18px' }}>
            SEO настройки для главной страницы
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Title (заголовок в поиске)
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Заголовок для поисковиков (50-60 символов)"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              {formData.meta_title.length}/60 символов
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Description (описание в поиске)
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              placeholder="Описание для поисковиков (150-160 символов)"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              {formData.meta_description.length}/160 символов
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--neon-cyan)' }}>
              Meta Keywords (ключевые слова)
            </label>
            <input
              type="text"
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="вайбкодинг, веб-разработка, Cursor AI, Bolt.new"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {saveError && (
          <div style={{
            color: 'var(--neon-pink)',
            background: 'rgba(255, 100, 100, 0.1)',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid var(--neon-pink)'
          }}>
            {saveError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({
  user,
  onSave,
  onDelete,
  onClose
}: {
  user: UserProfile;
  onSave: (user: Partial<UserProfile>) => void;
  onDelete: (userId: string) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{
          fontSize: '28px',
          marginBottom: '20px',
          color: 'var(--neon-cyan)'
        }}>
          Редактировать пользователя
        </h2>

        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 255, 249, 0.05)',
          border: '1px solid rgba(0, 255, 249, 0.2)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            <strong>ID:</strong> {user.id}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
            Email нельзя изменить через админ-панель
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Полное имя
          </label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="cyber-input"
            placeholder="Иван Иванов"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Роль *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            <option value="user">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="admin">Администратор</option>
          </select>
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            marginTop: '8px',
            padding: '10px',
            background: 'rgba(255, 255, 100, 0.05)',
            border: '1px solid rgba(255, 255, 100, 0.3)',
            borderRadius: '4px'
          }}>
            <strong>Роли:</strong><br />
            - <strong>Студент:</strong> Доступ к курсам и личному кабинету<br />
            - <strong>Преподаватель:</strong> Проверка домашних заданий студентов<br />
            - <strong style={{ color: 'var(--neon-pink)' }}>Администратор:</strong> Полный доступ ко всем функциям системы
          </div>
        </div>

        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          fontSize: '13px',
          opacity: 0.8
        }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Создан:</strong> {new Date(user.created_at).toLocaleString('ru-RU')}
          </div>
          <div>
            <strong>Обновлен:</strong> {new Date(user.updated_at).toLocaleString('ru-RU')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => onSave(formData)}
            className="cyber-button"
            style={{ flex: 1 }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 0, 110, 0.3)',
          paddingTop: '20px'
        }}>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '1px solid rgba(255, 0, 110, 0.5)',
                borderRadius: '4px',
                color: 'var(--neon-pink)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Удалить пользователя
            </button>
          ) : (
            <div style={{
              padding: '15px',
              background: 'rgba(255, 0, 110, 0.1)',
              border: '1px solid var(--neon-pink)',
              borderRadius: '6px'
            }}>
              <p style={{
                marginBottom: '15px',
                fontSize: '14px',
                color: 'var(--neon-pink)'
              }}>
                Вы уверены? Это действие нельзя отменить. Все данные пользователя будут удалены.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onDelete(user.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--neon-pink)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Да, удалить
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({
  onCreate,
  onClose
}: {
  onCreate: (userData: { email: string; password: string; full_name: string; role: string }) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      alert('Email и пароль обязательны');
      return;
    }
    if (formData.password.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    setIsSubmitting(true);
    await onCreate(formData);
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div className="cyber-card" style={{
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{
          fontSize: '28px',
          marginBottom: '20px',
          color: 'var(--neon-cyan)'
        }}>
          Добавить пользователя
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="cyber-input"
            placeholder="user@example.com"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Пароль *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="cyber-input"
            placeholder="Минимум 6 символов"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Полное имя
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="cyber-input"
            placeholder="Иван Иванов"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--neon-cyan)',
            fontWeight: 600
          }}>
            Роль
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            <option value="user">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cyber-button"
            style={{ flex: 1, opacity: isSubmitting ? 0.5 : 1 }}
          >
            {isSubmitting ? 'Создание...' : 'Создать'}
          </button>
          <button
            onClick={onClose}
            className="cyber-button"
            style={{
              flex: 1,
              borderColor: 'var(--neon-pink)',
              color: 'var(--neon-pink)'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
