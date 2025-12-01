"use client";
import { useState } from "react";
import payrollService, { PayrollUpdateRequest } from "@/services/payrollService";
import { toast } from "react-hot-toast";

interface PayrollUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payrollId: number;
  currentValues: {
    allowanceTotal: number;
    insuranceTotal: number;
    advanceTotal: number;
  };
}

export default function PayrollUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  payrollId,
  currentValues,
}: PayrollUpdateModalProps) {
  const [formData, setFormData] = useState<PayrollUpdateRequest>({
    allowanceTotal: currentValues.allowanceTotal || 0,
    insuranceTotal: currentValues.insuranceTotal || 0,
    advanceTotal: currentValues.advanceTotal || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await payrollService.recalculatePayroll(payrollId, formData);
      toast.success("Cập nhật và tính lại bảng lương thành công");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Cập nhật & Tính lại bảng lương
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hệ thống sẽ tính lại tổng lương dựa trên các giá trị mới
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng phụ cấp (VNĐ)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.allowanceTotal || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowanceTotal: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giá trị hiện tại: {formatCurrency(currentValues.allowanceTotal)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng bảo hiểm (VNĐ)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.insuranceTotal || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insuranceTotal: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giá trị hiện tại: {formatCurrency(currentValues.insuranceTotal)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ứng trước (VNĐ)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.advanceTotal || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  advanceTotal: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giá trị hiện tại: {formatCurrency(currentValues.advanceTotal)}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Lưu ý:</strong> Tổng lương sẽ được tính lại dựa trên công thức:
              <br />
              Lương = Lương cơ bản + Thưởng + Phụ cấp - Phạt - Bảo hiểm - Ứng trước
            </p>
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
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
