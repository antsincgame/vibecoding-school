import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface EmailSettings {
  confirmationEnabled: boolean;
  confirmationSubject: string;
  confirmationTemplate: string;
  welcomeSubject: string;
  welcomeTemplate: string;
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  resendReplyTo: string;
  resendTrackOpens: boolean;
  resendTrackClicks: boolean;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  template_type: string;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export default function EmailSettingsManager() {
  const [settings, setSettings] = useState<EmailSettings>({
    confirmationEnabled: true,
    confirmationSubject: '',
    confirmationTemplate: '',
    welcomeSubject: '',
    welcomeTemplate: '',
    resendApiKey: '',
    resendFromEmail: 'noreply@vibecoding.com',
    resendFromName: 'VIBECODING',
    resendReplyTo: '',
    resendTrackOpens: true,
    resendTrackClicks: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'resend' | 'templates' | 'analytics'>('resend');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadEmailLogs();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'email_confirmation_enabled',
          'email_confirmation_subject',
          'email_confirmation_template',
          'email_welcome_subject',
          'email_welcome_template',
          'resend_api_key',
          'resend_from_email',
          'resend_from_name',
          'resend_reply_to',
          'resend_track_opens',
          'resend_track_clicks'
        ]);

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });

        setSettings({
          confirmationEnabled: settingsMap['email_confirmation_enabled'] === 'true',
          confirmationSubject: settingsMap['email_confirmation_subject'] || '',
          confirmationTemplate: settingsMap['email_confirmation_template'] || '',
          welcomeSubject: settingsMap['email_welcome_subject'] || '',
          welcomeTemplate: settingsMap['email_welcome_template'] || '',
          resendApiKey: settingsMap['resend_api_key'] || '',
          resendFromEmail: settingsMap['resend_from_email'] || 'noreply@vibecoding.com',
          resendFromName: settingsMap['resend_from_name'] || 'VIBECODING',
          resendReplyTo: settingsMap['resend_reply_to'] || '',
          resendTrackOpens: settingsMap['resend_track_opens'] !== 'false',
          resendTrackClicks: settingsMap['resend_track_clicks'] !== 'false'
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('id, recipient_email, subject, template_type, status, opened_at, clicked_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error loading email logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          key: 'email_confirmation_enabled',
          value: settings.confirmationEnabled.toString(),
          description: 'Enable email confirmation for new students'
        },
        {
          key: 'email_confirmation_subject',
          value: settings.confirmationSubject,
          description: 'Subject for email confirmation'
        },
        {
          key: 'email_confirmation_template',
          value: settings.confirmationTemplate,
          description: 'HTML template for email confirmation'
        },
        {
          key: 'email_welcome_subject',
          value: settings.welcomeSubject,
          description: 'Subject for welcome email'
        },
        {
          key: 'email_welcome_template',
          value: settings.welcomeTemplate,
          description: 'HTML template for welcome email'
        },
        {
          key: 'resend_api_key',
          value: settings.resendApiKey,
          description: 'Resend API Key'
        },
        {
          key: 'resend_from_email',
          value: settings.resendFromEmail,
          description: 'Email отправителя'
        },
        {
          key: 'resend_from_name',
          value: settings.resendFromName,
          description: 'Имя отправителя'
        },
        {
          key: 'resend_reply_to',
          value: settings.resendReplyTo,
          description: 'Email для ответов (опционально)'
        },
        {
          key: 'resend_track_opens',
          value: settings.resendTrackOpens.toString(),
          description: 'Отслеживать открытия писем'
        },
        {
          key: 'resend_track_clicks',
          value: settings.resendTrackClicks.toString(),
          description: 'Отслеживать клики по ссылкам'
        }
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

        if (error) throw error;
      }

      alert('Настройки email успешно сохранены!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Введите email адрес для отправки тестового письма' });
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTestResult({ success: false, message: 'Необходима авторизация' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ testEmail }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({ success: true, message: result.message });
      } else {
        setTestResult({ success: false, message: result.error || 'Ошибка отправки' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestResult({ success: false, message: 'Ошибка соединения с сервером' });
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#00fff9';
      case 'delivered':
        return '#00ff64';
      case 'opened':
        return '#00ff64';
      case 'clicked':
        return '#ffc800';
      case 'bounced':
        return '#ff006e';
      case 'complained':
        return '#ff006e';
      default:
        return '#888';
    }
  };

  const getStatusText = (status: string) => {
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
        return 'Жалоба';
      case 'pending':
        return 'Ожидание';
      default:
        return status;
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(0, 255, 249, 0.05)',
        border: '1px solid rgba(0, 255, 249, 0.2)',
        borderRadius: '8px'
      }}>
        <h3 style={{
          fontSize: '18px',
          marginBottom: '15px',
          color: 'var(--neon-cyan)'
        }}>
          Resend.com - Email сервис
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>
          Для отправки email используется сервис Resend.com с верифицированным доменом vibecoding.com.
        </p>
        <ul style={{ fontSize: '14px', opacity: 0.9, paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Бесплатно до 3000 писем/месяц</li>
          <li>Аналитика открытий и кликов</li>
          <li>Поддержка массовых рассылок</li>
        </ul>
      </div>

      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(0, 255, 249, 0.2)',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('resend')}
          className="cyber-button"
          style={{
            background: activeTab === 'resend' ? 'rgba(0, 255, 249, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'resend' ? '2px solid var(--neon-cyan)' : 'none',
            borderRadius: 0,
            padding: '15px 30px'
          }}
        >
          Resend API
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className="cyber-button"
          style={{
            background: activeTab === 'templates' ? 'rgba(255, 0, 110, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid var(--neon-pink)' : 'none',
            borderRadius: 0,
            padding: '15px 30px'
          }}
        >
          Шаблоны
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className="cyber-button"
          style={{
            background: activeTab === 'analytics' ? 'rgba(0, 255, 100, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--neon-green)' : 'none',
            borderRadius: 0,
            padding: '15px 30px'
          }}
        >
          Аналитика
        </button>
      </div>

      {activeTab === 'resend' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                Resend API Key *
              </label>
              <input
                type="password"
                value={settings.resendApiKey}
                onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                className="cyber-input"
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              />
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>
                Получите API ключ в <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)' }}>resend.com/api-keys</a>
              </p>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                Email отправителя *
              </label>
              <input
                type="email"
                value={settings.resendFromEmail}
                onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                className="cyber-input"
                placeholder="noreply@vibecoding.com"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                Имя отправителя
              </label>
              <input
                type="text"
                value={settings.resendFromName}
                onChange={(e) => setSettings({ ...settings, resendFromName: e.target.value })}
                className="cyber-input"
                placeholder="VIBECODING"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                Reply-To Email (опционально)
              </label>
              <input
                type="email"
                value={settings.resendReplyTo}
                onChange={(e) => setSettings({ ...settings, resendReplyTo: e.target.value })}
                className="cyber-input"
                placeholder="support@vibecoding.com"
              />
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>
                Email на который будут приходить ответы от получателей
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '30px',
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(0, 255, 100, 0.05)',
            border: '1px solid rgba(0, 255, 100, 0.2)',
            borderRadius: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.resendTrackOpens}
                onChange={(e) => setSettings({ ...settings, resendTrackOpens: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
                Отслеживать открытия
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.resendTrackClicks}
                onChange={(e) => setSettings({ ...settings, resendTrackClicks: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
                Отслеживать клики
              </span>
            </label>
          </div>

          <div style={{
            marginTop: '30px',
            padding: '25px',
            background: 'rgba(0, 255, 249, 0.05)',
            border: '2px solid rgba(0, 255, 249, 0.3)',
            borderRadius: '12px'
          }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: 'var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              Тестовое письмо
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
              Отправьте тестовое письмо для проверки настроек Resend. Убедитесь, что настройки сохранены перед отправкой.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-start',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'var(--neon-cyan)',
                  fontWeight: 600
                }}>
                  Email получателя
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => {
                    setTestEmail(e.target.value);
                    setTestResult(null);
                  }}
                  className="cyber-input"
                  placeholder="test@example.com"
                  disabled={sendingTest}
                />
              </div>
              <button
                onClick={sendTestEmail}
                className="cyber-button"
                disabled={sendingTest || !testEmail}
                style={{
                  marginTop: '28px',
                  minWidth: '200px',
                  background: sendingTest ? 'rgba(0, 255, 249, 0.1)' : 'rgba(0, 255, 249, 0.2)',
                  opacity: (sendingTest || !testEmail) ? 0.5 : 1,
                  cursor: (sendingTest || !testEmail) ? 'not-allowed' : 'pointer'
                }}
              >
                {sendingTest ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ТЕСТ'}
              </button>
            </div>

            {testResult && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: testResult.success ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 0, 110, 0.1)',
                border: `1px solid ${testResult.success ? 'rgba(0, 255, 100, 0.5)' : 'rgba(255, 0, 110, 0.5)'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={testResult.success ? '#00ff64' : '#ff006e'} strokeWidth="2">
                  {testResult.success ? (
                    <path d="M20 6L9 17l-5-5"/>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4M12 16h.01"/>
                    </>
                  )}
                </svg>
                <span style={{
                  color: testResult.success ? '#00ff64' : '#ff006e',
                  fontWeight: 500
                }}>
                  {testResult.message}
                </span>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(255, 200, 0, 0.05)',
            border: '1px solid rgba(255, 200, 0, 0.3)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#ffc800', marginBottom: '10px' }}>Настройка Webhook для аналитики</h4>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>
              Для получения данных об открытиях и кликах настройте webhook в Resend Dashboard:
            </p>
            <ol style={{ fontSize: '13px', opacity: 0.8, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Перейдите в <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)' }}>resend.com/webhooks</a></li>
              <li>Нажмите "Add Webhook"</li>
              <li>Endpoint URL: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-webhook</code></li>
              <li>Выберите события: email.sent, email.delivered, email.opened, email.clicked, email.bounced</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.confirmationEnabled}
                onChange={(e) => setSettings({ ...settings, confirmationEnabled: e.target.checked })}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
                Включить подтверждение email для новых учеников
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '20px' }}>Письмо подтверждения</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                Тема письма
              </label>
              <input
                type="text"
                value={settings.confirmationSubject}
                onChange={(e) => setSettings({ ...settings, confirmationSubject: e.target.value })}
                className="cyber-input"
                placeholder="Подтверждение регистрации в VIBECODING"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-cyan)',
                fontWeight: 600
              }}>
                HTML шаблон
                <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '10px', fontWeight: 400 }}>
                  (Переменные: {'\{\{ .ConfirmationURL \}\}'}, {'\{\{ .SiteURL \}\}'})
                </span>
              </label>
              <textarea
                value={settings.confirmationTemplate}
                onChange={(e) => setSettings({ ...settings, confirmationTemplate: e.target.value })}
                className="cyber-input"
                style={{
                  minHeight: '300px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}
                placeholder="<!DOCTYPE html>..."
              />
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--neon-pink)', marginBottom: '20px' }}>Приветственное письмо</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-pink)',
                fontWeight: 600
              }}>
                Тема письма
              </label>
              <input
                type="text"
                value={settings.welcomeSubject}
                onChange={(e) => setSettings({ ...settings, welcomeSubject: e.target.value })}
                className="cyber-input"
                placeholder="Добро пожаловать в VIBECODING!"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--neon-pink)',
                fontWeight: 600
              }}>
                HTML шаблон
                <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '10px', fontWeight: 400 }}>
                  (Переменные: {'\{\{ .UserName \}\}'}, {'\{\{ .DashboardURL \}\}'})
                </span>
              </label>
              <textarea
                value={settings.welcomeTemplate}
                onChange={(e) => setSettings({ ...settings, welcomeTemplate: e.target.value })}
                className="cyber-input"
                style={{
                  minHeight: '300px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}
                placeholder="<!DOCTYPE html>..."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--neon-green)', margin: 0 }}>История отправок</h3>
            <button
              onClick={loadEmailLogs}
              className="cyber-button"
              disabled={loadingLogs}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                opacity: loadingLogs ? 0.5 : 1
              }}
            >
              {loadingLogs ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>

          {loadingLogs ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>
          ) : emailLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(0, 255, 100, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 255, 100, 0.2)'
            }}>
              <p style={{ fontSize: '16px', opacity: 0.8 }}>Нет отправленных писем</p>
              <p style={{ fontSize: '14px', opacity: 0.6 }}>Отправьте тестовое письмо для проверки</p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 255, 249, 0.1)' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', color: 'var(--neon-cyan)', fontWeight: 600 }}>Получатель</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', color: 'var(--neon-cyan)', fontWeight: 600 }}>Тема</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center', color: 'var(--neon-cyan)', fontWeight: 600 }}>Статус</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center', color: 'var(--neon-cyan)', fontWeight: 600 }}>Открыто</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right', color: 'var(--neon-cyan)', fontWeight: 600 }}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log) => (
                    <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>{log.recipient_email}</td>
                      <td style={{ padding: '12px 15px', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: `${getStatusColor(log.status)}20`,
                          color: getStatusColor(log.status),
                          border: `1px solid ${getStatusColor(log.status)}50`
                        }}>
                          {getStatusText(log.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '14px' }}>
                        {log.opened_at ? (
                          <span style={{ color: '#00ff64' }}>
                            {new Date(log.opened_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.4 }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', opacity: 0.7 }}>
                        {new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '30px'
      }}>
        <button
          onClick={loadSettings}
          className="cyber-button"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          disabled={saving}
        >
          Сбросить
        </button>
        <button
          onClick={saveSettings}
          className="cyber-button"
          disabled={saving}
          style={{
            opacity: saving ? 0.5 : 1,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
        </button>
      </div>
    </div>
  );
}
