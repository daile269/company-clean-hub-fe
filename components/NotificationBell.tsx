"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  notificationService,
  NotificationResponse,
  GetNotificationParams,
} from "@/services/notificationService";
import { permissionService } from "@/services/permissionService";
import { authService } from "@/services/authService";

type FilterType = "ALL" | "WORK_TIME_CONFLICT" | "NEW_EMPLOYEE_CREATED";
type FilterRead = "ALL" | "UNREAD" | "READ";

interface TypeCount {
  ALL: number;
  WORK_TIME_CONFLICT: number;
  NEW_EMPLOYEE_CREATED: number;
}

export default function NotificationBell() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [typeCounts, setTypeCounts] = useState<TypeCount>({
    ALL: 0,
    WORK_TIME_CONFLICT: 0,
    NEW_EMPLOYEE_CREATED: 0,
  });
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterRead, setFilterRead] = useState<FilterRead>("ALL");

  // ── Permission / role check ───────────────────────────────────────────────
  // Hiển thị khi role là QLT1/QLT2, hoặc có quyền NOTIFICATION_VIEW
  useEffect(() => {
    const check = () => {
      const user = authService.getCurrentUser();
      const byRole = user?.roleName === "QLT1";
      const byPermission = permissionService.hasPermission("NOTIFICATION_VIEW");
      setHasPermission(byRole || byPermission);
    };
    check();
    const t = setInterval(check, 2000);
    return () => clearInterval(t);
  }, []);

  // ── Load badge count ────────────────────────────────────────────────────
  // Chỉ gọi 1 API duy nhất để tránh làm cạn DB connection pool
  const fetchBadge = useCallback(async () => {
    const count = await notificationService.getUnreadCount();
    setBadgeCount(count);
  }, []);

  // ── Tính typeCounts từ data đã fetch (không cần gọi thêm API) ────────────
  const recomputeTypeCounts = useCallback((data: NotificationResponse[]) => {
    const unread = data.filter((n) => !n.isRead);
    setTypeCounts({
      ALL: unread.length,
      WORK_TIME_CONFLICT: unread.filter((n) => n.type === "WORK_TIME_CONFLICT").length,
      NEW_EMPLOYEE_CREATED: unread.filter((n) => n.type === "NEW_EMPLOYEE_CREATED").length,
    });
  }, []);

  // ── SSE realtime connection ───────────────────────────────────────────────
  const handleNewNotification = useCallback((notif: NotificationResponse) => {
    setNotifications((prev) => [notif, ...prev]);
    setBadgeCount((prev) => prev + 1);
    // Cập nhật per-type count
    setTypeCounts((prev) => ({
      ...prev,
      ALL: prev.ALL + 1,
      [notif.type]: (prev[notif.type as keyof TypeCount] ?? 0) + 1,
    }));
    toast(
      (t) => (
        <div className="flex gap-3 items-start max-w-xs">
          <span className="text-xl">
            {notif.type === "WORK_TIME_CONFLICT" ? "⚠️" : "👤"}
          </span>
          <div>
            <p className="font-semibold text-sm text-gray-900 leading-tight">
              {notif.title}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {notif.message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 ml-1 shrink-0"
          >
            ✕
          </button>
        </div>
      ),
      {
        duration: 6000,
        style: {
          background:
            notif.type === "WORK_TIME_CONFLICT" ? "#FFF7ED" : "#F0FDF4",
          border: `1px solid ${notif.type === "WORK_TIME_CONFLICT" ? "#FDBA74" : "#86EFAC"}`,
          borderRadius: "10px",
          padding: "12px",
        },
      },
    );
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchBadge();
    const cleanup = notificationService.connectSSE(handleNewNotification);
    return cleanup;
  }, [hasPermission, fetchBadge, handleNewNotification]);

  // ── Close panel on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // ── Fetch notifications (with server-side filter) ───────────────────────
  const fetchNotifications = useCallback(
    async (type: FilterType, read: FilterRead) => {
      setLoading(true);
      try {
        const params: GetNotificationParams = {};
        if (type !== "ALL") params.type = type;
        if (read === "UNREAD") params.isRead = false;
        if (read === "READ") params.isRead = true;
        const data = await notificationService.getAll(params);
        const safeData = Array.isArray(data) ? data : [];
        setNotifications(safeData);
        // Khi đang xem "ALL" + "ALL" thì tính lại badge theo type từ data
        if (type === "ALL" && read === "ALL") {
          recomputeTypeCounts(safeData);
        }
      } finally {
        setLoading(false);
      }
    },
    [recomputeTypeCounts],
  );

  // ── Open panel → load all notifications ──────────────────────────────────
  const openPanel = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      await fetchNotifications(filterType, filterRead);
    }
  };

  // ── Re-fetch when filter changes (only when panel is open) ───────────────
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(filterType, filterRead);
    }
  }, [isOpen, filterType, filterRead, fetchNotifications]);

  // ── Mark single as read ───────────────────────────────────────────────────
  const handleClickNotification = async (notif: NotificationResponse) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
      setBadgeCount((prev) => Math.max(0, prev - 1));
      setTypeCounts((prev) => ({
        ...prev,
        ALL: Math.max(0, prev.ALL - 1),
        [notif.type]: Math.max(0, (prev[notif.type as keyof TypeCount] ?? 1) - 1),
      }));
    }
    // Navigate
    if (notif.refEmployeeId) {
      router.push(`/admin/employees/${notif.refEmployeeId}`);
    }
    setIsOpen(false);
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBadgeCount(0);
    setTypeCounts({ ALL: 0, WORK_TIME_CONFLICT: 0, NEW_EMPLOYEE_CREATED: 0 });
  };

  // ── Filter (now server-side; client state just tracks UI) ─────────────────
  const filtered = notifications;

  // ── Format time ───────────────────────────────────────────────────────────
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const hhmm = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("vi-VN");
    return `${hhmm} - ${date}`;
  };

  if (!hasPermission) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        id="notification-bell-btn"
        onClick={openPanel}
        className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Thông báo"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          id="notification-panel"
          className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          style={{ maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="font-semibold text-gray-800">Thông báo</h3>
              {badgeCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badgeCount}
                </span>
              )}
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="px-4 py-2 border-b border-gray-100 space-y-2">
            {/* Type filter */}
            <div className="flex gap-1 flex-wrap">
              {(
                [
                  { val: "ALL", label: "Tất cả" },
                  { val: "WORK_TIME_CONFLICT", label: "⚠️ Trùng giờ" },
                  { val: "NEW_EMPLOYEE_CREATED", label: "👤 NV mới" },
                ] as { val: FilterType; label: string }[]
              ).map(({ val, label }) => {
                const unread = typeCounts[val as keyof TypeCount] ?? 0;
                return (
                  <button
                    key={val}
                    onClick={() => setFilterType(val)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      filterType === val
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                    {unread > 0 && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[16px] h-4 text-[10px] font-bold rounded-full px-1 leading-none ${
                          filterType === val
                            ? "bg-white text-blue-600"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Read filter */}
            <div className="flex gap-1">
              {(
                [
                  { val: "ALL", label: "Tất cả" },
                  { val: "UNREAD", label: "Chưa đọc" },
                  { val: "READ", label: "Đã đọc" },
                ] as { val: FilterRead; label: string }[]
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setFilterRead(val)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterRead === val
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <svg
                  className="animate-spin w-6 h-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">🔕</div>
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClickNotification(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !notif.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    {!notif.isRead ? (
                      <span className="block w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`text-xl shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === "WORK_TIME_CONFLICT"
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    {notif.type === "WORK_TIME_CONFLICT" ? "⚠️" : "👤"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-tight ${
                        !notif.isRead
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>

                  {/* Read badge */}
                  {notif.isRead && (
                    <span className="shrink-0 text-[10px] text-gray-400 mt-1">
                      ✓ Đã đọc
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer - Xem tất cả */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/admin/notifications");
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium py-1 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
              </svg>
              Xem tất cả thông báo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
