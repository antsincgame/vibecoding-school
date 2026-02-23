import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface EmailLog {
  id: string;
  resend_email_id: string | null;
  recipient_email: string;
  subject: string;
  template_type: string;
  status: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export default function EmailLogsManager() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'sent':
        return '#3b82f6';
      case 'delivered':
        return 'var(--neon-green)';
      case 'opened':
        return '#8b5cf6';
      case 'clicked':
        return '#ec4899';
      case 'bounced':
        return 'var(--neon-pink)';
      case 'complained':
        return '#ef4444';
      case 'delayed':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'sent':
        return 'Отправлено';
      case 'delivered':
        return 'Доставлено';
      case 'opened':
        return 'Открыто';
      case 'clicked':
        return 'Клик';
      case 'bounced':
        return 'Отклонено';
      case 'complained':
        return 'Спам';
      case 'delayed':
        return 'Задержано';
      default:
        return status || 'В очереди';
    }
  };

  const getTemplateText = (template: string) => {
    switch (template) {
      case 'verification':
        return 'Подтверждение email';
      case 'password_reset':
        return 'Сброс пароля';
      case 'bulk':
        return 'Массовая рассылка';
      default:
        return template;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--neon-green)' }}>
          Логи Email
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                background: filter === status ? 'var(--neon-green)' : 'rgba(0, 255, 100, 0.1)',
                color: filter === status ? '#000' : 'var(--neon-green)',
                border: '1px solid var(--neon-green)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: filter === status ? 'bold' : 'normal'
              }}
            >
              {status === 'all' ? 'Все' : getStatusText(status)}
            </button>
          ))}
        </div>
        <button
          onClick={fetchLogs}
          className="cyber-button"
          style={{ marginLeft: 'auto', padding: '8px 20px' }}
        >
          ОБНОВИТЬ
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
          Загрузка...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
          {filter === 'all' ? 'Нет отправленных писем' : `Нет писем со статусом "${getStatusText(filter)}"`}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--neon-green)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Дата</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Получатель</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Тема</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Тип</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--neon-green)' }}>Детали</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: '1px solid rgba(0, 255, 100, 0.2)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 100, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', fontSize: '13px', opacity: 0.8 }}>
                    {formatDate(log.created_at)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {log.recipient_email}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {log.subject}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', opacity: 0.8 }}>
                    {getTemplateText(log.template_type)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: `${getStatusColor(log.status)}20`,
                      color: getStatusColor(log.status),
                      border: `1px solid ${getStatusColor(log.status)}`
                    }}>
                      {getStatusText(log.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', opacity: 0.8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {log.opened_at && (
                        <div>Открыто: {formatDate(log.opened_at)}</div>
                      )}
                      {log.clicked_at && (
                        <div>Клик: {formatDate(log.clicked_at)}</div>
                      )}
                      {log.bounced_at && (
                        <div style={{ color: 'var(--neon-pink)' }}>
                          Отклонено: {formatDate(log.bounced_at)}
                        </div>
                      )}
                      {log.error_message && (
                        <div style={{ color: 'var(--neon-pink)', fontSize: '12px' }}>
                          {log.error_message}
                        </div>
                      )}
                      {log.resend_email_id && (
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>
                          ID: {log.resend_email_id}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
