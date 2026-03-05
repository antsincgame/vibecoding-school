import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

async function ensureProfile(user: any) {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Авторизация...');
  const processedRef = useRef(false);

  const handleUser = async (user: any) => {
    if (processedRef.current) return;
    processedRef.current = true;
    setStatus('Проверка профиля...');
    try {
      await ensureProfile(user);
      setStatus('Успешно!');
      setTimeout(() => navigate('/student/dashboard', { replace: true }), 300);
    } catch (err) {
      console.error('Profile error:', err);
      setStatus('Ошибка авторизации');
      setTimeout(() => navigate('/student/login', { replace: true }), 1500);
    }
  };

  useEffect(() => {
    // Check existing session first
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) handleUser(data.session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) handleUser(session.user);
    });

    const timeout = setTimeout(() => {
      if (!processedRef.current) {
        setStatus('Ошибка авторизации');
        setTimeout(() => navigate('/student/login', { replace: true }), 1500);
      }
    }, 10000);

    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', paddingBottom: '350px' }}>
      <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>{status}</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 255, 249, 0.3)', borderTop: '3px solid var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
