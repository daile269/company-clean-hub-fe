"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  notificationService,
  NotificationResponse,
  GetNotificationParams,
} from "@/services/notificationService";

type FilterType = "ALL" | "WORK_TIME_CONFLICT" | "NEW_EMPLOYEE_CREATED";
type FilterRead = "ALL" | "UNREAD" | "READ";

const PAGE_SIZE = 10;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTimeRelative = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

export default function NotificationsPage() {
  const router = useRouter();

  // Data state
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NotificationResponse | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterRead, setFilterRead] = useState<FilterRead>("ALL");
  const [searchText, setSearchText] = useState("");

  // Server-side pagination state (currentPage is 1-indexed for UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Unread badge (fetched independently)
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch unread count riêng để header luôn chính xác ────────────────────
  useEffect(() => {
    notificationService.getUnreadCount().then(setUnreadCount);
  }, []);

  // ── Fetch paginated notifications ─────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (type: FilterType, read: FilterRead, page: number) => {
      setLoading(true);
      try {
        const params: GetNotificationParams = {
          page: page - 1, // API 0-indexed
          pageSize: PAGE_SIZE,
        };
        if (type !== "ALL") params.type = type;
        if (read === "UNREAD") params.isRead = false;
        if (read === "READ") params.isRead = true;

        const result = await notificationService.getAllPaginated(params);
        setNotifications(result.content);
        setTotalPages(Math.max(1, result.totalPages));
        setTotalElements(result.totalElements);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch khi filter hoặc page thay đổi
  useEffect(() => {
    fetchNotifications(filterType, filterRead, currentPage);
  }, [filterType, filterRead, currentPage, fetchNotifications]);

  // ── Filter handlers — reset về trang 1 khi đổi filter ────────────────────
  const handleTypeChange = (val: FilterType) => {
    setFilterType(val);
    setCurrentPage(1);
  };
  const handleReadChange = (val: FilterRead) => {
    setFilterRead(val);
    setCurrentPage(1);
  };

  // ── Pagination helpers ────────────────────────────────────────────────────
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  // ── Client-side search (trong trang hiện tại) ────────────────────────────
  const filtered = notifications.filter((n) =>
    searchText
      ? n.title.toLowerCase().includes(searchText.toLowerCase()) ||
        n.message.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSelect = async (notif: NotificationResponse) => {
    setSelected(notif);
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setSelected({ ...notif, isRead: true });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (selected) setSelected({ ...selected, isRead: true });
    setUnreadCount(0);
  };

  return (
    <div className="h-[calc(100vh-64px-64px)] flex flex-col gap-0">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Tất cả đã đọc"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <button
            onClick={() => fetchNotifications(filterType, filterRead, currentPage)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── LEFT: Notification List ─────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Filters */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm trong trang này..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Type + Read filters */}
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  { val: "ALL", label: "Tất cả", icon: "🔔" },
                  { val: "WORK_TIME_CONFLICT", label: "Trùng giờ", icon: "⚠️" },
                  { val: "NEW_EMPLOYEE_CREATED", label: "NV mới", icon: "👤" },
                ] as { val: FilterType; label: string; icon: string }[]
              ).map(({ val, label, icon }) => (
                <button
                  key={val}
                  onClick={() => handleTypeChange(val)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterType === val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
              <div className="flex-1" />
              {(
                [
                  { val: "ALL", label: "Tất cả" },
                  { val: "UNREAD", label: "Chưa đọc" },
                  { val: "READ", label: "Đã đọc" },
                ] as { val: FilterRead; label: string }[]
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => handleReadChange(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterRead === val
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Count bar */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {loading
                ? "Đang tải..."
                : searchText
                ? `${filtered.length} kết quả trong trang · Tổng ${totalElements}`
                : `${totalElements} thông báo · Trang ${currentPage}/${totalPages}`}
            </p>
            {!loading && totalElements > 0 && !searchText && (
              <p className="text-xs text-gray-400">
                Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalElements)}
              </p>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-400">Đang tải thông báo...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="text-5xl">🔕</div>
                <p className="text-gray-400 text-sm font-medium">Không có thông báo nào</p>
                <p className="text-gray-300 text-xs">Thử thay đổi bộ lọc để xem thêm</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleSelect(notif)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors flex gap-3 items-start relative ${
                    selected?.id === notif.id
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : !notif.isRead
                      ? "bg-blue-50/20"
                      : ""
                  }`}
                >
                  <div className="pt-2 shrink-0">
                    {!notif.isRead ? (
                      <span className="block w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className={`text-lg shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    notif.type === "WORK_TIME_CONFLICT" ? "bg-orange-100" : "bg-green-100"
                  }`}>
                    {notif.type === "WORK_TIME_CONFLICT" ? "⚠️" : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${
                      !notif.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatTimeRelative(notif.createdAt)}
                    </p>
                  </div>
                  {selected?.id === notif.id && (
                    <div className="shrink-0 mt-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* ── Pagination Bar (server-side) ────────────────────────────── */}
          {!loading && totalPages > 1 && (
            <div className="flex-shrink-0 border-t border-gray-100 px-4 py-2.5 bg-gray-50 flex items-center justify-between gap-2">
              {/* First + Prev */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang đầu"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="min-w-[28px] h-7 px-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-gray-400 text-xs px-0.5">…</span>}
                  </>
                )}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] h-7 px-1.5 text-xs font-medium rounded-lg transition-all ${
                      page === currentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-gray-400 text-xs px-0.5">…</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="min-w-[28px] h-7 px-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next + Last */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang sau"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang cuối"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Detail Panel ─────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {selected ? (
            <>
              {/* Detail Header */}
              <div className={`px-6 py-5 border-b border-gray-100 ${
                selected.type === "WORK_TIME_CONFLICT"
                  ? "bg-gradient-to-r from-orange-50 to-amber-50"
                  : "bg-gradient-to-r from-green-50 to-emerald-50"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 ${
                    selected.type === "WORK_TIME_CONFLICT" ? "bg-orange-100" : "bg-green-100"
                  }`}>
                    {selected.type === "WORK_TIME_CONFLICT" ? "⚠️" : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        selected.type === "WORK_TIME_CONFLICT"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {selected.type === "WORK_TIME_CONFLICT" ? "Trùng giờ làm" : "Nhân viên mới"}
                      </span>
                      {selected.isRead ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đã đọc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Chưa đọc
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                      {selected.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Message */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Nội dung
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {selected.message}
                  </p>
                </div>

                {/* Meta info */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Thông tin chi tiết
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thời gian
                      </span>
                      <span className="text-sm font-medium text-gray-800">{formatTime(selected.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Loại thông báo
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {selected.typeDescription || (selected.type === "WORK_TIME_CONFLICT" ? "Trùng giờ làm" : "Nhân viên mới")}
                      </span>
                    </div>

                    {selected.refEmployeeId && (
                      <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Nhân viên liên quan
                        </span>
                        <span className="text-sm font-medium text-gray-800">#{selected.refEmployeeId}</span>
                      </div>
                    )}

                    {selected.refAssignmentId && (
                      <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Phân công liên quan
                        </span>
                        <span className="text-sm font-medium text-gray-800">#{selected.refAssignmentId}</span>
                      </div>
                    )}

                    {selected.refContractId && (
                      <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Hợp đồng liên quan
                        </span>
                        <span className="text-sm font-medium text-gray-800">#{selected.refContractId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {(selected.refEmployeeId || selected.refAssignmentId || selected.refContractId) && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Thao tác nhanh
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.refEmployeeId && (
                        <button
                          onClick={() => router.push(`/admin/employees/${selected.refEmployeeId}`)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Xem nhân viên
                        </button>
                      )}
                      {selected.refAssignmentId && (
                        <button
                          onClick={() => router.push(`/admin/assignments/${selected.refAssignmentId}`)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Xem phân công
                        </button>
                      )}
                      {selected.refContractId && (
                        <button
                          onClick={() => router.push(`/admin/contracts/${selected.refContractId}`)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Xem hợp đồng
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  Chọn thông báo để xem chi tiết
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Click vào một thông báo ở bên trái để xem nội dung và thực hiện thao tác liên quan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
