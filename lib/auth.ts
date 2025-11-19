import { UserRole } from '@/types';

// Placeholder cho authentication logic
export interface AuthUser {
  id: string;
  code: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

// Mock function - sẽ được thay thế bằng logic thật
export async function getCurrentUser(): Promise<AuthUser | null> {
  // TODO: Implement real authentication
  return null;
}

// Check permissions
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Admin roles
export const ADMIN_ROLES: UserRole[] = [
  UserRole.MANAGER_LEVEL_1,
  UserRole.MANAGER_LEVEL_2,
  UserRole.REGIONAL_MANAGER,
  UserRole.ACCOUNTANT,
];

// Check if user is admin
export function isAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}
