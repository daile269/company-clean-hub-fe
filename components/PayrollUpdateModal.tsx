"use client";
import { useEffect, useState } from "react";
import payrollService, { PayrollUpdateRequest } from "@/services/payrollService";


interface PayrollUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payrollId: number;
  currentValues: {
    insuranceTotal: number;
    advanceTotal: number;
  };
  onShowToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function PayrollUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  payrollId,
  currentValues,
  onShowToast
}: PayrollUpdateModalProps) {
  const [formData, setFormData] = useState<PayrollUpdateRequest>({
    insuranceTotal: currentValues.insuranceTotal || 0,
    advanceTotal: currentValues.advanceTotal || 0,
  });
  const [loading, setLoading] = useState(false);
  const updatePayroll = async () => {
    try {
      setLoading(true);
      await payrollService.recalculatePayroll(payrollId, formData);
      onShowToast?.("Cập nhật chấm công thành công!", "success");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      onShowToast?.("Cập nhật chấm công thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePayroll();
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(44,44,44,0.5)]  flex items-center justify-center z-50">
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
              Xin ứng lương - Ghi chú (VNĐ)
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
            <p className="text-xs text-orange-600 mt-1">
              ⓘ Chỉ là ghi chú, không ảnh hưởng đến tính lương
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Lưu ý:</strong> Tổng lương sẽ được tính lại dựa trên công thức:
              <br />
              Lương = Lương cơ bản + Thưởng + Phụ cấp - Phạt - Bảo hiểm
              <br />
              <span className="text-orange-600">(Xin ứng lương chỉ là ghi chú, không trừ vào lương)</span>
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
