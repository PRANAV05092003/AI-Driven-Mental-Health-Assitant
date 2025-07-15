import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { User } from '../types';

export interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

interface TokenResponse {
  token: string;
  refreshToken?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Store the refresh token request to prevent multiple calls
let refreshTokenRequest: Promise<AxiosResponse<TokenResponse>> | null = null;

// Request interceptor for API calls
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Safely ensure headers are set
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is not a 401 or if it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark the request as a retry
    originalRequest._retry = true;

    try {
      // Try to refresh the token
      const { token } = await authService.refreshToken();
      
      // Update the token in localStorage
      localStorage.setItem('token', token);
      
      // Update the Authorization header
      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh token fails, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const apiError: ApiError = new Error(
      error.response?.data?.message || error.response?.data?.error || 'An error occurred'
    );
    apiError.response = error.response ? {
      status: error.response.status,
      data: error.response.data,
    } : undefined;
    throw apiError;
  }
  throw error;
};

export const authService = {
  // Set auth token for axios requests
  setAuthToken(token: string): void {
    const headers = api.defaults.headers.common as Record<string, string>;
    headers['Authorization'] = `Bearer ${token}`;
  },

  // Clear auth token
  clearAuthToken(): void {
    const headers = api.defaults.headers.common as Record<string, unknown>;
    delete headers['Authorization'];
  },

  // Setup response interceptor
  setupResponseInterceptor(
    onTokenRefresh: () => Promise<string>,
    onUnauthenticated: (error: AxiosError) => any
  ): number {
    return api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // If error is not a 401 or if it's a retry request, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // Mark the request as a retry
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const newToken = await onTokenRefresh();
          
          // Update the token in the header
          if (originalRequest.headers) {
            const headers = originalRequest.headers as Record<string, string>;
            headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, handle unauthenticated
          onUnauthenticated(error);
          return Promise.reject(refreshError);
        }
      }
    );
  },

  // Remove response interceptor
  ejectResponseInterceptor(interceptorId: number): void {
    api.interceptors.response.eject(interceptorId);
  },

  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Register new user
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get current user
  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Refresh access token
  async refreshToken(): Promise<TokenResponse> {
    try {
      if (refreshTokenRequest) {
        const existingResponse = await refreshTokenRequest;
        return existingResponse.data;
      }
  
      refreshTokenRequest = api.post<TokenResponse>('/auth/refresh-token');
      const tokenData = await refreshTokenRequest;
      return tokenData.data;
      

    } catch (error) {
      throw handleApiError(error);
    } finally {
      refreshTokenRequest = null;
    }
  },
  

  // Logout user
  // async logout(): Promise<void> {
  //   try {
  //     await api.post('/auth/logout');
  //   } finally {
  //     localStorage.removeItem('token');
  //     delete api.defaults.headers.common['Authorization'];
  //   }
  // },

  // Update user details
  async updateDetails(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>('/auth/updatedetails', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/updatepassword', { currentPassword, newPassword });
    } catch (error) {
      handleApiError(error);
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgotpassword', { email });
    } catch (error) {
      handleApiError(error);
    }
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default authService;
