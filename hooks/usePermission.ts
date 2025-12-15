"use client";
import { useState, useEffect } from 'react';
import { permissionService } from '@/services/permissionService';

/**
 * Hook to check user permissions
 * @param permission - Single permission string or array of permissions
 * @param requireAll - If true, user must have ALL permissions. If false, user must have ANY permission (default: false)
 * @returns boolean indicating if user has the required permission(s)
 */
export function usePermission(
  permission: string | string[],
  requireAll: boolean = false
): boolean {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      if (Array.isArray(permission)) {
        if (requireAll) {
          setHasPermission(permissionService.hasAllPermissions(permission));
        } else {
          setHasPermission(permissionService.hasAnyPermission(permission));
        }
      } else {
        setHasPermission(permissionService.hasPermission(permission));
      }
    };

    checkPermission();

    // Re-check when permissions might change (e.g., after login)
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, [permission, requireAll]);

  return hasPermission;
}

/**
 * Hook to get all user permissions
 * @returns array of permission strings
 */
export function usePermissions(): string[] {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const updatePermissions = () => {
      setPermissions(permissionService.getPermissions());
    };

    updatePermissions();

    const interval = setInterval(updatePermissions, 1000);
    return () => clearInterval(interval);
  }, []);

  return permissions;
}
