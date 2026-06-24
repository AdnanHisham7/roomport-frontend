import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { baseApi } from '@/store/api/baseApi';

export function useAuth() {
  const { user, isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore — clear local state regardless
    }
    dispatch(logoutAction());
    dispatch(baseApi.util.resetApiState());
  }, [dispatch, logoutMutation]);

  return {
    user,
    isAuthenticated,
    accessToken,
    logout,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isBuilder: user?.role === 'admin' || user?.role === 'manager',
  };
}
