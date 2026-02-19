import { API_ENDPOINTS } from '@/utils/constants';
import { get, post } from '@/api/client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChildPinLoginRequest,
  User,
} from '@/types/auth.types';

/**
 * Backend auth response structure for register/login
 */
interface AuthApiResponse {
  message: string;
  token: string;
  user: User;
}

/**
 * Backend child login response structure
 */
interface ChildLoginApiResponse {
  message: string;
  token: string;
  child: {
    id: string;
    parentId: string;
    name: string;
    age: number;
    avatar?: string;
  };
}

/**
 * Register a new user (ADMIN or PARENT)
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await post<AuthApiResponse, RegisterRequest>(
    API_ENDPOINTS.AUTH.REGISTER,
    data
  );
  // Backend returns: { message, token, user }
  return {
    user: response.user,
    token: response.token,
  };
};

/**
 * Login with email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await post<AuthApiResponse, LoginRequest>(
    API_ENDPOINTS.AUTH.LOGIN,
    data
  );
  // Backend returns: { message, token, user }
  return {
    user: response.user,
    token: response.token,
  };
};

/**
 * Child login with PIN
 */
export const loginWithPin = async (data: ChildPinLoginRequest): Promise<AuthResponse> => {
  const response = await post<ChildLoginApiResponse, ChildPinLoginRequest>(
    API_ENDPOINTS.AUTH.CHILD_PIN,
    data
  );
  // Backend returns: { message, token, child }
  // Convert child to User format for consistency
  return {
    user: {
      id: response.child.id,
      email: '', // Child doesn't have email
      role: 'CHILD',
      name: response.child.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    token: response.token,
  };
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
  // Backend returns: { user: {...} }
  return response.user;
};
