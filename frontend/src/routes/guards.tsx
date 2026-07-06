import { type ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';
import { useGetMySubscriptionQuery, useGetMyPeriodsQuery } from '@/store/api/subscriptionApi';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export function RoleRoute({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'super_admin' ? '/super-admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

/**
 * SubscriptionGuard wraps the entire builder dashboard.
 * It allows access to /dashboard/billing so the user can view billing.
 * All other routes are blocked if no active paid period exists.
 */
export function SubscriptionGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isBillingPage = location.pathname === '/dashboard/billing';

  const { data: subData, isLoading: subLoading } = useGetMySubscriptionQuery(undefined, {
    skip: !user || user.role === 'super_admin',
  });

  const { data: periodsData, isLoading: periodsLoading } = useGetMyPeriodsQuery(undefined, {
    skip: !user || user.role === 'super_admin' || !subData?.data,
  });

  const isLoading = subLoading || periodsLoading;

  useEffect(() => {
    if (isLoading || !user || user.role === 'super_admin') return;

    const sub = subData?.data;
    if (!sub || sub.status !== 'active') {
      if (!isBillingPage) navigate('/subscription-expired', { replace: true });
      return;
    }

    const now = new Date();
    const periods = periodsData?.data ?? [];
    const hasActivePaidPeriod = periods.some(p => {
      return (
        p.status === 'paid' &&
        new Date(p.periodStart) <= now &&
        new Date(p.periodEnd) >= now
      );
    });

    if (!hasActivePaidPeriod && !isBillingPage) {
      navigate('/subscription-expired', { replace: true });
    }
  }, [isLoading, subData, periodsData, isBillingPage, user, navigate]);

  if (isLoading) return null;

  return <>{children}</>;
}
