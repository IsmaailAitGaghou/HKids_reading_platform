import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth.api';
import { setToken, removeToken, getToken, setStoredUser, removeStoredUser, getStoredUser } from '@/utils/storage';
import { ROUTES, ROLES, type Role } from '@/utils/constants';
import type { User, AuthResponse } from '@/types/auth.types';
import { AuthContext } from '@/context/useAuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user session exists on mount
  const checkUserSession = useCallback(async () => {
    try {
      const token = getToken();
      const storedUser = getStoredUser<User>();

      if (token && storedUser) {
        // Verify token is still valid by calling /me endpoint
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        setStoredUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Token invalid, clear everything
      removeToken();
      removeStoredUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // Helper to redirect based on role
  const redirectToRolePage = useCallback((role: Role) => {
    switch (role) {
      case ROLES.ADMIN:
        navigate(ROUTES.ADMIN.DASHBOARD);
        break;
      case ROLES.PARENT:
        navigate(ROUTES.PARENT.DASHBOARD);
        break;
      case ROLES.CHILD:
        navigate(ROUTES.KIDS.LIBRARY);
        break;
      default:
        navigate(ROUTES.HOME);
    }
  }, [navigate]);

  // Login with email/password
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login({ email, password });
      
      // Store token and user
      setToken(response.token);
      setStoredUser(response.user);
      setUser(response.user);

      // Navigate based on role
      redirectToRolePage(response.user.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [redirectToRolePage]);

  // Login child with PIN
  const loginWithPin = useCallback(async (childId: string, pin: string) => {
    try {
      const response: AuthResponse = await authApi.loginWithPin({ childId, pin });
      
      // Store token and user
      setToken(response.token);
      setStoredUser(response.user);
      setUser(response.user);

      // Navigate to kids interface
      navigate(ROUTES.KIDS.LIBRARY);
    } catch (error) {
      console.error('PIN login failed:', error);
      throw error;
    }
  }, [navigate]);

  // Register new user
  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: 'ADMIN' | 'PARENT'
  ) => {
    try {
      const response: AuthResponse = await authApi.register({
        name,
        email,
        password,
        role,
      });
      
      // Store token and user
      setToken(response.token);
      setStoredUser(response.user);
      setUser(response.user);

      // Navigate based on role
      redirectToRolePage(response.user.role);
    } catch (error) {
      console.log('Registration failed:', error);
      throw error;
    }
  }, [redirectToRolePage]);

  // Logout
  const logout = useCallback(() => {
    removeToken();
    removeStoredUser();
    setUser(null);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithPin,
      register,
      logout,
      checkUserSession,
    }),
    [user, isLoading, login, loginWithPin, register, logout, checkUserSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
