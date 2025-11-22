import { useState } from 'react';
import { apiService } from '@/services/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const request = async (
    fn: () => Promise<any>,
    options?: UseApiOptions
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fn();
      
      if (response.success) {
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMsg = response.message || 'Có lỗi xảy ra';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Có lỗi xảy ra';
      setError(errorMsg);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = async (endpoint: string, options?: UseApiOptions) => {
    return request(() => apiService.get<T>(endpoint), options);
  };

  const post = async (endpoint: string, data?: any, options?: UseApiOptions) => {
    return request(() => apiService.post<T>(endpoint, data), options);
  };

  const put = async (endpoint: string, data?: any, options?: UseApiOptions) => {
    return request(() => apiService.put<T>(endpoint, data), options);
  };

  const del = async (endpoint: string, options?: UseApiOptions) => {
    return request(() => apiService.delete<T>(endpoint), options);
  };

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    request,
  };
}
