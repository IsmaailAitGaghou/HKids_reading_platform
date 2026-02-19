import { useContext, createContext } from 'react';
import type { User } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (childId: string, pin: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'ADMIN' | 'PARENT') => Promise<void>;
  logout: () => void;
  checkUserSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
