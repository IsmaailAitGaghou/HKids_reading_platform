import type { Role } from '@/utils/constants';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Child extends User {
  pin: string;
  parentId: string;
  avatar?: string;
  dateOfBirth?: string;
}

// Auth Request/Response Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'PARENT';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChildPinLoginRequest {
  childId: string;
  pin: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (childId: string, pin: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}
