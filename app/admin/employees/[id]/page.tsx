"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  mockPayrolls,
  mockAssignments,
  mockRatings,
  mockCustomers,
} from "@/lib/mockData";
import { Employee, EmployeeType } from "@/types";
import { employeeService } from "@/services/employeeService";

export default function EmployeeDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Employee | null>(null);

  // Load employee data from API
  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(id!);
      setEmployee(data);
    } catch (error) {
      console.error("Error loading employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignments = mockAssignments.filter((a) => a.employeeId === id);
  const payrolls = mockPayrolls.filter((p) => p.employeeId === id).slice(0, 6);
  const ratings = mockRatings.filter((r) => r.employeeId === id).slice(0, 6);

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

  if (!employee) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Không tìm thấy nhân viên</h1>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    // include username and an empty password field so hidden inputs exist
    setEditForm({
      ...(employee as Employee),
      username: (employee as any).username || "",
      password: (employee as any).password || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const response = await employeeService.update(editForm.id, editForm);
      if (response.success) {
        toast.success("Đã cập nhật thông tin nhân viên thành công");
        setShowEditModal(false);
        // Reload employee data
        loadEmployee();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chi tiết nhân viên</h1>
        {employee && (
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
              className="px-3 py-1 bg-[#19AD70] text-white rounded hover:bg-[#158F60] inline-flex items-center gap-2 cursor-pointer"
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
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mã nhân viên</p>
            <p className="text-sm text-gray-900">{employee.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Họ và tên</p>
            <p className="text-sm text-gray-900">{employee.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="text-sm text-gray-900">{employee.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-sm text-gray-900">{employee.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loại nhân viên</p>
            <p className="text-sm text-gray-900">
              {employee.employeeType === EmployeeType.FIXED_BY_CONTRACT
                ? "Hợp đồng cố định"
                : employee.employeeType === EmployeeType.FIXED_BY_DAY
                ? "Cố định theo ngày"
                : "Tạm thời"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lương</p>
            <p className="text-sm text-gray-900">
              {employee.monthlySalary
                ? formatCurrency(employee.monthlySalary) + "/tháng"
                : employee.dailySalary
                ? formatCurrency(employee.dailySalary) + "/ngày"
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số tài khoản</p>
            <p className="text-sm text-gray-900">
              {employee.bankAccount || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Địa chỉ</p>
            <p className="text-sm text-gray-900">{employee.address}</p>
          </div>
        </div>
      </div>
      {/* Assignments */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">
          Phân công/Đơn vị phụ trách
        </h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có phân công nào</p>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => {
              const customer = mockCustomers.find((c) => c.id === a.customerId);
              return (
                <div
                  key={a.id}
                  className="p-4 bg-white rounded shadow-sm border"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        {customer?.name || a.customerId}
                      </p>
                      <p className="text-sm text-gray-500">{a.workSchedule}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Intl.DateTimeFormat("vi-VN").format(
                        new Date(a.startDate)
                      )}
                    </div>
                  </div>
                  {a.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      Ghi chú: {a.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Payrolls */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Bảng lương gần đây</h2>
        {payrolls.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có dữ liệu bảng lương</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lương cơ bản
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày trả
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrolls.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {p.month}/{p.year}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(p.baseSalary)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {p.paidDate
                          ? new Intl.DateTimeFormat("vi-VN").format(
                              new Date(p.paidDate)
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            p.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : p.status === "ADVANCE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ratings */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Đánh giá từ khách hàng</h2>
        {ratings.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đánh giá</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      Khách hàng:{" "}
                      {mockCustomers.find((c) => c.id === r.customerId)?.name ||
                        r.customerId}
                    </div>
                    <div className="text-yellow-500">
                      {"★".repeat(r.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(r.createdAt)
                    )}
                  </div>
                </div>
                {r.feedback && (
                  <p className="mt-2 text-sm text-gray-600">{r.feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa nhân viên
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
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD *
                </label>
                <input
                  type="text"
                  value={editForm.idCard}
                  onChange={(e) =>
                    setEditForm({ ...editForm, idCard: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editForm.status || "ACTIVE"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={editForm.bankAccount || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankAccount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân hàng
                </label>
                <input
                  type="text"
                  value={editForm.bankName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: VietBank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nhân viên *
                </label>
                <select
                  value={editForm.employeeType}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      employeeType: e.target.value as EmployeeType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={EmployeeType.FIXED_BY_CONTRACT}>
                    Hợp đồng cố định
                  </option>
                  <option value={EmployeeType.FIXED_BY_DAY}>
                    Cố định theo ngày
                  </option>
                  <option value={EmployeeType.TEMPORARY}>Tạm thời</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lương cơ bản (tháng) - VNĐ
                </label>
                <input
                  type="number"
                  value={editForm.monthlySalary || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      monthlySalary: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VND"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lương ngày - VNĐ
                </label>
                <input
                  type="number"
                  value={editForm.dailySalary || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dailySalary: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VND"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bảo hiểm xã hội - VNĐ
                </label>
                <input
                  type="number"
                  value={editForm.socialInsurance || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      socialInsurance: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VND"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bảo hiểm y tế - VNĐ
                </label>
                <input
                  type="number"
                  value={editForm.healthInsurance || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      healthInsurance: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VND"
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
                  placeholder="Ghi chú thêm về nhân viên..."
                />
              </div>
              <input type="hidden" value={editForm.username || ""} />
              <input type="hidden" value={editForm.password || ""} />
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
