import { apiService, ApiResponse } from './api';
import { permissionService } from './permissionService';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  phone: string;
  roleName: string;
  roleId: number;
  userType: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  roleName: string;
  roleId: number;
  userType: string;
  token: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Save to localStorage and set token in apiService
      this.saveAuthData(response.data);
      // Set token for all future requests
      apiService.setToken(response.data.token);
      
      // Fetch user permissions after successful login
      try {
        await permissionService.fetchUserPermissions();
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    }
    
    return response;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      // Clear token from apiService
      apiService.setToken(null);
      // Clear permissions
      permissionService.clearPermissions();
      
      // Also remove from cookies
      document.cookie = 'token=; path=/; max-age=0';
    }
  }

  saveAuthData(data: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.roleName);
      localStorage.setItem('userId', data.id.toString());
      
      // Save token to cookies for middleware (middleware will decode JWT to get role)
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getCurrentUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
          console.log('AuthService - userStr:', userStr);
          console.log('AuthService - token:', token);
      if (userStr && token) {
        const user = JSON.parse(userStr);
        console.log('AuthService - getCurrentUser:', user);
        return { ...user, token };
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    console.log('user',user)
    return user ? user.roleName : null;
  }
}

export const authService = new AuthService();
