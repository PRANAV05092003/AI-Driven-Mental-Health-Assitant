import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Extract error message from response
      const errorMessage = (data as any)?.message || 'An error occurred';
      
      // Don't show toast for 401 errors as we're redirecting to login
      if (status !== 401) {
        toast.error(errorMessage);
      }
      
      return Promise.reject({
        status,
        message: errorMessage,
        data: (data as any)?.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your connection.');
      return Promise.reject({
        status: 500,
        message: 'No response from server',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An error occurred. Please try again.');
      return Promise.reject({
        status: 500,
        message: 'Request setup error',
      });
    }
  }
);

// Helper functions for different HTTP methods
const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get<T, T>(url, config);
  },
  
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.post<T, T>(url, data, config);
  },
  
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.put<T, T>(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete<T, T>(url, config);
  },
  
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.patch<T, T>(url, data, config);
  },
};

export default http;
