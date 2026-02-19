import axios, { 
  type AxiosError, 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse,
  type InternalAxiosRequestConfig 
} from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { getToken, clearAuthData } from '@/utils/storage';
import type { ApiError } from '@/types/common.types';

/**
 * Create axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiError>) => {
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (error.response?.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }

      // Handle network errors
      if (!error.response) {
        return Promise.reject({
          success: false,
          error: 'Network Error',
          message: 'Unable to connect to server. Please check your internet connection.',
          statusCode: 0,
        });
      }

      // Return formatted error
      return Promise.reject(error.response.data);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Generic GET request
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.get(url, config);
  return response.data;
};

/**
 * Generic POST request
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const post = async <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(url, data, config);
  return response.data;
};

/**
 * Generic PATCH request
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const patch = async <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
  return response.data;
};

/**
 * Generic PUT request
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const put = async <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.put(url, data, config);
  return response.data;
};

/**
 * Generic DELETE request
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.delete(url, config);
  return response.data;
};

/**
 * Upload file with progress
 * Backend returns plain objects, not wrapped in ApiResponse
 */
export const uploadFile = async <T>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};
