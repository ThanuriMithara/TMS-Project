import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.must_reset_password) {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.must_reset_password) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
