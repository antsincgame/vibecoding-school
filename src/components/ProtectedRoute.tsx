import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) {
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

  if (!user || !profile) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
}
