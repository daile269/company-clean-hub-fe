"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import payrollService, { PayrollSummaryItem, PayrollOverview } from "@/services/payrollService";
import PayrollCalculateModal from "@/components/PayrollCalculateModal";
import PayrollExportModal from "@/components/PayrollExportModal";
import PayrollPaymentModal from "@/components/PayrollPaymentModal";
import { usePermission } from '@/hooks/usePermission';
import toast, { Toaster } from "react-hot-toast";

export default function PayrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [payrolls, setPayrolls] = useState<PayrollSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingToId, setNavigatingToId] = useState<number | null>(null);
  const [scrollToId, setScrollToId] = useState<number | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayrollForPayment, setSelectedPayrollForPayment] = useState<PayrollSummaryItem | null>(null);


  const payrollRefs = useRef<{ [key: number]: HTMLTableRowElement | HTMLDivElement | null }>({});
  const hasScrolled = useRef(false);

  // Read scrollToId from URL on mount
  useEffect(() => {
    const scrollToIdParam = searchParams.get('scrollToId');
    if (scrollToIdParam && !hasScrolled.current) {
      const id = Number(scrollToIdParam);
      setScrollToId(id);
    } else if (!scrollToIdParam) {
      hasScrolled.current = false;
    }
  }, [searchParams]);

  // Perform scroll after data is loaded and refs are set
  useEffect(() => {
    if (scrollToId !== null && !loading && payrolls.length > 0 && !hasScrolled.current) {
      const targetPayroll = payrolls.find(p => p.payrollId === scrollToId);

      if (!targetPayroll) {
        hasScrolled.current = true;
        setScrollToId(null);
        const params = new URLSearchParams(window.location.search);
        params.delete('scrollToId');
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        return;
      }

      const performScroll = (attempt = 1) => {
        const element = payrollRefs.current[scrollToId];

        if (element) {
          hasScrolled.current = true;
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          element.style.backgroundColor = "#dbeafe";
          element.style.transition = "background-color 0.3s";
          element.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
          setTimeout(() => {
            element.style.backgroundColor = "";
            element.style.boxShadow = "";
          }, 2500);
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.delete('scrollToId');
            const queryString = params.toString();
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
            setScrollToId(null);
          }, 1000);
          return true;
        }
        return false;
      };

      let currentAttempt = 0;
      const maxAttempts = 3;
      const tryScroll = () => {
        currentAttempt++;
        const success = performScroll(currentAttempt);
        if (!success && currentAttempt < maxAttempts) {
          setTimeout(tryScroll, 200 * currentAttempt);
        } else if (!success) {
          hasScrolled.current = true;
          setScrollToId(null);
        }
      };
      setTimeout(tryScroll, 100);
    }
  }, [scrollToId, loading, payrolls, pathname, router]);

  // Khởi tạo state từ query trên URL (giúp quay lại vẫn giữ filter + page)
  const initialSearch = searchParams.get("keyword") ?? "";
  const initialMonth =
    searchParams.get("month") ?? (new Date().getMonth() + 1).toString();
  const initialYear =
    searchParams.get("year") ?? new Date().getFullYear().toString();
  const initialPage = Number(searchParams.get("page") ?? "0");

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterMonth, setFilterMonth] =
    useState<string>(initialMonth || "all");
  const [filterYear, setFilterYear] = useState<string>(initialYear || "all");
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [overview, setOverview] = useState<PayrollOverview | null>(null);

  // Pagination (FE-side since summary API returns full list)
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState<number>(15);
  const [showExportModal, setShowExportModal] = useState(false);

  // Available years from database
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Permission checks
  const canView = usePermission('PAYROLL_VIEW');
  const canCreate = usePermission('PAYROLL_CREATE');
  const canExport = usePermission(['PAYROLL_VIEW', 'PAYROLL_EXPORT'], true);
  const canMarkPaid = usePermission('PAYROLL_MARK_PAID');

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      const monthFilter = filterMonth !== "all" ? Number(filterMonth) : undefined;
      const yearFilter = filterYear !== "all" ? Number(filterYear) : undefined;

      const [summaryData, overviewData] = await Promise.all([
        payrollService.getPayrollSummary(monthFilter, yearFilter),
        payrollService.getPayrollOverview({
          keyword: searchTerm,
          month: monthFilter,
          year: yearFilter,
        }),
      ]);

      // Apply FE-side keyword search (summary API doesn't support keyword)
      let filteredData = summaryData || [];
      if (searchTerm) {
        const keyword = searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (p) =>
            p.employeeCode?.toLowerCase().includes(keyword) ||
            p.employeeName?.toLowerCase().includes(keyword)
        );
      }
      setPayrolls(filteredData);
      setOverview(overviewData);
    } catch (error) {
      console.error("Failed to load payrolls:", error);
      toast.error("Không thể tải danh sách bảng lương");
    } finally {
      setLoading(false);
    }
  };

  // Load available years on mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await payrollService.getDistinctYears();
        setAvailableYears(years);
      } catch (error) {
        console.error("Failed to load years:", error);
        // Fallback to current year if API fails
        setAvailableYears([new Date().getFullYear()]);
      }
    };
    loadYears();
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    loadPayrolls();
  }, [filterMonth, filterYear]);

  // Debounce search
  const searchEffectFirstRunRef = useRef(true);
  useEffect(() => {
    if (searchEffectFirstRunRef.current) {
      searchEffectFirstRunRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      loadPayrolls();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Đồng bộ state (filter) -> URL query
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("keyword", searchTerm);
    if (filterMonth) params.set("month", filterMonth);
    if (filterYear) params.set("year", filterYear);
    params.set("page", currentPage.toString());

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchTerm, filterMonth, filterYear, currentPage, pathname, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalElements = payrolls.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const totalRemaining = payrolls.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
  const paidCount = payrolls.filter(p => (p.remainingAmount || 0) <= 0).length;
  const unpaidCount = totalElements - paidCount;

  // FE-side pagination
  const paginatedPayrolls = payrolls.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(dateString));
  };

  // Map PayrollSummaryItem to Payroll shape for the payment modal
  const mapToPayroll = (item: PayrollSummaryItem) => ({
    id: item.payrollId,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    employeeCode: item.employeeCode,
    month: item.month,
    year: item.year,
    totalDays: 0,
    bonusTotal: 0,
    penaltyTotal: 0,
    // [DEPRECATED] advanceTotal: 0,
    allowanceTotal: 0,
    insuranceTotal: 0,
    finalSalary: item.totalSalary || 0,
    status: ((item.remainingAmount || 0) <= 0 ? 'PAID' : ((item.paidAmount || 0) > 0 ? 'PARTIAL_PAID' : 'UNPAID')) as "UNPAID" | "PARTIAL_PAID" | "PAID",
    paidAmount: item.paidAmount || 0,
    remainingAmount: item.remainingAmount || 0,
    paymentDate: null,
    accountantId: null,
    accountantName: null,
    createdAt: "",
    updatedAt: "",
  });

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Bạn không có quyền xem bảng lương
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý bảng lương</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {canCreate && (
            <button
              onClick={() => setShowCalculateModal(true)}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tính lương
            </button>
          )}
        </div>
      </div>

      {canCreate && (
        <PayrollCalculateModal
          isOpen={showCalculateModal}
          onClose={() => setShowCalculateModal(false)}
          onSuccess={() => loadPayrolls()}
        />
      )}

      <PayrollExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Tổng bảng lương</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {totalElements}
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {paidCount}
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Chưa thanh toán</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                {unpaidCount}
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Tổng chi lương</p>
              <p className="text-base sm:text-xl font-bold text-purple-600">
                {formatCurrency(totalRemaining)}
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tên, mã nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tháng
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hàng / trang</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const ps = Number(e.target.value) || 15;
                    setPageSize(ps);
                    setCurrentPage(0);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {canExport && (
                <div className="flex items-end col-span-2 lg:col-span-1">
                  <button
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm sm:text-base"
                    onClick={() => setShowExportModal(true)}
                  >
                    Xuất Excel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table for Desktop, Cards for Mobile */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table layout for larger screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tháng/Năm</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày cập nhật</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Xin ứng</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng lương tháng</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đã TT</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Còn lại</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPayrolls.map((payroll) => {
                    const isNavigating = navigatingToId === payroll.payrollId;
                    return (
                      <tr
                        key={payroll.payrollId}
                        ref={(el) => { payrollRefs.current[payroll.payrollId] = el; }}
                        className={`cursor-pointer transition-all ${isNavigating
                          ? "bg-blue-50 opacity-60"
                          : "hover:bg-gray-50"
                          }`}
                        onClick={() => {
                          setNavigatingToId(payroll.payrollId);
                          const currentParams = new URLSearchParams(window.location.search);
                          currentParams.set('scrollToId', payroll.payrollId.toString());
                          const returnUrl = `${pathname}?${currentParams.toString()}`;
                          setTimeout(() => {
                            router.push(`/admin/payroll/${payroll.payrollId}?returnUrl=${encodeURIComponent(returnUrl)}`);
                          }, 100);
                        }}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {isNavigating ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              {payroll.employeeCode}
                            </div>
                          ) : (
                            payroll.employeeCode
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{payroll.employeeName}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">
                          {payroll.month}/{payroll.year}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">
                          {formatDate(payroll.updatedAt)}
                        </td>
                        <td className="px-4 py-4 text-sm text-right text-yellow-700 font-medium">
                          {payroll.advanceNote != null ? formatCurrency(payroll.advanceNote) : "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-right font-semibold text-blue-600">
                          {formatCurrency(payroll.totalSalary || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(payroll.paidAmount || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm text-right font-bold text-red-600">
                          {formatCurrency(payroll.remainingAmount || 0)}
                        </td>
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {canMarkPaid && (
                            <button
                              onClick={() => {
                                setSelectedPayrollForPayment(payroll);
                                setShowPaymentModal(true);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                              TT
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card layout for mobile screens */}
            <div className="sm:hidden divide-y divide-gray-200">
              {paginatedPayrolls.map((payroll) => {
                const isNavigating = navigatingToId === payroll.payrollId;
                return (
                  <div
                    key={payroll.payrollId}
                    ref={(el) => { payrollRefs.current[payroll.payrollId] = el; }}
                    className={`p-4 active:bg-gray-100 transition-all ${isNavigating ? "bg-blue-50 opacity-60" : ""}`}
                    onClick={() => {
                      setNavigatingToId(payroll.payrollId);
                      const currentParams = new URLSearchParams(window.location.search);
                      currentParams.set('scrollToId', payroll.payrollId.toString());
                      const returnUrl = `${pathname}?${currentParams.toString()}`;
                      setTimeout(() => {
                        router.push(`/admin/payroll/${payroll.payrollId}?returnUrl=${encodeURIComponent(returnUrl)}`);
                      }, 100);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {isNavigating && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>}
                        <span className="text-xs font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-gray-100 rounded">
                          {payroll.employeeCode}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{payroll.employeeName}</span>
                      </div>
                      {canMarkPaid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayrollForPayment(payroll);
                            setShowPaymentModal(true);
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          TT
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Kỳ lương</p>
                        <p className="text-xs text-gray-700 font-semibold">{payroll.month}/{payroll.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Còn lại</p>
                        <p className="text-sm text-red-600 font-bold">{formatCurrency(payroll.remainingAmount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Tổng lương</p>
                        <p className="text-xs text-blue-600 font-semibold">{formatCurrency(payroll.totalSalary || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Xin ứng</p>
                        <p className="text-xs text-yellow-600 font-semibold">{payroll.advanceNote != null ? formatCurrency(payroll.advanceNote) : "-"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {payrolls.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy bảng lương
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:!hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{" "}
                    <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong tổng số{" "}
                    <span className="font-medium">{totalElements}</span> bản ghi
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Trước</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Sau</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {canMarkPaid && selectedPayrollForPayment && (
        <PayrollPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayrollForPayment(null);
          }}
          payroll={mapToPayroll(selectedPayrollForPayment)}
          onSuccess={() => {
            toast.success("Thanh toán thành công!");
            setShowPaymentModal(false);
            setSelectedPayrollForPayment(null);
            loadPayrolls();
          }}
        />
      )}
    </div>
  );
}
