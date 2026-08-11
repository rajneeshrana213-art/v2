import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '@/lib/api/client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string; // Custom error message override
  headers?: Record<string, string>; // Custom headers
  autoToast?: boolean; // Enable/disable automatic error toasts (default: true)
}

interface ApiResponse<T> {
  data: T | null;
  error: any | null;
  loading: boolean;
  request: (method: HttpMethod, url: string, body?: any, options?: UseApiOptions<T>) => Promise<T | null>;
  get: (url: string, options?: UseApiOptions<T>) => Promise<T | null>;
  post: (url: string, body?: any, options?: UseApiOptions<T>) => Promise<T | null>;
  put: (url: string, body?: any, options?: UseApiOptions<T>) => Promise<T | null>;
  patch: (url: string, body?: any, options?: UseApiOptions<T>) => Promise<T | null>;
  del: (url: string, body?: any, options?: UseApiOptions<T>) => Promise<T | null>;
  abort: () => void;
  reset: () => void;
}

export function useApi<T = any>(): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Use a ref to store the AbortController so it persists across renders
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount to prevent memory leaks and cancel pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const request = useCallback(async (
    method: HttpMethod,
    url: string,
    body?: any,
    options?: UseApiOptions<T>
  ): Promise<T | null> => {
    // Abort any previous pending request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const headers: Record<string, string> = {
        ...options?.headers // Merge custom headers
      };

      // Use the centralized client (Axios) which has interceptors
      // We pass method, url, and data (body)
      // Axios handles Content-Type automatically for JSON
      
      const config: any = {
        method,
        url,
        headers,
        signal: abortControllerRef.current.signal,
      };

      if (body) {
        config.data = body;
      }

      // Axios throws on non-2xx by default
      const response = await client(config);
      const responseData = response.data;

      setData(responseData);

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      options?.onSuccess?.(responseData);
      return responseData;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
        return null; // Don't treat abort as an error in UI
      }

      setError(err);
      // Extract error message from API response or use default
      const apiErrorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorMessage = options?.errorMessage || apiErrorMessage || 'An unexpected error occurred';
      
      // Default to true for autoToast unless explicitly set to false
      if (options?.autoToast !== false) {
          toast.error(errorMessage);
      }

      // Pass error with extracted message to onError callback
      options?.onError?.({ ...err, apiMessage: apiErrorMessage });
      return null;
    } finally {
       // Only unset loading if we weren't aborted (or if we finished)
       if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
           setLoading(false);
           abortControllerRef.current = null;
       } else {
           // If request finished naturally
           setLoading(false);
       }
    }
  }, []);

  return {
    data,
    error,
    loading,
    request,
    get: useCallback((url, options) => request('GET', url, undefined, options), [request]),
    post: useCallback((url, body, options) => request('POST', url, body, options), [request]),
    put: useCallback((url, body, options) => request('PUT', url, body, options), [request]),
    patch: useCallback((url, body, options) => request('PATCH', url, body, options), [request]),
    del: useCallback((url, body, options) => request('DELETE', url, body, options), [request]),
    abort,
    reset,
  };
}

