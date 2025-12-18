"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import payrollService, { Payroll, PayrollStatus } from "@/services/payrollService";
import attendanceService, { Attendance } from "@/services/attendanceService";
import { assignmentService, Assignment } from "@/services/assignmentService";
import PayrollUpdateModal from "@/components/PayrollUpdateModal";
import PayrollPaymentModal from "@/components/PayrollPaymentModal";
import AttendanceEditModal from "@/components/AttendanceEditModal";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import toast, { Toaster } from "react-hot-toast";
import FullPageLoading from "@/components/shared/FullPageLoading";
export default function PayrollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  // Attendance list state for this payroll's employee & month
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const showOverlay = (message?: string) => {
    setOverlayMessage(message || "Đang xử lý...");
    setOverlayVisible(true);
  };

  const hideOverlay = () => {
    setOverlayVisible(false);
    setOverlayMessage("");
  };
  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    console.log("Showing toast:", msg, type);
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast(msg);
  };
  useEffect(() => {
    loadPayroll({ showOverlay: true, message: "Đang tải thông tin bảng lương..." });
  }, [id]);

  const loadPayroll = async (options?: { showOverlay?: boolean; message?: string }) => {
    const shouldShowOverlay = options?.showOverlay ?? false;
    try {
      setLoading(true);
      if (shouldShowOverlay) {
        showOverlay(options?.message || "Đang tải thông tin bảng lương...");
      }
      const data = await payrollService.getPayrollById(Number(id));
      setPayroll(data);
      // load attendances for this employee/month
      if (data && data.employeeId) {
        loadAttendances(data.employeeId, data.month, data.year);
        loadAssignments(data.employeeId, data.month, data.year);
      }
    } catch (error) {
      console.error("Failed to load payroll:", error);
      toast.error("Không thể tải thông tin bảng lương");
    } finally {
      setLoading(false);
      if (shouldShowOverlay) {
        hideOverlay();
      }
    }
  };

  const loadAttendances = async (
    employeeId: number | string,
    month: number | undefined,
    year: number | undefined
  ) => {
    try {
      setAttLoading(true);
      const res = await attendanceService.getByEmployeeAndMonth(employeeId, {
        month,
        year,
        page: 0,
        pageSize: 1000, // Lấy tất cả record cho lịch
      });
      setAttendances(res.content || []);
    } catch (error) {
      console.error("Error loading attendances:", error);
      toast.error("Không thể tải danh sách chấm công");
    } finally {
      setAttLoading(false);
    }
  };

  const loadAssignments = async (employeeId: number | string, month: number | undefined, year: number | undefined) => {
    try {
      const res = await assignmentService.getAssignmentsByEmployeeId(employeeId.toString(), month || 0, year || 0);
      setAssignments(res);
      console.log("Loaded assignments:", res);
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setShowEditAttendanceModal(true);
  };

  const handleEditAttendanceSuccess = async () => {
    try {
      // Nếu chưa có payroll (trường hợp bất thường) thì chỉ reload dữ liệu
      if (!payroll) {
        await loadPayroll({ showOverlay: true, message: "Đang tải thông tin bảng lương..." });
        return;
      }

      showOverlay("Đang tính lại bảng lương...");
      // Sau khi cập nhật chấm công, gọi API tính lại bảng lương cho kỳ hiện tại
      await payrollService.recalculatePayroll(payroll.id, {});

      // Reload lại payroll + danh sách chấm công
      setOverlayMessage("Đang tải thông tin bảng lương...");
      await loadPayroll({ showOverlay: false });
      hideOverlay();
      toast.success("Đã tính lại bảng lương theo chấm công mới");
    } catch (error) {
      console.error("Failed to recalculate payroll after attendance update:", error);
      hideOverlay();
      toast.error("Không thể tính lại bảng lương sau khi cập nhật chấm công");
    }
  };

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

  const getAssignmentTypeLabel = (type: string | undefined): string => {
    if (!type) return "";
    const typeMap: Record<string, string> = {
      "FIXED_BY_CONTRACT": "Phân công cố định (hợp đồng)",
      "FIXED_BY_DAY": "Phân công cố định (theo ngày)",
      "TEMPORARY": "Phân công tạm thời",
      "FIXED_BY_COMPANY": "Phân công cố định (theo công ty)",
    };
    return typeMap[type] || type;
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

  const getAssignmentTypeColor = (type: string | undefined): string => {
    if (!type) return "bg-gray-100 text-gray-800";
    const colorMap: Record<string, string> = {
      "FIXED_BY_CONTRACT": "bg-blue-100 text-blue-800",
      "FIXED_BY_DAY": "bg-green-100 text-green-800",
      "TEMPORARY": "bg-orange-100 text-orange-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };


  if (!payroll) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy bảng lương</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Toaster position="top-right" />
      {loading && <FullPageLoading />}
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
          {payroll.status !== 'PAID' && (
            <button
              onClick={() => setShowPaymentModal(true)}
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Thanh toán lương
            </button>
          )}
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Cập nhật & Tính lại
          </button>
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
              <p className="mt-1 text-sm text-gray-900  ">
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
                Loại phân công
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {assignments && assignments.length > 0 ? (
                  // Lấy các assignmentType duy nhất
                  [...new Map(assignments.map(a => [a.assignmentType, a])).values()].map(
                    (assignment) => (
                      <span
                        key={assignment.id}
                        className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getAssignmentTypeColor(assignment.assignmentType)}`}
                      >
                        {getAssignmentTypeLabel(assignment.assignmentType)}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-sm text-gray-500">Không có phân công</span>
                )}
              </div>

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
              Khách hàng & Công
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Số khách hàng phục vụ
                </label>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {attendances.length > 0
                    ? new Set(attendances.map(att => att.customerId)).size
                    : 0} khách
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">
                  Tổng ngày công
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
              {/* <p className="text-sm text-gray-500 mt-2">
                = Lương cơ bản + Thưởng + Phụ cấp - Phạt - Bảo hiểm - Ứng trước
              </p> */}
            </div>
            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow p-6 mt-4">
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
                      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(payroll.status)}`}
                    >
                      {getStatusLabel(payroll.status)}
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
                {payroll.paidAmount > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Đã thanh toán
                      </label>
                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {formatCurrency(payroll.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Còn lại
                      </label>
                      <p className="mt-1 text-lg font-semibold text-orange-600">
                        {formatCurrency(payroll.remainingAmount)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Calculation Formulas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Công thức tính lương theo loại phân công
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Formula 1: FIXED_BY_CONTRACT */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Phân công cố định (Hợp đồng)
              </h4>
              <div className="text-xs text-gray-700 space-y-1 bg-blue-50 p-3 rounded">
                <p><span className="font-semibold">Lương ngày = </span></p>
                <p className="ml-2">(Lương + Thưởng + Phụ cấp) ÷ Số ngày DK</p>
                <p className="mt-2"><span className="font-semibold">Lương thực = </span></p>
                <p className="ml-2">Lương ngày × Số ngày thực tế</p>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-gray-600">Ví dụ: (30tr + 0 + 0) ÷ 26 = ~1.15tr/ngày</p>
                </div>
              </div>
            </div>

            {/* Formula 2: FIXED_BY_DAY */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Phân công cố định (Theo ngày)
              </h4>
              <div className="text-xs text-gray-700 space-y-1 bg-green-50 p-3 rounded">
                <p><span className="font-semibold">Lương thực = </span></p>
                <p className="ml-2">Lương ngày × Số ngày thực tế</p>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="text-gray-600">Ví dụ: 500k/ngày × 20 ngày = 10tr</p>
                </div>
              </div>
            </div>

            {/* Formula 3: TEMPORARY */}
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Phân công tạm thời
              </h4>
              <div className="text-xs text-gray-700 space-y-1 bg-orange-50 p-3 rounded">
                <p><span className="font-semibold">Lương thực = </span></p>
                <p className="ml-2">Lương ngày × Số ngày thực tế</p>
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <p className="text-gray-600">Ví dụ: 500k/ngày × 20 ngày = 10tr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Calculation Formula */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Lương thực nhận cuối cùng
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="text-blue-600 font-semibold">Lương thực nhận =</span>
                <span className="text-black"> Tổng lương</span>
                <span className="text-green-600"> + Thưởng</span>
                <span className="text-purple-600"> + Phụ cấp</span>
                <span className="text-red-600"> - Phạt</span>
                <span className="text-yellow-600"> - Bảo hiểm - Ứng trước</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {payroll && (
        <PayrollUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={loadPayroll}
          payrollId={payroll.id}
          currentValues={{
            insuranceTotal: payroll.insuranceTotal,
            advanceTotal: payroll.advanceTotal,
          }}
          onShowToast={(msg, type) => showToast(msg, type)}
        />
      )}

      {/* Payment Modal */}
      <PayrollPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        payroll={payroll}
        onSuccess={() => {
          toast.success("Đã cập nhật thanh toán thành công!");
          loadPayroll({});
        }}
      />

      {/* Edit Attendance Modal */}
      <AttendanceEditModal
        isOpen={showEditAttendanceModal}
        onClose={() => {
          setShowEditAttendanceModal(false);
          setSelectedAttendance(null);
        }}
        onSuccess={handleEditAttendanceSuccess}
        attendance={selectedAttendance}
        onStartLoading={() => setLoading(true)}
        onStopLoading={() => setLoading(false)}
        onShowToast={(msg, type) => showToast(msg, type)}
      />

      {/* Attendance Calendar for this payroll's employee/month */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chấm công (Tháng {payroll.month}/{payroll.year})</h3>
        </div>
        <AttendanceCalendar
          attendances={attendances}
          month={payroll.month}
          year={payroll.year}
          payrollCalculatedDate={payroll.createdAt}
          onSuccess={handleEditAttendanceSuccess}
          loading={attLoading}
          onEditAttendance={handleEditAttendance}
          onAsyncStart={(message) =>
            showOverlay(message || "Đang cập nhật phụ cấp...")
          }
          onAsyncEnd={hideOverlay}
        />
      </div>
    </div>
  );
}
