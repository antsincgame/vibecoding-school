import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Авторизация...');
  const processedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    const errorParam = hashParams.get('error') || queryParams.get('error');
    const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const code = queryParams.get('code');

    if (errorParam) {
      setStatus(`Ошибка: ${errorDesc || errorParam}`);
      timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 2000);
      return;
    }

    let cleanup: (() => void) | null = null;

    const waitForProfile = async (userId: string, maxAttempts = 10): Promise<boolean> => {
      for (let i = 0; i < maxAttempts; i++) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          return true;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return false;
    };

    const handleAuth = async () => {
      if (processedRef.current) {
        return;
      }

      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession?.user) {
        processedRef.current = true;

        setStatus('Проверка профиля...');
        const profileExists = await waitForProfile(existingSession.user.id);

        if (!profileExists) {
          setStatus('Ошибка создания профиля');
          timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
          return;
        }

        window.history.replaceState(null, '', '/auth/callback');
        setStatus('Успешно! Перенаправление...');
        timeoutRef.current = setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 300);
        return;
      }

      if (code) {
        try {
          processedRef.current = true;
          setStatus('Обмен кода на сессию...');

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (data.session?.user) {
            setStatus('Создание профиля...');
            const profileExists = await waitForProfile(data.session.user.id);

            if (!profileExists) {
              setStatus('Ошибка создания профиля');
              timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
              return;
            }

            window.history.replaceState(null, '', '/auth/callback');
            setStatus('Успешно! Перенаправление...');
            timeoutRef.current = setTimeout(() => {
              navigate('/student/dashboard', { replace: true });
            }, 500);
          }
        } catch (err) {
          setStatus('Ошибка авторизации');
          timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
        }
        return;
      }

      if (accessToken && refreshToken) {
        try {
          processedRef.current = true;

          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            throw setSessionError;
          }

          const { data: { session: verifySession } } = await supabase.auth.getSession();

          if (verifySession?.user) {
            setStatus('Создание профиля...');
            const profileExists = await waitForProfile(verifySession.user.id);

            if (!profileExists) {
              setStatus('Ошибка создания профиля');
              timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
              return;
            }
          }

          window.history.replaceState(null, '', '/auth/callback');
          setStatus('Успешно! Перенаправление...');
          timeoutRef.current = setTimeout(() => {
            navigate('/student/dashboard', { replace: true });
          }, 500);
        } catch (err) {
          setStatus('Ошибка авторизации');
          timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
        }
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !processedRef.current) {
          processedRef.current = true;

          setStatus('Создание профиля...');
          const profileExists = await waitForProfile(session.user.id);

          if (!profileExists) {
            setStatus('Ошибка создания профиля');
            timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
            return;
          }

          window.history.replaceState(null, '', '/auth/callback');
          setStatus('Успешно! Перенаправление...');
          timeoutRef.current = setTimeout(() => {
            navigate('/student/dashboard', { replace: true });
          }, 300);
        }
      });

      cleanup = () => subscription.unsubscribe();

      timeoutRef.current = setTimeout(() => {
        if (!processedRef.current) {
          setStatus('Сессия не найдена');
          timeoutRef.current = setTimeout(() => navigate('/student/login', { replace: true }), 1500);
        }
      }, 8000);
    };

    handleAuth();

    return () => {
      if (cleanup) cleanup();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      paddingBottom: '350px'
    }}>
      <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>
        {status}
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 255, 249, 0.3)',
        borderTop: '3px solid var(--neon-cyan)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
