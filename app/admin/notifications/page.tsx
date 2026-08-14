"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  notificationService,
  NotificationResponse,
  NotificationTypeEnum,
  NotificationTypeMeta,
  NotificationTypeLabels,
  NotificationFilterType,
  PaginatedNotificationResponse,
} from "@/services/notificationService";
import { permissionService } from "@/services/permissionService";
import { authService } from "@/services/authService";

const ALL_TYPES: NotificationTypeEnum[] = [
  'WORK_TIME_CONFLICT', 'NEW_EMPLOYEE_CREATED', 'MISSING_VERIFICATION_PHOTO',
  'INSUFFICIENT_STAFF', 'CONTRACT_EXPIRING', 'ASSIGNMENT_OVER_BUDGET',
  'TEMPORARY_OVER_5_DAYS', 'CHECKIN_OUTSIDE_RADIUS',
];

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotificationFilterType>("ALL");
  const [filterRead, setFilterRead] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [markingAll, setMarkingAll] = useState(false);

  // Permission check
  useEffect(() => {
    const check = () => {
      const user = authService.getCurrentUser();
      const byRole = user?.roleName === "QLT1";
      const byPermission = permissionService.hasPermission("NOTIFICATION_VIEW");
      setHasPermission(byRole || byPermission);
    };
    check();
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const count = await notificationService.getUnreadCount();
    setUnreadCount(count);
  }, []);

  // Fetch notifications with filters
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (filterType !== "ALL") params.type = filterType;
      if (filterRead === "UNREAD") params.isRead = false;
      if (filterRead === "READ") params.isRead = true;

      const data: PaginatedNotificationResponse = await notificationService.getAllPaginated(params);
      const content = data.content ?? [];
      setNotifications(content);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);

      // Compute per-type unread counts from all (unfiltered) data
      if (filterType === "ALL" && filterRead === "ALL") {
        const unread = content.filter((n) => !n.isRead);
        const counts: any = {};
        ALL_TYPES.forEach((t) => {
          counts[t] = unread.filter((n) => n.type === t).length;
        });
        setTypeCounts(counts);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterRead, page]);

  useEffect(() => {
    if (!hasPermission) return;
    fetchUnreadCount();
  }, [hasPermission, fetchUnreadCount]);

  useEffect(() => {
    if (!hasPermission) return;
    fetchNotifications();
  }, [hasPermission, fetchNotifications]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filterType, filterRead]);

  // Mark single as read + redirect
  const handleClick = async (notif: NotificationResponse) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setTypeCounts((prev) => ({
        ...prev,
        [notif.type]: Math.max(0, (prev[notif.type] ?? 1) - 1),
      }));
    }
    // R3: TEMPORARY_OVER_5_DAYS → ưu tiên điều hướng đến contract (yêu cầu KH)
    if (notif.type === 'TEMPORARY_OVER_5_DAYS' && notif.refContractId) {
      router.push(`/admin/contracts/${notif.refContractId}`);
      return;
    }
    // Navigate based on ref fields
    if (notif.refEmployeeId) {
      router.push(`/admin/employees/${notif.refEmployeeId}`);
    } else if (notif.refContractId) {
      router.push(`/admin/contracts/${notif.refContractId}`);
    } else if (notif.refAssignmentId) {
      router.push(`/admin/assignments/${notif.refAssignmentId}`);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      const zero: any = {};
      ALL_TYPES.forEach((t) => { zero[t] = 0; });
      setTypeCounts(zero);
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const hhmm = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString("vi-VN");
    return `${hhmm} - ${date}`;
  };

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-lg">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {markingAll ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        {/* Type filter */}
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Loại thông báo</p>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType("ALL")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📋 Tất cả
            </button>
            {ALL_TYPES.map((t) => {
              const meta = NotificationTypeMeta[t];
              const count = typeCounts[t] ?? 0;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterType === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{NotificationTypeLabels[t]}</span>
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1 leading-none ${
                        filterType === t ? "bg-white text-blue-600" : "bg-red-500 text-white"
                      }`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Read filter */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Trạng thái đọc</p>
          <div className="flex gap-1.5">
            {(["ALL", "UNREAD", "READ"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setFilterRead(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterRead === val
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {val === "ALL" ? "Tất cả" : val === "UNREAD" ? "Chưa đọc" : "Đã đọc"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔕</div>
          <p className="text-gray-500 text-lg">Không có thông báo nào</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterType !== "ALL" || filterRead !== "ALL"
              ? "Thử thay đổi bộ lọc để xem thêm"
              : "Bạn sẽ nhận được thông báo khi có sự kiện mới"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {notifications.map((notif, idx) => {
              const meta = NotificationTypeMeta[notif.type];
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-5 py-4 flex gap-4 items-start transition-colors hover:bg-gray-50 ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  } ${idx < notifications.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    {!notif.isRead ? (
                      <span className="block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    ) : (
                      <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="text-xl shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: meta?.bg ?? "#F3F4F6" }}
                  >
                    {meta?.icon ?? "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className={`text-sm leading-tight ${
                          !notif.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          color: meta?.color ?? "#6B7280",
                          backgroundColor: (meta?.bg ?? "#F3F4F6") + "CC",
                        }}
                      >
                        {NotificationTypeLabels[notif.type] ?? notif.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-gray-400">{formatTime(notif.createdAt)}</p>
                      {notif.refEmployeeId && (
                        <span className="text-xs text-blue-500">→ Xem nhân viên</span>
                      )}
                      {notif.refContractId && (
                        <span className="text-xs text-blue-500">→ Xem hợp đồng</span>
                      )}
                      {notif.refAssignmentId && (
                        <span className="text-xs text-blue-500">→ Xem phân công</span>
                      )}
                    </div>
                  </div>

                  {/* Read badge */}
                  <div className="shrink-0 pt-1">
                    {notif.isRead ? (
                      <span className="text-xs text-gray-400">✓ Đã đọc</span>
                    ) : (
                      <span className="text-xs text-blue-500 font-medium">Mới</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-sm text-gray-500">
                Tổng <span className="font-medium text-gray-700">{totalElements}</span> thông báo
                {" · "}Trang <span className="font-medium text-gray-700">{page + 1}</span> / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
