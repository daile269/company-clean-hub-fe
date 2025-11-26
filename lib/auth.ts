import { UserRole } from '@/types';
import { authService } from '@/services/authService';

// Placeholder cho authentication logic
export interface AuthUser {
  id: string;
  code: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

// Get current user from authService
export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Map API response to AuthUser interface
  return {
    id: user.id.toString(),
    code: user.username,
    name: user.username,
    role: mapRoleNameToUserRole(user.roleName),
    email: user.email,
  };
}

// Map API role names to UserRole enum
function mapRoleNameToUserRole(roleName: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'ACCOUNTANT': UserRole.ACCOUNTANT,
    'QLT1': UserRole.MANAGER_LEVEL_1,
    'QLT2': UserRole.MANAGER_LEVEL_2,
    'QLV': UserRole.REGIONAL_MANAGER,
    'EMPLOYEE': UserRole.EMPLOYEE,
    'CUSTOMER': UserRole.CUSTOMER,
  };

  return roleMap[roleName] || UserRole.EMPLOYEE;
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
