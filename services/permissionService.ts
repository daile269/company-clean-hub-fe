import { apiService, ApiResponse } from './api';

export interface UserPermissionsResponse {
  userId: number;
  username: string;
  roleCode: string;
  roleName: string;
  permissions: string[];
}

class PermissionService {
  private permissions: string[] = [];

  // Fetch permissions from API
  async fetchUserPermissions(): Promise<ApiResponse<UserPermissionsResponse>> {
    const response = await apiService.get<UserPermissionsResponse>('/users/permissions');
    
    if (response.success && response.data) {
      this.setPermissions(response.data.permissions);
    }
    
    return response;
  }

  // Set permissions in memory and localStorage
  setPermissions(permissions: string[]): void {
    this.permissions = permissions;
    if (typeof window !== 'undefined') {
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }
  }

  // Get permissions from memory or localStorage
  getPermissions(): string[] {
    if (this.permissions.length > 0) {
      return this.permissions;
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('permissions');
      if (stored) {
        this.permissions = JSON.parse(stored);
        return this.permissions;
      }
    }
    
    return [];
  }

  // Check if user has a specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  // Check if user has any of the given permissions
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.some(p => userPermissions.includes(p));
  }

  // Check if user has all of the given permissions
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.every(p => userPermissions.includes(p));
  }

  // Clear permissions (on logout)
  clearPermissions(): void {
    this.permissions = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('permissions');
    }
  }
}

export const permissionService = new PermissionService();
