/**
 * Route to Roles mapping
 * Define which routes are accessible by which roles
 * Supports exact routes and dynamic routes (e.g., /admin/payroll/[id])
 */

export const ROUTE_ROLES: Record<string, string[]> = {
  // Payroll routes
  '/admin/payroll': ['QLT1', 'QLT2', 'ACCOUNTANT'],
  '/admin/payroll/[id]': ['QLT1', 'QLT2', 'ACCOUNTANT'],

  // Employee routes
  '/admin/employees': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],
  '/admin/employees/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],

  // Customer routes
  '/admin/customers': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],
  '/admin/customers/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],

  // Assignment routes (CUSTOMER có ASSIGNMENT_VIEW)
  '/admin/assignments': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],
  '/admin/assignments/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],

  // Attendance routes
  '/admin/attendances': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],
  '/admin/attendances/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],

  // Company staff routes (employee management)
  '/admin/company-staff': ['QLT1', 'QLT2', 'QLV'],
  '/admin/company-staff/[id]': ['QLT1', 'QLT2', 'QLV'],

  // Contract routes (CUSTOMER có CONTRACT_VIEW)
  '/admin/contracts': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],
  '/admin/contracts/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],

  // Services routes (CUSTOMER có SERVICE_VIEW)
  '/admin/services': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],
  '/admin/services/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],

  // User management routes
  '/admin/users': ['QLT1', 'QLT2'],
  '/admin/users/[id]': ['QLT1', 'QLT2'],
};

/**
 * Check if current pathname matches a route pattern and return required roles
 * Handles dynamic routes like /admin/payroll/[id]
 */
export const  getRequiredRoles = (pathname: string): string[] | null => {
  // Exact match first
  if (ROUTE_ROLES[pathname]) {
    return ROUTE_ROLES[pathname];
  }

  // Check pattern match for dynamic routes
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    const pattern = route
      .replace(/\[id\]/g, '[^/]+')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(pathname)) {
      return roles;
    }
  }

  return null;
};
