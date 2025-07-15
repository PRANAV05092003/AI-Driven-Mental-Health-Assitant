import { useState, useCallback, useRef } from 'react';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import http from '../utils/api';
import useNotification from './useNotification';

type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface ApiRequestOptions<T> {
  /**
   * Whether to show a loading notification
   * @default false
   */
  showLoading?: boolean | string;
  
  /**
   * Whether to show a success notification
   * @default false
   */
  showSuccess?: boolean | string | ((data: T) => string);
  
  /**
   * Whether to show error notifications
   * @default true
   */
  showError?: boolean | string | ((error: any) => string);
  
  /**
   * Callback when the request is successful
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback when the request fails
   */
  onError?: (error: any) => void;
  
  /**
   * Callback when the request completes (success or error)
   */
  onComplete?: () => void;
  
  /**
   * Additional axios request config
   */
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>;
}

interface ApiRequestState<T> {
  /**
   * The response data from the API
   */
  data: T | null;
  
  /**
   * Whether the request is in progress
   */
  isLoading: boolean;
  
  /**
   * The error from the API, if any
   */
  error: any;
  
  /**
   * Whether the request was successful
   */
  isSuccess: boolean;
  
  /**
   * The HTTP status code from the response
   */
  status?: number;
  
  /**
   * The response headers
   */
  headers?: any;
}

/**
 * A custom hook for making API requests with loading, error, and success states
 * @param method The HTTP method to use (get, post, put, delete, patch)
 * @param url The URL to make the request to
 * @param options Additional options for the request
 * @returns An array containing the request function and the request state
 */
function useApiRequest<T = any>(
  method: RequestMethod,
  url: string,
  options: ApiRequestOptions<T> = {}
): [(data?: any) => Promise<void>, ApiRequestState<T>] {
  const { 
    showLoading = false,
    showSuccess = false,
    showError = true,
    onSuccess,
    onError,
    onComplete,
    config = {},
  } = options;
  
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    status: undefined,
    headers: undefined,
  });
  
  const notification = useNotification();
  const loadingToastId = useRef<string | null>(null);
  
  const makeRequest = useCallback(async (requestData?: any) => {
    // Reset state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
    }));
    
    // Show loading notification if enabled
    if (showLoading) {
      const loadingMessage = typeof showLoading === 'string' ? showLoading : 'Loading...';
      loadingToastId.current = notification.loading(loadingMessage, { duration: Infinity });
    }
    
    try {
      // Make the API request
      const response = await http[method]<T>(
        url,
        method.toLowerCase() === 'get' ? { ...config, params: requestData } : requestData,
        config
      ) as AxiosResponse<T>;
      
      // Update state with successful response
      setState({
        data: response.data,
        isLoading: false,
        error: null,
        isSuccess: true,
        status: response.status,
        headers: response.headers,
      });
      
      // Show success notification if enabled
      if (showSuccess) {
        const successMessage = typeof showSuccess === 'function' 
          ? showSuccess(response.data) 
          : typeof showSuccess === 'string' 
            ? showSuccess 
            : 'Operation completed successfully';
            
        notification.success(successMessage);
      }
      
      // Call success callback
      onSuccess?.(response.data);
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = 
        (axiosError.response?.data as any)?.message || 
        axiosError.message || 
        'An error occurred';
      
      // Update state with error
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: axiosError.response?.data || error,
        isSuccess: false,
        status: axiosError.response?.status,
        headers: axiosError.response?.headers,
      }));
      
      // Show error notification if enabled
      if (showError) {
        const errorMessageToShow = typeof showError === 'function'
          ? showError(error)
          : typeof showError === 'string'
            ? showError
            : errorMessage;
            
        notification.error(errorMessageToShow);
      }
      
      // Call error callback
      onError?.(error);
      
      // Re-throw the error for the caller to handle if needed
      throw error;
    } finally {
      // Dismiss loading notification if it was shown
      if (loadingToastId.current) {
        notification.dismiss(loadingToastId.current);
        loadingToastId.current = null;
      }
      
      // Call complete callback
      onComplete?.();
    }
  }, [
    method, 
    url, 
    showLoading, 
    showSuccess, 
    showError, 
    onSuccess, 
    onError, 
    onComplete, 
    config,
    notification
  ]);
  
  return [makeRequest, state];
}

// Convenience hooks for common HTTP methods
function createUseApiMethod(method: RequestMethod) {
  return <T = any>(
    url: string,
    options: ApiRequestOptions<T> = {}
  ) => useApiRequest<T>(method, url, options);
}

// Export the main hook and convenience methods
export default useApiRequest;

export const useGet = createUseApiMethod('get');
export const usePost = createUseApiMethod('post');
export const usePut = createUseApiMethod('put');
export const useDelete = createUseApiMethod('delete');
export const usePatch = createUseApiMethod('patch');

// Helper hook for API requests with manual trigger
export function useApi<T = any>(
  method: RequestMethod,
  url: string,
  options: ApiRequestOptions<T> = {}
) {
  const [makeRequest, state] = useApiRequest<T>(method, url, options);
  
  // Return the request function and state
  return {
    // Request function
    request: makeRequest,
    
    // State
    ...state,
    
    // Convenience properties
    loading: state.isLoading,
    error: state.error,
    success: state.isSuccess,
    
    // Alias for request
    execute: makeRequest,
    
    // Reset the state
    reset: () => {
      setState({
        data: null,
        isLoading: false,
        error: null,
        isSuccess: false,
        status: undefined,
        headers: undefined,
      });
    },
  };
}

// Convenience hooks for common HTTP methods with the new API
export function useGetApi<T = any>(url: string, options: ApiRequestOptions<T> = {}) {
  return useApi<T>('get', url, options);
}

export function usePostApi<T = any>(url: string, options: ApiRequestOptions<T> = {}) {
  return useApi<T>('post', url, options);
}

export function usePutApi<T = any>(url: string, options: ApiRequestOptions<T> = {}) {
  return useApi<T>('put', url, options);
}

export function useDeleteApi<T = any>(url: string, options: ApiRequestOptions<T> = {}) {
  return useApi<T>('delete', url, options);
}

export function usePatchApi<T = any>(url: string, options: ApiRequestOptions<T> = {}) {
  return useApi<T>('patch', url, options);
}
