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
  // ── Singleton SSE State ────────────────────────────────────────────────────
  // Giữ duy nhất 1 kết nối SSE toàn cục, dù connectSSE được gọi bao nhiêu lần.
  private _sseController: AbortController | null = null;
  private _sseReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _sseShouldReconnect = false;
  private _sseHandlers: Set<(n: NotificationResponse) => void> = new Set();
  private _sseConnected = false;

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
   * Kết nối SSE realtime — **SINGLETON TOÀN CỤC**.
   * Kết nối sống suốt lifetime của tab — KHÔNG bao giờ tự đóng khi handlers thay đổi.
   * Chỉ gọi disconnectSSE() khi logout để dừng hẳn.
   *
   * @param onNotification  Handler nhận thông báo mới.
   * @returns Cleanup fn: chỉ huỷ đăng ký handler, KHÔNG đóng kết nối SSE.
   */
  connectSSE(onNotification: (n: NotificationResponse) => void): () => void {
    // Đăng ký handler mới vào tập chung
    this._sseHandlers.add(onNotification);

    if (this._sseConnected) {
      // Kết nối đang chạy → reuse, không tạo thêm
      console.log('[SSE] Reusing singleton connection, handlers:', this._sseHandlers.size);
    } else {
      // Chưa có kết nối → khởi động
      const token = apiService.getToken();
      if (token) {
        this._startSseConnection(token);
      } else {
        console.warn('[SSE] No token, skipping SSE connection');
        this._sseHandlers.delete(onNotification);
        return () => {};
      }
    }

    // Cleanup: CHỈ xoá handler, KHÔNG stop connection.
    // Connection sống suốt tab — tránh tích lũy kết nối do component re-render.
    return () => {
      this._sseHandlers.delete(onNotification);
      console.log('[SSE] Handler removed, remaining:', this._sseHandlers.size);
    };
  }

  /**
   * Ngắt kết nối SSE hẳn — chỉ gọi khi logout.
   * Sau khi gọi, mọi connectSSE tiếp theo sẽ tạo kết nối mới.
   */
  disconnectSSE(): void {
    this._sseHandlers.clear();
    this._stopSseConnection();
  }

  private _startSseConnection(token: string): void {
    if (this._sseConnected) return;
    this._sseShouldReconnect = true;
    this._sseConnected = true;
    console.log('[SSE] Starting singleton SSE connection...');
    this._sseConnect(token);
  }

  private _stopSseConnection(): void {
    console.log('[SSE] Stopping singleton SSE connection');
    this._sseShouldReconnect = false;
    this._sseConnected = false;
    if (this._sseReconnectTimer) {
      clearTimeout(this._sseReconnectTimer);
      this._sseReconnectTimer = null;
    }
    if (this._sseController) {
      try { this._sseController.abort(); } catch { /* ignore */ }
      this._sseController = null;
    }
  }

  private _sseConnect(token: string): void {
    if (!this._sseShouldReconnect) return;

    // Abort kết nối cũ nếu còn sót
    if (this._sseController) {
      try { this._sseController.abort(); } catch { /* ignore */ }
    }
    this._sseController = new AbortController();
    const signal = this._sseController.signal;

    const url = `${API_BASE_URL}/notifications/subscribe`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      signal,
    }).then(async (response) => {
      if (!response.ok || !response.body) {
        console.warn('[SSE] Connection failed (status', response.status, '), retry in 30s');
        this._sseScheduleReconnect(token);
        return;
      }

      console.log('[SSE] Singleton connection established');
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
              // Dispatch tới tất cả handlers đang đăng ký
              this._sseHandlers.forEach(h => {
                try { h(data as NotificationResponse); } catch { /* ignore */ }
              });
            } catch {
              // skip unparseable events
            }
          }
        }
      }
      // Stream ended — reconnect
      console.log('[SSE] Stream ended, scheduling reconnect...');
      this._sseScheduleReconnect(token);
    }).catch((err) => {
      if (err?.name !== 'AbortError') {
        console.error('[SSE] Connection error:', err);
        this._sseScheduleReconnect(token);
      }
    });
  }

  private _sseScheduleReconnect(token: string): void {
    if (!this._sseShouldReconnect) return;
    if (this._sseReconnectTimer) clearTimeout(this._sseReconnectTimer);
    this._sseReconnectTimer = setTimeout(() => {
      console.log('[SSE] Reconnecting singleton...');
      this._sseConnect(token);
    }, 30_000); // reconnect sau 30s
  }
}

export const notificationService = new NotificationService();
