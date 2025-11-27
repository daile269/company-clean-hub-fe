"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import payrollService, { Payroll } from "@/services/payrollService";
import attendanceService, { Attendance } from "@/services/attendanceService";
import { toast } from "react-hot-toast";

export default function PayrollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  // Attendance list state for this payroll's employee & month
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attPage, setAttPage] = useState(0);
  const [attPageSize, setAttPageSize] = useState(10);
  const [attTotalPages, setAttTotalPages] = useState(0);

  useEffect(() => {
    loadPayroll();
  }, [id]);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getPayrollById(Number(id));
      setPayroll(data);
      // load attendances for this employee/month
      if (data && data.employeeId) {
        loadAttendances(data.employeeId, data.month, data.year, attPage, attPageSize);
      }
    } catch (error) {
      console.error("Failed to load payroll:", error);
      toast.error("Không thể tải thông tin bảng lương");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendances = async (
    employeeId: number | string,
    month: number | undefined,
    year: number | undefined,
    page = 0,
    pageSize = 10
  ) => {
    try {
      setAttLoading(true);
      const res = await attendanceService.getByEmployeeAndMonth(employeeId, {
        month,
        year,
        page,
        pageSize,
      });
      setAttendances(res.content || []);
      setAttPage(res.currentPage || page);
      setAttPageSize(res.pageSize || pageSize);
      setAttTotalPages(res.totalPages || 0);
    } catch (error) {
      console.error("Error loading attendances:", error);
      toast.error("Không thể tải danh sách chấm công");
    } finally {
      setAttLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!confirm("Xác nhận đã thanh toán lương?")) return;

    try {
      await payrollService.markAsPaid(Number(id));
      toast.success("Đã cập nhật trạng thái thanh toán");
      loadPayroll();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  //   const handleDelete = async () => {
  //     if (!confirm("Bạn có chắc chắn muốn xóa bảng lương này?")) return;

  //     try {
  //       await payrollService.deletePayroll(Number(id));
  //       toast.success("Xóa bảng lương thành công");
  //       router.push("/admin/payroll");
  //     } catch (error) {
  //       console.error("Failed to delete payroll:", error);
  //       toast.error("Không thể xóa bảng lương");
  //     }
  //   };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy bảng lương</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push("/admin/payroll")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết bảng lương
          </h1>
        </div>
        <div className="flex gap-3">
          {!payroll.isPaid && (
            <button
              onClick={handleMarkAsPaid}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Thanh toán
            </button>
          )}
          {/* <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Xóa
          </button> */}
        </div>
      </div>

      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Thông tin nhân viên
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Mã nhân viên
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {payroll.employeeCode}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Tên nhân viên
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {payroll.employeeName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Loại hợp đồng
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {payroll.employmentType}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Kỳ lương
              </label>
              <p className="mt-1 text-sm text-gray-900">
                Tháng {payroll.month}/{payroll.year}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Thông tin công và lương cơ bản */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Lương cơ bản & Công
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Lương cơ bản
                </label>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {formatCurrency(payroll.salaryBase)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Số ngày công
                </label>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {payroll.totalDays} ngày
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Các khoản cộng/trừ */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Các khoản điều chỉnh
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Tổng thưởng
                </label>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  +{formatCurrency(payroll.bonusTotal)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Tổng phạt
                </label>
                <p className="mt-1 text-lg font-semibold text-red-600">
                  -{formatCurrency(payroll.penaltyTotal)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Phụ cấp
                </label>
                <p className="mt-1 text-lg font-semibold text-purple-600">
                  +{formatCurrency(payroll.allowanceTotal)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Bảo hiểm
                </label>
                <p className="mt-1 text-lg font-semibold text-orange-600">
                  -{formatCurrency(payroll.insuranceTotal)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Ứng trước
                </label>
                <p className="mt-1 text-lg font-semibold text-yellow-600">
                  -{formatCurrency(payroll.advanceTotal)}
                </p>
              </div>
            </div>
          </div>
          {/* Tổng lương thực nhận */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <label className="text-base font-medium text-gray-600">
                Tổng lương thực nhận
              </label>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {formatCurrency(payroll.finalSalary)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                = Lương cơ bản + Thưởng + Phụ cấp - Phạt - Bảo hiểm - Ứng trước
              </p>
            </div>
            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Trạng thái thanh toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                        payroll.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payroll.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày thanh toán
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(payroll.paymentDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance list for this payroll's employee/month */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chấm công (Tháng {payroll.month}/{payroll.year})</h3>
        </div>

        {attLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có bản ghi chấm công trong tháng này</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-left">Giờ công</th>
                  <th className="px-4 py-3 text-right">Thưởng</th>
                  <th className="px-4 py-3 text-right">Phạt</th>
                  <th className="px-4 py-3 text-right">Hỗ trợ</th>
                  <th className="px-4 py-3 text-right">Tăng ca</th>
                  <th className="px-4 py-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(a.date)}</td>
                    <td className="px-4 py-3">{a.workHours}h</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(a.bonus || 0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(a.penalty || 0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(a.supportCost || 0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(a.overtimeAmount || 0)}</td>
                    <td className="px-4 py-3">{a.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Trang {attPage + 1} / {attTotalPages || 1}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (attPage > 0 && payroll) {
                  const newPage = attPage - 1;
                  setAttPage(newPage);
                  loadAttendances(payroll.employeeId, payroll.month, payroll.year, newPage, attPageSize);
                }
              }}
              disabled={attPage <= 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => {
                if (payroll && attPage + 1 < attTotalPages) {
                  const newPage = attPage + 1;
                  setAttPage(newPage);
                  loadAttendances(payroll.employeeId, payroll.month, payroll.year, newPage, attPageSize);
                }
              }}
              disabled={attPage + 1 >= (attTotalPages || 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Tiếp
            </button>
            <select
              value={attPageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setAttPageSize(newSize);
                if (payroll) loadAttendances(payroll.employeeId, payroll.month, payroll.year, 0, newSize);
                setAttPage(0);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
