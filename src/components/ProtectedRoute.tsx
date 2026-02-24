import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px', color: 'var(--neon-cyan)' }}>Загрузка...</div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '20px', color: 'var(--neon-pink)', textAlign: 'center' }}>
          Не удалось загрузить профиль
        </div>
        <p style={{ opacity: 0.8, textAlign: 'center', maxWidth: '400px' }}>
          Выйдите и войдите снова. Если проблема сохраняется, обратитесь в поддержку.
        </p>
        <button
          onClick={() => signOut().then(() => window.location.assign('/student/login'))}
          className="cyber-button"
          style={{ padding: '12px 24px' }}
        >
          Выйти и войти снова
        </button>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
}
