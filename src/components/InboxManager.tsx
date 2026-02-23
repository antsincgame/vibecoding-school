import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
  storage_path: string;
}

interface InboxEmail {
  id: string;
  message_id: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  text_content: string | null;
  html_content: string | null;
  headers: Record<string, string>;
  attachments: EmailAttachment[];
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function InboxManager() {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('inbox')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } else {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      await supabase
        .from('inbox')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', emailId);

      setEmails(emails.map(email =>
        email.id === emailId ? { ...email, is_read: true } : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const toggleArchive = async (emailId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('inbox')
        .update({ is_archived: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', emailId);

      fetchEmails();
      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, is_archived: !currentStatus });
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Удалить это письмо?')) return;

    try {
      await supabase
        .from('inbox')
        .delete()
        .eq('id', emailId);

      fetchEmails();
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const toggleEmailSelection = (emailId: string) => {
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(emailId)) {
      newSelection.delete(emailId);
    } else {
      newSelection.add(emailId);
    }
    setSelectedEmails(newSelection);
  };

  const selectAllEmails = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(e => e.id)));
    }
  };

  const bulkArchive = async () => {
    if (selectedEmails.size === 0) return;

    try {
      const isArchived = filter === 'archived';
      await supabase
        .from('inbox')
        .update({ is_archived: !isArchived, updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedEmails));

      setSelectedEmails(new Set());
      setSelectionMode(false);
      fetchEmails();
    } catch (error) {
      console.error('Error archiving emails:', error);
      alert('Ошибка при архивировании писем');
    }
  };

  const bulkDelete = async () => {
    if (selectedEmails.size === 0) return;

    if (!confirm(`Удалить выбранные письма (${selectedEmails.size})?`)) return;

    try {
      await supabase
        .from('inbox')
        .delete()
        .in('id', Array.from(selectedEmails));

      setSelectedEmails(new Set());
      setSelectionMode(false);
      if (selectedEmail && selectedEmails.has(selectedEmail.id)) {
        setSelectedEmail(null);
      }
      fetchEmails();
    } catch (error) {
      console.error('Error deleting emails:', error);
      alert('Ошибка при удалении писем');
    }
  };

  const downloadAttachment = async (attachment: EmailAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('email-attachments')
        .download(attachment.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Ошибка при загрузке файла');
    }
  };

  const selectEmail = (email: InboxEmail) => {
    setSelectedEmail(email);
    setShowReplyEditor(false);
    setReplyContent('');
    if (!email.is_read) {
      markAsRead(email.id);
    }
  };

  const sendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;

    try {
      setSending(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: selectedEmail.from_email,
            subject: `Re: ${selectedEmail.subject || '(No subject)'}`,
            html: replyContent.replace(/\n/g, '<br>'),
            text: replyContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Ответ отправлен успешно!');
      setShowReplyEditor(false);
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Ошибка при отправке ответа');
    } finally {
      setSending(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--neon-green)' }}>
          Inbox
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'unread', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'var(--neon-green)' : 'rgba(0, 255, 100, 0.1)',
                color: filter === f ? '#000' : 'var(--neon-green)',
                border: '1px solid var(--neon-green)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: filter === f ? 'bold' : 'normal'
              }}
            >
              {f === 'all' ? 'Все' : f === 'unread' ? 'Непрочитанные' : 'Архив'}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedEmails(new Set());
          }}
          className="cyber-button"
          style={{
            padding: '8px 20px',
            background: selectionMode ? 'var(--neon-cyan)' : undefined,
            color: selectionMode ? '#000' : undefined,
            borderColor: selectionMode ? 'var(--neon-cyan)' : undefined
          }}
        >
          {selectionMode ? 'ОТМЕНИТЬ ВЫБОР' : 'ВЫБРАТЬ'}
        </button>
        <button
          onClick={fetchEmails}
          className="cyber-button"
          style={{ marginLeft: 'auto', padding: '8px 20px' }}
        >
          ОБНОВИТЬ
        </button>
      </div>

      {selectionMode && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '8px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ color: 'var(--neon-cyan)', fontSize: '14px' }}>
            Выбрано: {selectedEmails.size} из {emails.length}
          </div>
          <button
            onClick={selectAllEmails}
            className="cyber-button"
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              borderColor: 'var(--neon-cyan)',
              color: 'var(--neon-cyan)'
            }}
          >
            {selectedEmails.size === emails.length ? 'СНЯТЬ ВСЕ' : 'ВЫБРАТЬ ВСЕ'}
          </button>
          {selectedEmails.size > 0 && (
            <>
              <button
                onClick={bulkArchive}
                className="cyber-button"
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  borderColor: 'var(--neon-green)',
                  color: 'var(--neon-green)'
                }}
              >
                {filter === 'archived' ? 'РАЗАРХИВИРОВАТЬ' : 'В АРХИВ'}
              </button>
              <button
                onClick={bulkDelete}
                className="cyber-button"
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  borderColor: 'var(--neon-pink)',
                  color: 'var(--neon-pink)'
                }}
              >
                УДАЛИТЬ
              </button>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedEmail ? '350px 1fr' : '1fr', gap: '20px', minHeight: '600px' }}>
        <div style={{
          background: 'rgba(0, 255, 100, 0.05)',
          border: '1px solid rgba(0, 255, 100, 0.2)',
          borderRadius: '8px',
          padding: '15px',
          overflowY: 'auto',
          maxHeight: '700px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              Загрузка...
            </div>
          ) : emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              {filter === 'all' ? 'Нет входящих писем' :
               filter === 'unread' ? 'Нет непрочитанных писем' :
               'Нет архивных писем'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    if (selectionMode) {
                      toggleEmailSelection(email.id);
                    } else {
                      selectEmail(email);
                    }
                  }}
                  style={{
                    padding: '15px',
                    background: selectionMode && selectedEmails.has(email.id)
                      ? 'rgba(0, 255, 255, 0.15)'
                      : selectedEmail?.id === email.id
                      ? 'rgba(0, 255, 100, 0.2)'
                      : email.is_read
                      ? 'rgba(0, 255, 100, 0.05)'
                      : 'rgba(0, 255, 100, 0.1)',
                    border: `1px solid ${
                      selectionMode && selectedEmails.has(email.id)
                        ? 'var(--neon-cyan)'
                        : selectedEmail?.id === email.id
                        ? 'var(--neon-green)'
                        : email.is_read
                        ? 'rgba(0, 255, 100, 0.2)'
                        : 'var(--neon-green)'
                    }`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEmail?.id !== email.id) {
                      e.currentTarget.style.borderColor = selectionMode ? 'var(--neon-cyan)' : 'var(--neon-green)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEmail?.id !== email.id) {
                      e.currentTarget.style.borderColor = selectionMode && selectedEmails.has(email.id)
                        ? 'var(--neon-cyan)'
                        : email.is_read
                        ? 'rgba(0, 255, 100, 0.2)'
                        : 'var(--neon-green)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: 'var(--neon-cyan)',
                          flexShrink: 0
                        }}
                      />
                    )}
                    {!email.is_read && !selectionMode && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--neon-green)',
                        boxShadow: '0 0 8px var(--neon-green)',
                        flexShrink: 0
                      }} />
                    )}
                    <strong style={{
                      color: selectionMode && selectedEmails.has(email.id) ? 'var(--neon-cyan)' : 'var(--neon-green)',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {email.from_name || email.from_email}
                    </strong>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    marginBottom: '5px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {email.subject || '(Без темы)'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatDate(email.created_at)}
                  </div>
                  {email.attachments && email.attachments.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        border: '1px solid #8b5cf6',
                        borderRadius: '3px'
                      }}>
                        📎 {email.attachments.length}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedEmail && (
          <div style={{
            background: 'rgba(0, 255, 100, 0.05)',
            border: '1px solid rgba(0, 255, 100, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '700px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(0, 255, 100, 0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'var(--neon-green)', fontSize: '18px', flex: 1 }}>
                  {selectedEmail.subject || '(Без темы)'}
                </h3>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>От:</strong> {selectedEmail.from_name || selectedEmail.from_email}
                  {selectedEmail.from_name && <> &lt;{selectedEmail.from_email}&gt;</>}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Кому:</strong> {selectedEmail.to_email}
                </div>
                <div>
                  <strong>Дата:</strong> {formatDate(selectedEmail.created_at)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowReplyEditor(!showReplyEditor)}
                  className="cyber-button"
                  style={{ padding: '6px 16px', fontSize: '13px' }}
                >
                  {showReplyEditor ? 'ОТМЕНИТЬ ОТВЕТ' : 'ОТВЕТИТЬ'}
                </button>
                <button
                  onClick={() => toggleArchive(selectedEmail.id, selectedEmail.is_archived)}
                  className="cyber-button"
                  style={{ padding: '6px 16px', fontSize: '13px' }}
                >
                  {selectedEmail.is_archived ? 'РАЗАРХИВИРОВАТЬ' : 'В АРХИВ'}
                </button>
                <button
                  onClick={() => deleteEmail(selectedEmail.id)}
                  className="cyber-button"
                  style={{
                    padding: '6px 16px',
                    fontSize: '13px',
                    borderColor: 'var(--neon-pink)',
                    color: 'var(--neon-pink)'
                  }}
                >
                  УДАЛИТЬ
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '10px', fontSize: '14px' }}>
                    Вложения:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid #8b5cf6',
                          borderRadius: '6px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px' }}>{attachment.filename}</div>
                          <div style={{ fontSize: '11px', opacity: 0.6 }}>
                            {attachment.content_type} • {formatFileSize(attachment.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => downloadAttachment(attachment)}
                          className="cyber-button"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          СКАЧАТЬ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showReplyEditor ? (
                <div style={{
                  padding: '20px',
                  background: 'rgba(0, 255, 100, 0.05)',
                  border: '1px solid var(--neon-green)',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: 'var(--neon-green)', marginBottom: '10px', fontSize: '14px' }}>
                    Ответить на письмо:
                  </h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Введите текст ответа..."
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '15px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(0, 255, 100, 0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '15px'
                    }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyContent.trim()}
                    className="cyber-button"
                    style={{
                      padding: '8px 20px',
                      fontSize: '14px',
                      opacity: sending || !replyContent.trim() ? 0.5 : 1,
                      cursor: sending || !replyContent.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {sending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ОТВЕТ'}
                  </button>
                </div>
              ) : null}

              <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {selectedEmail.html_content ? (
                  <iframe
                    srcDoc={selectedEmail.html_content}
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      border: 'none',
                      background: 'white',
                      borderRadius: '4px'
                    }}
                    title="Email content"
                  />
                ) : selectedEmail.text_content ? (
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    margin: 0,
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {selectedEmail.text_content}
                  </pre>
                ) : (
                  <div style={{ opacity: 0.5, textAlign: 'center', padding: '40px' }}>
                    Нет содержимого
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
