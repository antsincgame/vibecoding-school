import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Авторизация...');
  const processedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (processedRef.current) return;
      if (event === 'SIGNED_IN' && session?.user) {
        processedRef.current = true;
        const user = session.user;
        setStatus('Проверка профиля...');
        try {
          const { data: profile } = await supabase
            .from('profiles').select('id, email, role')
            .eq('email', user.email).maybeSingle();

          if (!profile) {
            setStatus('Создание профиля...');
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
              role: 'student',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          setStatus('Успешно! Перенаправление...');
          setTimeout(() => navigate('/student/dashboard', { replace: true }), 300);
        } catch (err) {
          console.error('Auth callback error:', err);
          setStatus('Ошибка авторизации');
          setTimeout(() => navigate('/student/login', { replace: true }), 1500);
        }
      } else if (event === 'SIGNED_OUT') {
        navigate('/student/login', { replace: true });
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!processedRef.current) {
        setStatus('Ошибка авторизации');
        setTimeout(() => navigate('/student/login', { replace: true }), 1500);
      }
    }, 10000);

    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', paddingBottom: '350px' }}>
      <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>{status}</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 255, 249, 0.3)', borderTop: '3px solid var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
