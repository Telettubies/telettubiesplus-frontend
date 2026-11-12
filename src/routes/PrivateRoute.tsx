import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { SkeletonLoader } from '@/shared/components/feedback/SkeletonLoader';
import { ROUTE_PATHS } from './routePaths';

interface PrivateRouteProps {
  children?: React.ReactElement;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SkeletonLoader variant="fullscreen" />;
  }

  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTE_PATHS.LOGIN}?redirect=${redirectTarget}`} replace />;
  }

  return children ?? <Outlet />;
};
