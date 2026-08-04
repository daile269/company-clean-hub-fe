import { apiService } from './api';

// All 8 notification types from BE NotificationType enum
export type NotificationTypeEnum =
  | 'WORK_TIME_CONFLICT'
  | 'NEW_EMPLOYEE_CREATED'
  | 'MISSING_VERIFICATION_PHOTO'
  | 'INSUFFICIENT_STAFF'
  | 'CONTRACT_EXPIRING'
  | 'ASSIGNMENT_OVER_BUDGET'
  | 'TEMPORARY_OVER_5_DAYS'
  | 'CHECKIN_OUTSIDE_RADIUS';

// Icon + color mapping for each notification type
export const NotificationTypeMeta: Record<NotificationTypeEnum, { icon: string; color: string; bg: string; border: string }> = {
  WORK_TIME_CONFLICT:          { icon: '⚠️', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  NEW_EMPLOYEE_CREATED:        { icon: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  MISSING_VERIFICATION_PHOTO:  { icon: '📸', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }, // 🟡
  INSUFFICIENT_STAFF:          { icon: '⚠️', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }, // 🔴
  CONTRACT_EXPIRING:           { icon: '📋', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' }, // 🟠
  ASSIGNMENT_OVER_BUDGET:      { icon: '💰', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }, // 🔴
  TEMPORARY_OVER_5_DAYS:       { icon: '⏰', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }, // 🟡
  CHECKIN_OUTSIDE_RADIUS:      { icon: '📍', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }, // 🔴
};

// Vietnamese labels for notification types
export const NotificationTypeLabels: Record<NotificationTypeEnum, string> = {
  WORK_TIME_CONFLICT:          'Trùng giờ làm việc',
  NEW_EMPLOYEE_CREATED:        'Nhân viên mới',
  MISSING_VERIFICATION_PHOTO:  'Quên chụp hình xác minh',
  INSUFFICIENT_STAFF:          'Thiếu nhân viên',
  CONTRACT_EXPIRING:           'Hợp đồng sắp hết hạn',
  ASSIGNMENT_OVER_BUDGET:      'Vượt ngân sách',
  TEMPORARY_OVER_5_DAYS:       'Điều động quá 5 ngày',
  CHECKIN_OUTSIDE_RADIUS:      'Check-in ngoài bán kính',
};

export interface NotificationResponse {
  id: number;
  type: NotificationTypeEnum;
  typeDescription: string;
  title: string;
  message: string;
  refEmployeeId: number | null;
  refAssignmentId: number | null;
  refContractId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://opticlean.com.vn/api';

export type NotificationFilterType = 'ALL' | NotificationTypeEnum;

export interface GetNotificationParams {
  type?: NotificationFilterType;
  isRead?: boolean;
  page?: number;      // 0-indexed
  pageSize?: number;
}

export interface PaginatedNotificationResponse {
  content: NotificationResponse[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

class NotificationService {
  /**
   * Lấy thông báo — hỗ trợ server-side filter theo type và isRead.
   * type = 'ALL' hoặc không truyền → lấy tất cả loại.
   * isRead không truyền → lấy tất cả trạng thái.
   */
  async getAll(params?: GetNotificationParams): Promise<NotificationResponse[]> {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);
    if (params?.isRead !== undefined) query.set('isRead', String(params.isRead));
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

    const endpoint = `/notifications${query.toString() ? '?' + query.toString() : ''}`;

    try {
      const res = await apiService.get<any>(endpoint);
      // BE trả về ApiResponse<PageResponse<T>> hoặc ApiResponse<T[]>
      const data = res.data;
      if (!data) return [];
      
      if (Array.isArray(data.content)) return data.content;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error('Error in notificationService.getAll:', e);
      return [];
    }
  }

  /**
   * Lấy thông báo có phân trang — trả về đầy đủ metadata pagination.
   * page bắt đầu từ 0 (theo quy ước API).
   */
  async getAllPaginated(params?: GetNotificationParams): Promise<PaginatedNotificationResponse> {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);
    if (params?.isRead !== undefined) query.set('isRead', String(params.isRead));
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

    const endpoint = `/notifications${query.toString() ? '?' + query.toString() : ''}`;
    const empty: PaginatedNotificationResponse = {
      content: [], page: params?.page ?? 0, pageSize: params?.pageSize ?? 10,
      totalElements: 0, totalPages: 0, first: true, last: true,
    };

    try {
      const res = await apiService.get<any>(endpoint);
      const data = res.data;
      if (!data) return empty;

      // Response là paginated object { content, totalPages, ... }
      if (data.content !== undefined) return data as PaginatedNotificationResponse;
      
      // Response là plain array (backward compat — wrap lại)
      if (Array.isArray(data)) {
        return {
          content: data,
          page: 0, pageSize: data.length,
          totalElements: data.length,
          totalPages: data.length > 0 ? 1 : 0,
          first: true, last: true,
        };
      }
      return empty;
    } catch (e) {
      console.error('Error in notificationService.getAllPaginated:', e);
      return empty;
    }
  }

  /** Lấy số thông báo chưa đọc */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiService.get<UnreadCountResponse>('/notifications/unread/count');
      // API trả về ApiResponse<{ count: N }>
      if (res.success && res.data) {
        return res.data.count;
      }
      return 0;
    } catch (e) {
      console.error('Error in notificationService.getUnreadCount:', e);
      return 0;
    }
  }

  /** Đánh dấu 1 thông báo đã đọc */
  async markAsRead(id: number): Promise<void> {
    try {
      await apiService.put(`/notifications/${id}/read`);
    } catch (e) {
      console.error('Error in notificationService.markAsRead:', e);
    }
  }

  /** Đánh dấu tất cả đã đọc */
  async markAllAsRead(): Promise<void> {
    try {
      await apiService.put('/notifications/read-all');
    } catch (e) {
      console.error('Error in notificationService.markAllAsRead:', e);
    }
  }

  /**
   * Kết nối SSE realtime dùng fetch streaming (EventSource không hỗ trợ JWT header).
   * Trả về cleanup function để đóng kết nối khi unmount.
   */
  connectSSE(onNotification: (n: NotificationResponse) => void): () => void {
    const token = apiService.getToken();
    if (!token) {
      console.warn('[SSE] No token available, skipping SSE connection');
      return () => {};
    }

    const url = `${API_BASE_URL}/notifications/subscribe`;
    const controller = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let shouldReconnect = true;

    const connect = () => {
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: controller.signal,
      }).then(async (response) => {
        if (!response.ok || !response.body) {
          console.warn('[SSE] Connection failed, will retry in 30s');
          scheduleReconnect();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;
              try {
                const data = JSON.parse(jsonStr);
                onNotification(data as NotificationResponse);
              } catch {
                // skip unparseable events
              }
            }
          }
        }
        // Stream ended — reconnect
        scheduleReconnect();
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[SSE] Connection error:', err);
          scheduleReconnect();
        }
      });
    };

    const scheduleReconnect = () => {
      if (!shouldReconnect) return;
      reconnectTimer = setTimeout(() => {
        console.log('[SSE] Reconnecting...');
        connect();
      }, 30000); // reconnect after 30s
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      controller.abort();
    };
  }
}

export const notificationService = new NotificationService();
