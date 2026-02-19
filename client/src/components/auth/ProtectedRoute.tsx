import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';
import { ROUTES, type Role } from '@/utils/constants';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's default page based on their role
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
}

function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return ROUTES.ADMIN.DASHBOARD;
    case 'PARENT':
      return ROUTES.PARENT.DASHBOARD;
    case 'CHILD':
      return ROUTES.KIDS.LIBRARY;
    default:
      return ROUTES.HOME;
  }
}
