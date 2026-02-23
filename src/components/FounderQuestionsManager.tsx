import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FounderQuestion {
  id: string;
  name: string;
  email: string;
  phone: string;
  question: string;
  status: 'new' | 'in_progress' | 'answered';
  admin_notes: string;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function FounderQuestionsManager() {
  const [questions, setQuestions] = useState<FounderQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'answered'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<FounderQuestion | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('founder_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: FounderQuestion['status']) => {
    try {
      setSaving(true);
      const updateData: Partial<FounderQuestion> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'answered') {
        updateData.answered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('founder_questions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.map(q =>
        q.id === id ? { ...q, ...updateData } : q
      ));

      if (selectedQuestion?.id === id) {
        setSelectedQuestion({ ...selectedQuestion, ...updateData });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedQuestion) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('founder_questions')
        .update({
          admin_notes: editingNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuestion.id);

      if (error) throw error;

      setQuestions(questions.map(q =>
        q.id === selectedQuestion.id ? { ...q, admin_notes: editingNotes } : q
      ));
      setSelectedQuestion({ ...selectedQuestion, admin_notes: editingNotes });
      alert('Заметки сохранены');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Ошибка при сохранении заметок');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Удалить этот вопрос?')) return;

    try {
      const { error } = await supabase
        .from('founder_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchQuestions();
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Ошибка при удалении');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'var(--neon-cyan)';
      case 'in_progress': return '#ffc107';
      case 'answered': return 'var(--neon-green)';
      default: return 'white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'answered': return 'Отвечен';
      default: return status;
    }
  };

  const selectQuestion = (question: FounderQuestion) => {
    setSelectedQuestion(question);
    setEditingNotes(question.admin_notes || '');
  };

  const newCount = questions.filter(q => q.status === 'new').length;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--neon-pink)' }}>
          Вопросы основателю
          {newCount > 0 && (
            <span style={{
              marginLeft: '12px',
              padding: '4px 10px',
              background: 'var(--neon-cyan)',
              color: '#000',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {newCount} новых
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'new', 'in_progress', 'answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'var(--neon-pink)' : 'rgba(255, 0, 110, 0.1)',
                color: filter === f ? '#fff' : 'var(--neon-pink)',
                border: '1px solid var(--neon-pink)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: filter === f ? 'bold' : 'normal'
              }}
            >
              {f === 'all' ? 'Все' :
               f === 'new' ? 'Новые' :
               f === 'in_progress' ? 'В работе' : 'Отвечены'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchQuestions}
          className="cyber-button"
          style={{ marginLeft: 'auto', padding: '8px 20px' }}
        >
          ОБНОВИТЬ
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedQuestion ? '400px 1fr' : '1fr',
        gap: '20px',
        minHeight: '600px'
      }}>
        <div style={{
          background: 'rgba(255, 0, 110, 0.05)',
          border: '1px solid rgba(255, 0, 110, 0.2)',
          borderRadius: '8px',
          padding: '15px',
          overflowY: 'auto',
          maxHeight: '700px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              Загрузка...
            </div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              {filter === 'all' ? 'Нет вопросов' :
               filter === 'new' ? 'Нет новых вопросов' :
               filter === 'in_progress' ? 'Нет вопросов в работе' : 'Нет отвеченных вопросов'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions.map((question) => (
                <div
                  key={question.id}
                  onClick={() => selectQuestion(question)}
                  style={{
                    padding: '16px',
                    background: selectedQuestion?.id === question.id
                      ? 'rgba(255, 0, 110, 0.2)'
                      : question.status === 'new'
                      ? 'rgba(0, 255, 249, 0.08)'
                      : 'rgba(255, 0, 110, 0.05)',
                    border: `1px solid ${
                      selectedQuestion?.id === question.id
                        ? 'var(--neon-pink)'
                        : question.status === 'new'
                        ? 'var(--neon-cyan)'
                        : 'rgba(255, 0, 110, 0.2)'
                    }`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <strong style={{
                      color: 'var(--neon-pink)',
                      fontSize: '15px'
                    }}>
                      {question.name}
                    </strong>
                    <span style={{
                      padding: '3px 10px',
                      background: `${getStatusColor(question.status)}20`,
                      color: getStatusColor(question.status),
                      border: `1px solid ${getStatusColor(question.status)}`,
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {getStatusLabel(question.status)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    opacity: 0.85,
                    marginBottom: '8px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}>
                    {question.question}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    display: 'flex',
                    gap: '15px'
                  }}>
                    <span>{question.email}</span>
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedQuestion && (
          <div style={{
            background: 'rgba(255, 0, 110, 0.05)',
            border: '1px solid rgba(255, 0, 110, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '700px'
          }}>
            <div style={{
              padding: '25px',
              borderBottom: '1px solid rgba(255, 0, 110, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: 'var(--neon-pink)',
                    fontSize: '22px'
                  }}>
                    {selectedQuestion.name}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    background: `${getStatusColor(selectedQuestion.status)}20`,
                    color: getStatusColor(selectedQuestion.status),
                    border: `1px solid ${getStatusColor(selectedQuestion.status)}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {getStatusLabel(selectedQuestion.status)}
                  </span>
                </div>
                <button
                  onClick={() => deleteQuestion(selectedQuestion.id)}
                  className="cyber-button"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    borderColor: 'var(--neon-pink)',
                    color: 'var(--neon-pink)'
                  }}
                >
                  УДАЛИТЬ
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Email
                  </div>
                  <a
                    href={`mailto:${selectedQuestion.email}`}
                    style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '14px' }}
                  >
                    {selectedQuestion.email}
                  </a>
                </div>
                {selectedQuestion.phone && (
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Телефон
                    </div>
                    <a
                      href={`tel:${selectedQuestion.phone}`}
                      style={{ color: 'var(--neon-green)', textDecoration: 'none', fontSize: '14px' }}
                    >
                      {selectedQuestion.phone}
                    </a>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Дата
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {formatDate(selectedQuestion.created_at)}
                  </div>
                </div>
                {selectedQuestion.answered_at && (
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Ответ дан
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--neon-green)' }}>
                      {formatDate(selectedQuestion.answered_at)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', opacity: 0.7, alignSelf: 'center' }}>
                  Статус:
                </span>
                {(['new', 'in_progress', 'answered'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedQuestion.id, status)}
                    disabled={saving || selectedQuestion.status === status}
                    style={{
                      padding: '8px 16px',
                      background: selectedQuestion.status === status ? getStatusColor(status) : 'transparent',
                      color: selectedQuestion.status === status ? '#000' : getStatusColor(status),
                      border: `1px solid ${getStatusColor(status)}`,
                      borderRadius: '4px',
                      cursor: selectedQuestion.status === status ? 'default' : 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedQuestion.status === status ? 'bold' : 'normal',
                      opacity: saving ? 0.5 : 1
                    }}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{
                  color: 'var(--neon-cyan)',
                  marginBottom: '12px',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Вопрос:
                </h4>
                <div style={{
                  padding: '20px',
                  background: 'rgba(0, 255, 249, 0.08)',
                  border: '1px solid rgba(0, 255, 249, 0.3)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedQuestion.question}
                </div>
              </div>

              <div>
                <h4 style={{
                  color: 'var(--neon-green)',
                  marginBottom: '12px',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Заметки администратора:
                </h4>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Добавьте заметки о вопросе, ответе или статусе..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '16px',
                    background: 'rgba(57, 255, 20, 0.08)',
                    border: '1px solid rgba(57, 255, 20, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: '15px',
                    lineHeight: 1.6
                  }}
                />
                <button
                  onClick={saveNotes}
                  disabled={saving || editingNotes === (selectedQuestion.admin_notes || '')}
                  className="cyber-button"
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    opacity: saving || editingNotes === (selectedQuestion.admin_notes || '') ? 0.5 : 1,
                    cursor: saving || editingNotes === (selectedQuestion.admin_notes || '') ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ЗАМЕТКИ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
