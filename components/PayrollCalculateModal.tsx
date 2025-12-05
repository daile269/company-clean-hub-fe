"use client";
import { useState } from "react";
import payrollService, { PayrollCalculateRequest } from "@/services/payrollService";
import { toast } from "react-hot-toast";

interface PayrollCalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: any[];
}

export default function PayrollCalculateModal({
  isOpen,
  onClose,
  onSuccess,
  employees,
}: PayrollCalculateModalProps) {
  const [formData, setFormData] = useState<PayrollCalculateRequest>({
    employeeId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    insuranceAmount: undefined,
    advanceSalary: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    try {
      setLoading(true);
      const res = await payrollService.calculatePayroll(formData);
      console.log("Response from calculatePayroll:", res);
      toast.success("Tính lương thành công");
      setFormData({
        employeeId: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        insuranceAmount: undefined,
        advanceSalary: undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      type ApiError = {
        success: boolean;
        message: string;
        data: any;
        code: number;
      };
       toast.error((error as ApiError).message || "Đã xảy ra lỗi khi tính lương");
      console.error("Error:", error);
      } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tính lương nhân viên</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Chọn nhân viên</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 3 }, (_, i) =>
                  new Date().getFullYear() - 1 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bảo hiểm (VNĐ)
              </label>
              <input
                type="number"
                value={formData.insuranceAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    insuranceAmount: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền ứng lương (VNĐ)
              </label>
              <input
                type="number"
                value={formData.advanceSalary || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advanceSalary: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="any"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang tính..." : "Tính lương"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
