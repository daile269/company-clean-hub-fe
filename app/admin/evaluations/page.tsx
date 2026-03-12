"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import attendanceService, { Attendance } from "@/services/attendanceService";
import evaluationService from "@/services/evaluationService";
import toast, { Toaster } from "react-hot-toast";
import { usePermission } from "@/hooks/usePermission";
import { authService } from "@/services/authService";

export default function EvaluationsPage() {
  const router = useRouter();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();
  const role = user?.roleName;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Permission check - Allow QLT1, QLT2, and ADMIN
  const isAllowed = role === 'QLT1' || role === 'QLT2' || role === 'ADMIN';

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchTerm);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load attendances
  useEffect(() => {
    if (!isAllowed) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getAll({
          keyword: searchKeyword,
          month: selectedMonth,
          year: selectedYear,
          page: currentPage,
          pageSize: pageSize,
        });
        setAttendances(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error loading attendances for evaluation:", error);
        toast.error("Không thể tải danh sách điểm danh");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchKeyword, selectedMonth, selectedYear, currentPage, pageSize, isAllowed]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Đã duyệt</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Chờ duyệt</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Chưa đánh giá</span>;
    }
  };

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xác nhận hiệu suất Auto Capture</h1>
        <p className="text-gray-500 mt-2">Kiểm tra ảnh chụp, GPS và xác nhận tính chính xác của dữ liệu điểm danh.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm nhân viên</label>
            <input
              type="text"
              placeholder="Tên, mã nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nhân viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center">Đang tải...</td></tr>
            ) : attendances.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Không có dữ liệu</td></tr>
            ) : (
              attendances.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.employeeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(a.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(a.evaluationStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/evaluations/${a.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Chi tiết & Đánh giá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
