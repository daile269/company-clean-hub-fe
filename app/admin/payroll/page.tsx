"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import payrollService, { Payroll, PayrollStatus, PayrollOverview } from "@/services/payrollService";
import PayrollCalculateModal from "@/components/PayrollCalculateModal";
import PayrollExportModal from "@/components/PayrollExportModal";
import { usePermission } from '@/hooks/usePermission';
import toast, { Toaster } from "react-hot-toast";

export default function PayrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingToId, setNavigatingToId] = useState<number | null>(null);

  // Khởi tạo state từ query trên URL (giúp quay lại vẫn giữ filter + page)
  const initialSearch = searchParams.get("keyword") ?? "";
  const initialMonth =
    searchParams.get("month") ?? (new Date().getMonth() + 1).toString();
  const initialYear =
    searchParams.get("year") ?? new Date().getFullYear().toString();
  const initialPage = Number(searchParams.get("page") ?? "0");
  const initialSortBy =
    (searchParams.get("sortBy") as
      | "employeeName"
      | "employeeCode"
      | "createdAt"
      | null) ?? "createdAt";
  const initialSortDirection =
    (searchParams.get("sortDirection") as "asc" | "desc" | null) ?? "desc";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterMonth, setFilterMonth] =
    useState<string>(initialMonth || "all");
  const [filterYear, setFilterYear] = useState<string>(initialYear || "all");
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [overview, setOverview] = useState<PayrollOverview | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [pageSize, setPageSize] = useState<number>(15);

  // Sort state
  const [sortField, setSortField] = useState<
    "employeeName" | "employeeCode" | "createdAt"
  >(initialSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection
  );

  // Available years from database
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Permission checks
  const canView = usePermission('PAYROLL_VIEW');
  const canCreate = usePermission('PAYROLL_CREATE');
  const canExport = usePermission(['PAYROLL_VIEW', 'PAYROLL_EXPORT'], true);

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      const monthFilter = filterMonth !== "all" ? Number(filterMonth) : undefined;
      const yearFilter = filterYear !== "all" ? Number(filterYear) : undefined;

      const [response, overviewData] = await Promise.all([
        payrollService.getPayrolls({
          keyword: searchTerm,
          month: monthFilter,
          year: yearFilter,
          sortBy: sortField,
          sortDirection,
          page: currentPage,
          pageSize,
        }),
        payrollService.getPayrollOverview({
          keyword: searchTerm,
          month: monthFilter,
          year: yearFilter,
        }),
      ]);

      console.log("API Response:", response);
      if (response && response.content) {
        setPayrolls(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setPayrolls([]);
        setTotalPages(0);
        setTotalElements(0);
      }

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
  }, [currentPage, filterMonth, filterYear, sortField, sortDirection, pageSize]);

  // Debounce search
  const searchEffectFirstRunRef = useRef(true);
  useEffect(() => {
    // Bỏ qua lần chạy đầu tiên (khi khởi tạo từ URL) để không reset page về 0
    if (searchEffectFirstRunRef.current) {
      searchEffectFirstRunRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadPayrolls();
      } else {
        setCurrentPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Đồng bộ state (filter + sort + page) -> URL query
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("keyword", searchTerm);
    if (filterMonth) params.set("month", filterMonth);
    if (filterYear) params.set("year", filterYear);
    params.set("page", currentPage.toString());
    if (sortField) params.set("sortBy", sortField);
    if (sortDirection) params.set("sortDirection", sortDirection);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [searchTerm, filterMonth, filterYear, currentPage, sortField, sortDirection, pathname, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalPayroll = overview ? overview.totalFinalSalary : payrolls.reduce((sum, p) => sum + p.remainingAmount, 0);
  const paidPayrolls = overview ? overview.paidPayrolls : payrolls.filter((p) => p.status === 'PAID').length;
  const unpaidPayrolls = overview
    ? overview.unpaidPayrolls + overview.partialPaidPayrolls
    : payrolls.filter((p) => p.status === 'UNPAID' || p.status === 'PARTIAL_PAID').length;

  const toggleSort = (field: 'employeeName' | 'employeeCode') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusLabel = (status: PayrollStatus): string => {
    switch (status) {
      case 'UNPAID': return 'Chưa trả';
      case 'PARTIAL_PAID': return 'Đã trả một phần';
      case 'PAID': return 'Đã trả đủ';
      default: return '';
    }
  };

  const getStatusColor = (status: PayrollStatus): string => {
    switch (status) {
      case 'UNPAID': return 'bg-red-100 text-red-800';
      case 'PARTIAL_PAID': return 'bg-orange-100 text-orange-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleSort('employeeCode')}
              className={`px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center gap-1 ${sortField === 'employeeCode'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span>Sắp xếp mã NV</span>
              {sortField === 'employeeCode' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('employeeName')}
              className={`px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center gap-1 ${sortField === 'employeeName'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span>Sắp xếp tên</span>
              {sortField === 'employeeName' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </div>
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
                {paidPayrolls}
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
                {unpaidPayrolls}
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
                {formatCurrency(totalPayroll)}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nhân viên</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tháng/Năm</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày cập nhật</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lương công</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng phải trả</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrolls.map((payroll) => {
                    const isNavigating = navigatingToId === payroll.id;
                    return (
                      <tr
                        key={payroll.id}
                        className={`cursor-pointer transition-all ${isNavigating
                          ? "bg-blue-50 opacity-60"
                          : "hover:bg-gray-50"
                          }`}
                        onClick={() => {
                          setNavigatingToId(payroll.id);
                          // Small delay to show the loading state before navigation
                          setTimeout(() => {
                            router.push(`/admin/payroll/${payroll.id}`);
                          }, 100);
                        }}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {isNavigating ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              {payroll.employeeCode}
                            </div>
                          ) : (
                            payroll.employeeCode
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payroll.employeeName}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          Tháng {payroll.month}/{payroll.year}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {new Date(payroll.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {payroll.updatedAt ? new Date(payroll.updatedAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-purple-600">
                          {formatCurrency(payroll.baseSalary || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                          {formatCurrency(payroll.remainingAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payroll.status)}`}
                          >
                            {getStatusLabel(payroll.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card layout for mobile screens */}
            <div className="sm:hidden divide-y divide-gray-200">
              {payrolls.map((payroll) => {
                const isNavigating = navigatingToId === payroll.id;
                return (
                  <div
                    key={payroll.id}
                    className={`p-4 active:bg-gray-100 transition-all ${isNavigating ? "bg-blue-50 opacity-60" : ""}`}
                    onClick={() => {
                      setNavigatingToId(payroll.id);
                      setTimeout(() => {
                        router.push(`/admin/payroll/${payroll.id}`);
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
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(payroll.status)}`}>
                        {getStatusLabel(payroll.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Kỳ lương</p>
                        <p className="text-xs text-gray-700 font-semibold">T{payroll.month}/{payroll.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Tổng phải trả</p>
                        <p className="text-sm text-blue-600 font-bold">{formatCurrency(payroll.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Lương công</p>
                        <p className="text-xs text-purple-600 font-semibold">{formatCurrency(payroll.baseSalary || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Ngày tạo</p>
                        <p className="text-[10px] text-gray-600">{new Date(payroll.createdAt).toLocaleDateString('vi-VN')}</p>
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
    </div>
  );
}
