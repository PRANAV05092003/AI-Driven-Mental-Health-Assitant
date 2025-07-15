import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { AuthHookReturn } from '../../types/auth';
import LoadingSpinner from './LoadingSpinner';
import { User } from '../../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
}) => {
  const auth: AuthHookReturn = useAuth();
  const { isAuthenticated = false, isLoading = true, user = null } = auth || {};
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they log in, which is a nicer user experience.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role if specified
  if (requiredRole && (user as User)?.role !== requiredRole) {
    // Redirect to home or specified route if user doesn't have required role
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If we have children, render them, otherwise render the Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
