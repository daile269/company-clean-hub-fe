"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  assignmentService,
  Assignment,
  AssignmentCreateRequest,
} from "@/services/assignmentService";
import { authService } from "@/services/authService";
import attendanceService, {
  Attendance,
  AttendancePaginationResponse,
} from "@/services/attendanceService";
import contractService from "@/services/contractService";
import { usePermission } from "@/hooks/usePermission";

export default function AssignmentDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const role = authService.getUserRole();
  // Permission checks
  const canView = usePermission("ASSIGNMENT_VIEW");
  const canEdit = usePermission("ASSIGNMENT_UPDATE");
  const canDelete = usePermission("ASSIGNMENT_DELETE");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateForm, setTerminateForm] = useState<{
    endDate: string;
    reason: string;
  }>({ endDate: "", reason: "" });
  // Attendances (work days) states
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);
  const [attMonth, setAttMonth] = useState<number>(new Date().getMonth() + 1);
  const [attYear, setAttYear] = useState<number>(new Date().getFullYear());
  const [attPage, setAttPage] = useState<number>(0);
  const [attPageSize] = useState<number>(20);
  const [attTotalPages, setAttTotalPages] = useState<number>(0);
  const [attTotalElements, setAttTotalElements] = useState<number>(0);

  // Load assignment data from API
  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  useEffect(() => {
    if (assignment && assignment.id) {
      loadAttendances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, attMonth, attYear, attPage]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getById(Number(id!));
      setAssignment(data);
      // fetch contract details related to this assignment (if backend exposes that endpoint)
      if (data && data.id !== undefined && data.id !== null) {
        try {
          await loadContractDetails(data.id);
        } catch (err) {
          // non-fatal: keep assignment loaded even if contract details fail
          console.warn(
            "Failed to load contract details for assignment",
            data.id,
            err
          );
        }
      } else {
        // ensure contractDetails is cleared when no assignment id available
        setContractDetails(null);
      }
    } catch (error) {
      console.error("Error loading assignment:", error);
      toast.error("Không thể tải thông tin phân công");
    } finally {
      setLoading(false);
    }
  };

  const loadContractDetails = async (assignmentId: number) => {
    try {
      const data = await contractService.getByAssignmentId(assignmentId);
      setContractDetails(data);
    } catch (err) {
      console.error("Error fetching contract details via service:", err);
      setContractDetails(null);
    }
  };

  const loadAttendances = async () => {
    if (!assignment || !assignment.id) return;
    try {
      setLoadingAttendances(true);
      const res: AttendancePaginationResponse =
        await attendanceService.getByAssignmentId(assignment.id, {
          month: attMonth,
          year: attYear,
          page: attPage,
          pageSize: attPageSize,
        });
      setAttendances(res.content || []);
      setAttTotalElements(res.totalElements || 0);
      setAttTotalPages(res.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading attendances:", error);
      toast.error(error.message || "Không thể tải danh sách ngày làm việc");
      setAttendances([]);
      setAttTotalElements(0);
      setAttTotalPages(0);
    } finally {
      setLoadingAttendances(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <p className="text-lg text-gray-600">
          Bạn không có quyền xem thông tin phân công
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">
          Không tìm thấy thông tin phân công
        </h1>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  const formatDateInput = (date: string) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const parseFormattedNumber = (str: string) => {
    return String(str).replace(/[,.]/g, "");
  };

  const formatNumber = (num: number | string) => {
    if (!num && num !== 0) return "";
    const rawValue =
      typeof num === "string" ? parseFormattedNumber(num) : num.toString();
    return new Intl.NumberFormat("vi-VN").format(Number(rawValue));
  };

  const handleNumberInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const handleEdit = () => {
    if (!canEdit) return;
    setEditForm({
      ...assignment,
      salaryAtTime: formatNumber((assignment as any)?.salaryAtTime ?? 0) as any,
      additionalAllowance: (assignment as any)?.additionalAllowance
        ? (formatNumber((assignment as any).additionalAllowance) as any)
        : "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !assignment) return;

    try {
      // Build full payload matching backend AssignmentRequest
      const payload: Partial<AssignmentCreateRequest> & {
        previousContractId?: number;
      } = {
        employeeId: editForm.employeeId ?? assignment.employeeId,
        contractId:
          (editForm as any).contractId ?? (assignment as any).contractId,
        startDate: editForm.startDate ?? assignment.startDate,
        scope: (editForm as any).scope ?? (assignment as any).scope,
        status: editForm.status ?? assignment.status,
        assignmentType: editForm.assignmentType ?? assignment.assignmentType,
        salaryAtTime:
          editForm.salaryAtTime !== undefined && editForm.salaryAtTime !== null
            ? Number(parseFormattedNumber(String(editForm.salaryAtTime)))
            : undefined,
        additionalAllowance:
          editForm.additionalAllowance !== undefined &&
          editForm.additionalAllowance !== null
            ? Number(parseFormattedNumber(String(editForm.additionalAllowance)))
            : undefined,
        workingDaysPerWeek:
          (editForm as any).workingDaysPerWeek ??
          (assignment as any).workingDaysPerWeek,
        description: editForm.description ?? assignment.description,
        // include previous contract id so backend can act accordingly if needed
        previousContractId: (assignment as any).contractId ?? undefined,
      };

      const response = await assignmentService.update(assignment.id, payload);

      if (response.success) {
        toast.success("Đã cập nhật thông tin phân công thành công");
        setShowEditModal(false);
        loadAssignment();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!assignment || !canDelete) return;

    try {
      setDeleting(true);
      const response = await assignmentService.delete(assignment.id);
      if (response.success) {
        toast.success("Đã xóa phân công thành công");
        router.push("/admin/assignments");
      } else {
        toast.error(response.message || "Xóa thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    } finally {
      setDeleting(false);
    }
  };

  const handleTerminate = () => {
    if (!assignment || !canEdit) return;
    const today = new Date();
    const defaultDate = today.toISOString().split("T")[0];
    setTerminateForm({ endDate: defaultDate, reason: "" });
    setShowTerminateModal(true);
  };

  const submitTerminate = async () => {
    if (!assignment) return;
    const { endDate, reason } = terminateForm;
    if (!endDate) {
      toast.error("Vui lòng chọn ngày kết thúc");
      return;
    }

    let toastId;
    try {
      setTerminating(true);
      toastId = toast.loading("Đang gửi yêu cầu dừng phân công...");

      const response = await assignmentService.terminate(assignment.id, {
        endDate,
        reason,
      });

      if (response && response.success) {
        toast.dismiss(toastId);
        toast.success("Đã dừng phân công");
        setShowTerminateModal(false);
        await loadAssignment();
      } else {
        toast.dismiss(toastId);
        toast.error(response?.message || "Dừng phân công thất bại");
      }
    } catch (error: any) {
      if (toastId) toast.dismiss(toastId);
      console.error("Error terminating assignment:", error);
      toast.error(error?.message || "Không thể dừng phân công");
    } finally {
      setTerminating(false);
    }
  };

  const handleRollbackTerminate = async () => {
    if (!assignment || !canEdit) return;

    try {
      setRollingBack(true);
      const toastId = toast.loading("Đang hoàn tác tạm dừng phân công...");

      const response = await assignmentService.rollbackTerminate(assignment.id);

      toast.dismiss(toastId);
      setRollingBack(false);

      if (response && response.success) {
        toast.success("Đã hoàn tác tạm dừng phân công");
        await loadAssignment();
      } else {
        toast.error(response?.message || "Hoàn tác thất bại");
      }
    } catch (error: any) {
      setRollingBack(false);
      console.error("Error rollback terminate:", error);
      toast.error(error?.message || "Không thể hoàn tác");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "TERMINATED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Chưa bắt đầu";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "TERMINATED":
        return "Kết thúc giữa chừng";
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chi tiết phân công</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
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
          {canEdit && (
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4h6m-1 4L7 17l-4 1 1-4 9-9z"
                />
              </svg>
              Sửa
            </button>
          )}
          {canEdit && assignment.status !== "TERMINATED" && (
            <button
              onClick={handleTerminate}
              disabled={terminating}
              aria-busy={terminating}
              className={`px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 inline-flex items-center gap-2 ${
                terminating ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {terminating ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  Đang dừng...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Dừng phân công phụ trách
                </>
              )}
            </button>
          )}
          {canEdit && assignment.status === "TERMINATED" && (
            <button
              onClick={handleRollbackTerminate}
              disabled={rollingBack}
              aria-busy={rollingBack}
              className={`px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2 ${
                rollingBack ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {rollingBack ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  Đang hoàn tác...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  Hoàn tác tạm dừng
                </>
              )}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              aria-busy={deleting}
              className={`px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2 ${
                deleting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {deleting ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  Đang xóa...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10"
                    />
                  </svg>
                  Xóa
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Information Grid - 2 Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin phân công */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin phân công
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã phân công</p>
                <p className="text-sm font-semibold text-gray-900">
                  #{assignment.id}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    assignment.status
                  )}`}
                >
                  {getStatusLabel(assignment.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nhân viên</p>
                <p className="text-sm font-semibold text-gray-900">
                  {assignment.employeeName || `ID: ${assignment.employeeId}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {assignment.customerName || `ID: ${assignment.customerId}`}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Loại phân công</p>
              <p className="text-sm text-gray-900">
                {(() => {
                  switch (assignment.assignmentType) {
                    case "FIXED_BY_CONTRACT":
                      return "Cố định theo hợp đồng";
                    case "FIXED_BY_DAY":
                      return "Cố định theo ngày";
                    case "TEMPORARY":
                      return "Tạm thời";
                    case "FIXED_BY_COMPANY":
                      return "Làm việc tại công ty";
                    case "SUPPORT":
                      return "Hỗ trợ";
                    default:
                      return assignment.assignmentType || "N/A";
                  }
                })()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                <p className="text-sm text-gray-900">
                  {formatDate(assignment.startDate)}
                </p>
              </div>
              {assignment.endDate && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(assignment.endDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-gray-900">
                  {assignment.createdAt
                    ? formatDate(assignment.createdAt)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-900">
                  {assignment.updatedAt
                    ? formatDate(assignment.updatedAt)
                    : "N/A"}
                </p>
              </div>
            </div>

            {assignment.description && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Thông tin thêm</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {assignment.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin công việc */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin công việc & Lương
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Số ngày làm việc</p>
              <p className="text-2xl font-bold text-blue-600">
                {assignment.workDays} ngày
              </p>
            </div>
            {role !== "QLV" && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">
                  Lương tại thời điểm phân công
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(assignment.salaryAtTime)}
                </p>
              </div>
            )}
            {role !== "QLV" && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Phụ cấp thêm</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    (assignment.additionalAllowance ?? 0) as number
                  )}
                </p>
              </div>
            )}

            <div className="pt-3 border-t">
              <p className="text-xs font-semibold text-gray-900 mb-1">
                Hợp đồng
              </p>

              {((contractDetails && contractDetails.name) ||
                (assignment as any)?.contractName) && (
                <p className="text-sm text-gray-700 mt-1">
                  Tên hợp đồng:{" "}
                  {(contractDetails && contractDetails.name) ??
                    (assignment as any).contractName}
                </p>
              )}

              {((contractDetails && contractDetails.type) ||
                (assignment as any)?.contractType) && (
                <p className="text-sm text-gray-700 mt-1">
                  Loại hợp đồng:{" "}
                  {(() => {
                    const type =
                      (contractDetails && contractDetails.type) ??
                      (assignment as any).contractType;
                    switch (type) {
                      case "ONE_TIME":
                        return "Hợp đồng 1 lần (trọn gói)";
                      case "MONTHLY_FIXED":
                        return "Hợp đồng hàng tháng cố định";
                      case "MONTHLY_ACTUAL":
                        return "Hợp đồng hàng tháng theo ngày thực tế";
                      default:
                        return type || "N/A";
                    }
                  })()}
                </p>
              )}

              {((contractDetails && contractDetails.workDays !== undefined) ||
                (assignment as any)?.contractWorkDays) && (
                <p className="text-sm text-gray-700 mt-1">
                  Số ngày làm:{" "}
                  {(contractDetails && contractDetails.workDays) ??
                    (assignment as any).contractWorkDays}{" "}
                  ngày
                </p>
              )}

              {((contractDetails && contractDetails.finalPrice) ||
                (assignment as any)?.contractFinalPrice ||
                (assignment as any)?.contract?.finalPrice) && (
                <p className="text-sm text-gray-700 mt-1">
                  Giá hợp đồng:{" "}
                  {formatCurrency(
                    Number(
                      ((contractDetails && contractDetails.finalPrice) ??
                        (assignment as any).contractFinalPrice ??
                        (assignment as any).contract?.finalPrice) as number
                    )
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendances Card */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Ngày làm việc
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tháng</label>
              <select
                value={attMonth}
                onChange={(e) => {
                  setAttMonth(Number(e.target.value));
                  setAttPage(0);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <label className="text-sm text-gray-600">Năm</label>
              <select
                value={attYear}
                onChange={(e) => {
                  setAttYear(Number(e.target.value));
                  setAttPage(0);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {Array.from(
                  { length: 15 },
                  (_, i) => new Date().getFullYear() - 2 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setAttPage(0);
                  loadAttendances();
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Lọc
              </button>
            </div>
          </div>

          {loadingAttendances ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : attendances.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có ngày làm việc trong tháng này
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-2">Ngày</th>
                    <th className="py-2">Giờ làm</th>
                    <th className="py-2">Thưởng</th>
                    <th className="py-2">Phạt</th>
                    <th className="py-2">Hỗ trợ</th>
                    <th className="py-2">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="py-2">
                        {new Intl.DateTimeFormat("vi-VN").format(
                          new Date(a.date)
                        )}
                      </td>
                      <td className="py-2">{a.workHours ?? 0}</td>
                      <td className="py-2">{formatCurrency(a.bonus ?? 0)}</td>
                      <td className="py-2">{formatCurrency(a.penalty ?? 0)}</td>
                      <td className="py-2">
                        {formatCurrency(a.supportCost ?? 0)}
                      </td>
                      <td className="py-2">{a.description ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loadingAttendances && attTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Trang {attPage + 1} / {attTotalPages} (Tổng {attTotalElements})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAttPage(Math.max(0, attPage - 1))}
                  disabled={attPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setAttPage(Math.min(attTotalPages - 1, attPage + 1))
                  }
                  disabled={attPage >= attTotalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa phân công
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhân viên
                </label>
                <input
                  type="text"
                  value={editForm.employeeName || `ID: ${editForm.employeeId}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng
                </label>
                <input
                  type="text"
                  value={editForm.customerName || `ID: ${editForm.customerId}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={
                    editForm.startDate
                      ? formatDateInput(String(editForm.startDate))
                      : ""
                  }
                  onChange={(e) =>
                    setEditForm({ ...editForm, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  value={editForm.status || "IN_PROGRESS"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SCHEDULED">Chưa bắt đầu</option>
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="TERMINATED">Kết thúc giữa chừng</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số ngày làm việc *
                </label>
                <input
                  type="number"
                  value={editForm.workDays || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      workDays: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {role !== "QLV" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lương (VND) *
                  </label>
                  <input
                    type="text"
                    value={String(editForm.salaryAtTime ?? "")}
                    onChange={(e) => {
                      const raw = handleNumberInput(e.target.value);
                      setEditForm({
                        ...editForm,
                        salaryAtTime: formatNumber(raw) as any,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}{" "}
              {role !== "QLV" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phụ cấp (VND)
                  </label>
                  <input
                    type="text"
                    value={String(editForm.additionalAllowance ?? "")}
                    onChange={(e) => {
                      const raw = handleNumberInput(e.target.value);
                      setEditForm({
                        ...editForm,
                        additionalAllowance: formatNumber(raw) as any,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin thêm
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú về phân công..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="bg-white rounded-lg shadow-lg z-60 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Dừng phân công</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Ngày kết thúc</label>
                <input
                  type="date"
                  value={terminateForm.endDate}
                  onChange={(e) =>
                    setTerminateForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">
                  Lý do (tùy chọn)
                </label>
                <textarea
                  value={terminateForm.reason}
                  onChange={(e) =>
                    setTerminateForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="px-3 py-1 bg-gray-200 rounded"
                disabled={terminating}
              >
                Hủy
              </button>
              <button
                onClick={submitTerminate}
                className={`px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 ${
                  terminating ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={terminating}
              >
                {terminating ? "Đang dừng..." : "Xác nhận dừng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
