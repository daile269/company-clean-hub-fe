// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Salary calculation
export const DAYS_IN_MONTH = 26; // Số ngày công chuẩn trong tháng

// Validation
export const PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ID_CARD_REGEX = /^[0-9]{9,12}$/;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Notification types
export const NOTIFICATION_TYPES = {
  CONTRACT_EXPIRY: 'contract_expiry',
  SALARY_DUE: 'salary_due',
  SUPPLY_ALERT: 'supply_alert',
  ASSIGNMENT: 'assignment',
  RATING: 'rating',
} as const;
