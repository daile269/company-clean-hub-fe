// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://180.93.2.255:8012/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  meta?: {
    payrollId?: string | null;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Initialize token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  // Set token manually (useful after login)
  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  }

private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {

  const token = this.getToken();
  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${this.baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  const payrollId = response.headers.get('x-payroll-id');

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      success: false,
      message: 'Có lỗi xảy ra',
      code: response.status,
    }));

    throw {
      ...error,
      meta: payrollId ? { payrollId } : undefined,
    };
  }

  const data = await response.json();

  return {
    ...data,
    meta: payrollId ? { payrollId } : undefined,
  };
}


  async getFile(endpoint: string): Promise<Blob> {
    const token = this.getToken();
    console.log("3 Exporting Excel file...");
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers,
    });
    console.log("4 Exporting Excel file...", response);
    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.clear();
        this.setToken(null);
        window.location.href = "/login";
      }

      throw new Error("Lỗi khi tải file");
    }

    return response.blob();
  }

  // POST and return a file/blob (used for endpoints that export via POST)
  async postFile(endpoint: string, body?: unknown): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : (body as any),
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.clear();
        this.setToken(null);
        window.location.href = "/login";
      }

      throw new Error("Lỗi khi tải file");
    }

    return response.blob();
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.clear();
        this.setToken(null);
        window.location.href = '/login';
      }
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Có lỗi xảy ra',
        code: response.status,
      }));
      throw error;
    }

    return response.json();
  }
}

export const apiService = new ApiService();
