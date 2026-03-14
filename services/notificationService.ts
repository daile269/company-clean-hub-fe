import { apiService } from './api';

export interface NotificationResponse {
  id: number;
  type: 'WORK_TIME_CONFLICT' | 'NEW_EMPLOYEE_CREATED';
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

export interface GetNotificationParams {
  type?: 'ALL' | 'WORK_TIME_CONFLICT' | 'NEW_EMPLOYEE_CREATED';
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

    const endpoint = query.toString()
      ? `/notifications?${query.toString()}`
      : '/notifications';

    // Dùng fetch trực tiếp vì BE trả về plain array [],
    // còn apiService.request() làm { ...array } biến array thành object mất isArray
    const token = apiService.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // BE trả về plain array, paginated {content:[]}, hoặc wrapped {data:[]}
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.content)) return json.content; // paginated response mới
    if (Array.isArray(json?.data)) return json.data;
    return [];
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

    const endpoint = query.toString() ? `/notifications?${query.toString()}` : '/notifications';
    const token = apiService.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const empty: PaginatedNotificationResponse = {
      content: [], page: params?.page ?? 0, pageSize: params?.pageSize ?? 10,
      totalElements: 0, totalPages: 0, first: true, last: true,
    };

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return empty;
      const json = await res.json();
      // Response là paginated object { content, totalPages, ... }
      if (json?.content !== undefined) return json as PaginatedNotificationResponse;
      // Response là plain array (backward compat — wrap lại)
      if (Array.isArray(json)) {
        return {
          content: json,
          page: 0, pageSize: json.length,
          totalElements: json.length,
          totalPages: json.length > 0 ? 1 : 0,
          first: true, last: true,
        };
      }
      return empty;
    } catch {
      return empty;
    }
  }

  /** Lấy số thông báo chưa đọc */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiService.get<UnreadCountResponse>('/notifications/unread/count');
      // API trả về trực tiếp { count: N } hoặc wrapped trong data
      const body = res as any;
      if (typeof body?.data?.count === 'number') return body.data.count;
      if (typeof body?.count === 'number') return body.count;
      return 0;
    } catch {
      return 0;
    }
  }

  /** Đánh dấu 1 thông báo đã đọc */
  async markAsRead(id: number): Promise<void> {
    await apiService.put(`/notifications/${id}/read`);
  }

  /** Đánh dấu tất cả đã đọc */
  async markAllAsRead(): Promise<void> {
    await apiService.put('/notifications/read-all');
  }

  /**
   * Kết nối SSE realtime — chỉ gọi 1 lần khi login.
   * Trả về hàm cleanup để đóng kết nối.
   */
  connectSSE(onNotification: (n: NotificationResponse) => void): () => void {
    const token = apiService.getToken();
    if (!token) return () => {};

    // Dùng native EventSource + token qua URL param vì EventSource không hỗ trợ custom header
    // Nếu BE chấp nhận query param token:
    const url = `${API_BASE_URL}/notifications/subscribe?token=${encodeURIComponent(token)}`;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      es = new EventSource(url);

      es.addEventListener('connected', () => {
        console.log('[SSE] Notification stream connected');
      });

      es.addEventListener('notification', (event: MessageEvent) => {
        try {
          const notif: NotificationResponse = JSON.parse(event.data);
          onNotification(notif);
        } catch (e) {
          console.warn('[SSE] Failed to parse notification event:', e);
        }
      });

      es.onerror = () => {
        console.warn('[SSE] Connection error, retrying in 30s...');
        es?.close();
        if (!closed) {
          // Tăng delay lên 30s để tránh reconnect liên tục khi server bị quá tải
          retryTimeout = setTimeout(connect, 30000);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }
}

export const notificationService = new NotificationService();
