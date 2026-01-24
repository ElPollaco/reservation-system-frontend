import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, requireCompany = false }) => {
  const { isAuthenticated, hasCompanySelected, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireCompany && !hasCompanySelected) {
    return <Navigate to="/select-company" replace />;
  }

  return children;
};

export default PrivateRoute;