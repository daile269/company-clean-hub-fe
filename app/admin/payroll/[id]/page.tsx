"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import payrollService, { Payroll, PayrollStatus, PaymentHistory } from "@/services/payrollService";
import attendanceService, { Attendance } from "@/services/attendanceService";
import { assignmentService, Assignment } from "@/services/assignmentService";
import PayrollUpdateModal from "@/components/PayrollUpdateModal";
import PayrollPaymentModal from "@/components/PayrollPaymentModal";
import AttendanceEditModal from "@/components/AttendanceEditModal";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import toast, { Toaster } from "react-hot-toast";
import FullPageLoading from "@/components/shared/FullPageLoading";
import { usePermission } from "@/hooks/usePermission";
export default function PayrollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Permission checks
  const canView = usePermission("PAYROLL_VIEW");
  const canEdit = usePermission("PAYROLL_EDIT");
  const canMarkPaid = usePermission("PAYROLL_MARK_PAID");
  const canEditAttendance = usePermission("ATTENDANCE_EDIT");

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
  const [activeTab, setActiveTab] = useState<'salary' | 'history'>('salary');
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // State for editing advance note
  const [advanceNote, setAdvanceNote] = useState(0);
  const [isEditingAdvance, setIsEditingAdvance] = useState(false);

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
      console.log("Loaded payroll:", data);
      setPayroll(data);
      setAdvanceNote(data.advanceTotal || 0); // Initialize advance note
      loadPaymentHistory(); // Auto-load payment history
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

  const loadPaymentHistory = async () => {
    if (!id) return;
    try {
      setHistoryLoading(true);
      const history = await payrollService.getPaymentHistory(Number(id));
      setPaymentHistory(history);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      toast.error('Không thể tải lịch sử thanh toán');
    } finally {
      setHistoryLoading(false);
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

  const handleSaveAdvanceNote = async () => {
    if (!payroll) return;

    try {
      setIsEditingAdvance(true);
      showOverlay("Đang cập nhật xin ứng lương...");

      await payrollService.recalculatePayroll(payroll.id, {
        advanceTotal: advanceNote,
      });

      await loadPayroll({ showOverlay: false });
      hideOverlay();
      toast.success("Đã cập nhật xin ứng lương thành công!");
    } catch (error) {
      console.error("Failed to update advance note:", error);
      hideOverlay();
      toast.error("Không thể cập nhật xin ứng lương");
    } finally {
      setIsEditingAdvance(false);
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
      "SUPPORT": "Tăng ca"
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

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Bạn không có quyền xem chi tiết bảng lương
          </p>
        </div>
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
          {payroll.status !== 'PAID' && canMarkPaid && (
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
          {canEdit && (
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
          )}
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
                Trạng thái thanh toán
              </label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg ${getStatusColor(payroll.status)}`}>
                  {getStatusLabel(payroll.status)}
                </span>
                {payroll.paymentDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Ngày TT: {formatDate(payroll.paymentDate)}
                  </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metrics & Adjustments (Smaller ratio) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Khách hàng & Công */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold mb-3 text-gray-900">
                Khách hàng & Công
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-500">
                    Số khách hàng
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {attendances.length > 0
                      ? new Set(attendances.map(att => att.customerId)).size
                      : 0} khách
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-500">
                    Tổng ngày công
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {payroll.totalDays} ngày
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Các khoản điều chỉnh */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 flex gap-2 items-center">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Lương ngày công:
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    (Lương cơ bản × Ngày công)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(payroll.baseSalary || 0)}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold m-4 text-gray-900">
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

              </div>
            </div>

            {/* Card 3: Loại phân công */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Loại phân công
              </h3>
              <div className="flex flex-wrap gap-2">
                {assignments && assignments.length > 0 ? (
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
          </div>

          {/* Right Column: Main Summary & Payment (Larger ratio) */}
          <div className="lg:col-span-8">
            {/* Payroll Summary & Payment Info */}
            <div className="bg-white rounded-lg shadow p-6 h-full">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'salary'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Thông tin lương
                </button>
                {paymentHistory.length > 0 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'history'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Lịch sử thanh toán
                  </button>
                )}
              </div>

              {/* Tab Content - Salary Tab */}
              {activeTab === 'salary' && (
                <>

                  {/* Primary Info: Note */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <label className="text-base font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Ghi chú / Nguồn tiền
                    </label>
                    <div className="mt-2 text-gray-800 bg-white/60 p-4 rounded-lg border border-blue-100 min-h-[80px] whitespace-pre-line text-sm leading-relaxed shadow-sm">
                      {payroll.note || "Không có ghi chú chi tiết."}
                    </div>
                  </div>

                  {/* Financial Information Grid - Ordered as requested */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">


                    {/* 2. Total Salary (Tổng lương tháng) */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Tổng lương tháng
                      </label>
                      <p className="mt-2 text-xl font-bold text-blue-600">
                        {formatCurrency(payroll.finalSalary)}
                      </p>
                    </div>

                    {/* 3. Paid Amount (Đã thanh toán) */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Đã thanh toán
                      </label>
                      <p className="mt-2 text-xl font-bold text-green-600">
                        {formatCurrency(payroll.paidAmount)}
                      </p>
                    </div>
                  </div>

                  {/* 4. Remaining Amount - MOST IMPORTANT */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200 shadow-lg">
                    <label className="text-sm font-semibold text-gray-600 uppercase flex items-center gap-2">
                      Số tiền còn lại phải trả <small className="text-gray-500">(tổng lương tháng - đã thanh toán)</small>
                    </label>
                    <p className="mt-3 text-3xl font-bold text-red-600 tracking-tight">
                      {formatCurrency(payroll.remainingAmount)}
                    </p>
                  </div>

                  {/* 5. Advance Note - Below Remaining Amount - EDITABLE */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Xin ứng lương (Ghi chú)
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={advanceNote}
                        onChange={(e) => setAdvanceNote(Number(e.target.value))}
                        className="flex-1 px-4 py-2 text-lg font-semibold border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                        disabled={!canEdit || isEditingAdvance}
                      />
                      {canEdit && (
                        <button
                          onClick={handleSaveAdvanceNote}
                          disabled={isEditingAdvance || advanceNote === (payroll?.advanceTotal || 0)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {isEditingAdvance ? "Đang lưu..." : "Lưu"}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      ⓘ Đây chỉ là ghi chú về số tiền xin ứng, không ảnh hưởng đến tính lương
                    </p>
                  </div>
                </>
              )}

              {/* Tab Content - Payment History Tab */}
              {activeTab === 'history' && (
                <div className="min-h-[400px]">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Đợt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày thanh toán
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                  Đợt {payment.installmentNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(payment.paymentDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">Chưa có lịch sử thanh toán</p>
                      <p className="text-sm mt-1">Các khoản thanh toán sẽ được hiển thị tại đây</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Salary Calculation Formulas */}

        </div>
        <div className="bg-white rounded-lg shadow p-6 w-full">
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
                Phân công tạm thời - Tăng ca
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
                <span className="text-yellow-600"> - Bảo hiểm</span>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                ⓘ Lưu ý: Xin ứng lương chỉ là ghi chú, không trừ vào công thức tính lương
              </p>
            </div>
          </div>
        </div>
        {/* Update Modal */}
        {payroll && canEdit && (
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
        {canMarkPaid && (
          <PayrollPaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            payroll={payroll}
            onSuccess={() => {
              toast.success("Đã cập nhật thanh toán thành công!");
              loadPayroll({});
            }}
          />
        )}

        {/* Edit Attendance Modal */}
        {canEditAttendance && (
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
        )}

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
            onEditAttendance={canEditAttendance ? handleEditAttendance : undefined}
            onAsyncStart={(message) =>
              showOverlay(message || "Đang cập nhật phụ cấp...")
            }
            onAsyncEnd={hideOverlay}
          />
        </div>
      </div>
    </div>);
}
