"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  assignmentService,
  Assignment,
  AssignmentCreateRequest,
} from "@/services/assignmentService";

export default function AssignmentDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});

  // Load assignment data from API
  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getById(Number(id!));
      setAssignment(data);
    } catch (error) {
      console.error("Error loading assignment:", error);
      toast.error("Không thể tải thông tin phân công");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = () => {
    setEditForm({ ...assignment });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !assignment) return;

    try {
      const updateData: Partial<AssignmentCreateRequest> = {
        startDate: editForm.startDate,
        status: editForm.status,
        salaryAtTime: editForm.salaryAtTime,
        workingDaysPerWeek: editForm.workingDaysPerWeek,
        additionalAllowance: editForm.additionalAllowance,
        description: editForm.description,
      };

      const response = await assignmentService.update(
        assignment.id,
        updateData
      );

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
    if (!assignment) return;

    if (confirm("Bạn có chắc chắn muốn xóa phân công này?")) {
      try {
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
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
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
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10"
              />
            </svg>
            Xóa
          </button>
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
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <p className="text-sm text-gray-900">
                  {assignment.assignmentType === "TEMPORARY"
                          ? "Thay thế tạm thời"
                          : assignment.assignmentType === "REGULAR"
                          ? "Cố định"
                          : "N/A"}
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
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
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

            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">
                Lương tại thời điểm phân công
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(assignment.salaryAtTime)}
              </p>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">
                Tổng thu nhập dự kiến
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  assignment.salaryAtTime * (assignment.workDays / 30)
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Tính theo: Lương × Số ngày / 30)
              </p>
            </div>
          </div>
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
                      ? formatDateInput(editForm.startDate)
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
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="COMPLETED">Hoàn thành</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lương (VND) *
                </label>
                <input
                  type="number"
                  value={editForm.salaryAtTime || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      salaryAtTime: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
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
    </div>
  );
}
