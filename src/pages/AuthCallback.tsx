import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        navigate('/student/dashboard', { replace: true });
      } else if (!user) {
        navigate('/student/login', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', paddingBottom: '350px' }}>
      <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>Авторизация...</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 255, 249, 0.3)', borderTop: '3px solid var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
