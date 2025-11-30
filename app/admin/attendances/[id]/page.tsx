"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import attendanceService, { Attendance } from "@/services/attendanceService";
import toast, { Toaster } from "react-hot-toast";

export default function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Attendance>>({});

  useEffect(() => {
    loadAttendance();
  }, [id]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getById(id);
      setAttendance(data);
      setEditForm(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Không thể tải thông tin chấm công");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm) return;

    try {
      await attendanceService.update(id, editForm);
      toast.success("Cập nhật chấm công thành công");
      setShowEditModal(false);
      loadAttendance();
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi chấm công này?")) return;

    try {
      await attendanceService.delete(id);
      toast.success("Xóa chấm công thành công");
      router.push("/admin/attendances");
    } catch (error: any) {
      console.error("Error deleting attendance:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Không tìm thấy thông tin chấm công
        </h3>
      </div>
    );
  }

  // Calculate total amount
  const totalAmount = 
    (attendance.bonus || 0) + 
    (attendance.supportCost || 0) + 
    (attendance.overtimeAmount || 0) - 
    (attendance.penalty || 0);

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/attendances")}
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
          Quay lại danh sách
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết chấm công
            </h1>
            <p className="mt-2 text-gray-600">
              Nhân viên: {attendance.employeeName} ({attendance.employeeCode})
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
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
              Chỉnh sửa
            </button>
            <button
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
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Mã nhân viên
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {attendance.employeeCode}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Tên nhân viên
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {attendance.employeeName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Khách hàng
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {attendance.customerName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Ngày</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(attendance.date)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Giờ công
              </label>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {attendance.workHours}h
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Tăng ca
              </label>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    attendance.isOvertime
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {attendance.isOvertime ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin tài chính
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Thưởng
              </label>
              <p className="mt-1 text-lg font-semibold text-green-600">
                {formatCurrency(attendance.bonus || 0)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Phạt
              </label>
              <p className="mt-1 text-lg font-semibold text-red-600">
                {formatCurrency(attendance.penalty || 0)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Hỗ trợ chi phí
              </label>
              <p className="mt-1 text-lg font-semibold text-purple-600">
                {formatCurrency(attendance.supportCost || 0)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Tiền tăng ca
              </label>
              <p className="mt-1 text-lg font-semibold text-orange-600">
                {formatCurrency(attendance.overtimeAmount || 0)}
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-500">
                Tổng cộng
              </label>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                = Thưởng + Hỗ trợ + Tăng ca - Phạt
              </p>
            </div>
          </div>
        </div>

        {/* Description & Metadata Card */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin bổ sung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">
                Mô tả
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {attendance.description || "Không có mô tả"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Người duyệt
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {attendance.approvedByName || "Chưa duyệt"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                #{attendance.id}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Ngày tạo
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDateTime(attendance.createdAt)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Cập nhật lần cuối
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDateTime(attendance.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa chấm công
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
                  Ngày
                </label>
                <input
                  type="date"
                  value={editForm.date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ công (giờ)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editForm.workHours || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      workHours: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thưởng (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.bonus || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bonus: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phạt (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.penalty || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      penalty: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hỗ trợ chi phí (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.supportCost || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      supportCost: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tăng ca
                </label>
                <select
                  value={editForm.isOvertime ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      isOvertime: e.target.value === "true",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="false">Không</option>
                  <option value="true">Có</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền tăng ca (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.overtimeAmount || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      overtimeAmount: Number(e.target.value),
                    })
                  }
                  disabled={!editForm.isOvertime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                  placeholder="Ghi chú về chấm công..."
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
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
