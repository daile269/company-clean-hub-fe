"use client";
import { useState, useEffect, useRef } from "react";
import { Attendance } from "@/services/attendanceService";
import attendanceService from "@/services/attendanceService";

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  attendance: Attendance | null;
    onStartLoading?: () => void;
  onStopLoading?: () => void;
  onShowToast?: (msg: string, type?: "success" | "error" | "info") => void;
}
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export default function AttendanceEditModal({
  isOpen,
  onClose,
  onSuccess,
  attendance,
  onStartLoading,
  onStopLoading,
  onShowToast
}: AttendanceEditModalProps) {
  const [formData, setFormData] = useState({
    bonus: 0,
    penalty: 0,
    supportCost: 0,
    overtimeAmount: 0,
  });

  // Refs để quản lý vị trí con trỏ khi format số
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cursorRef = useRef<{ field: string; pos: number } | null>(null);

  // Luôn format số có dấu chấm phân cách hàng nghìn, kể cả khi đang focus
  const formatInput = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('vi-VN');
  };

  const parseInput = (raw: string): number => {
    const cleaned = raw.replace(/\./g, '').replace(/[^0-9]/g, '');
    return Number(cleaned) || 0;
  };

  // Khôi phục vị trí con trỏ sau khi format thay đổi
  useEffect(() => {
    if (cursorRef.current) {
      const el = inputRefs.current[cursorRef.current.field];
      if (el) {
        el.setSelectionRange(cursorRef.current.pos, cursorRef.current.pos);
      }
      cursorRef.current = null;
    }
  }, [formData]);

  // Xử lý thay đổi input có format: giữ đúng vị trí con trỏ
  const handleFormattedChange = (
    fieldName: string,
    rawValue: string,
    inputEl: HTMLInputElement
  ) => {
    const cursorPos = inputEl.selectionStart ?? 0;
    const oldText = inputEl.value;
    // Đếm số chữ số trước vị trí con trỏ (bỏ qua dấu chấm)
    const digitsBefore = oldText.slice(0, cursorPos).replace(/\./g, '').length;
    // Thêm/xoá 1 chữ số: digitsBefore +/- 1
    const digitsDelta = rawValue.replace(/\./g, '').length - oldText.replace(/\./g, '').length;
    const targetDigits = Math.max(0, digitsBefore + digitsDelta);

    const val = parseInput(rawValue);
    const newFormatted = formatInput(val);

    // Tính vị trí con trỏ mới trong chuỗi đã format
    let newPos = 0;
    let digits = 0;
    for (let i = 0; i < newFormatted.length; i++) {
      if (newFormatted[i] !== '.') {
        if (digits >= targetDigits) break;
        digits++;
      }
      newPos = i + 1;
    }

    cursorRef.current = { field: fieldName, pos: newPos };
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  useEffect(() => {
    if (attendance) {
      setFormData({
        bonus: attendance.bonus || 0,
        penalty: attendance.penalty || 0,
        supportCost: attendance.supportCost || 0,
        overtimeAmount: attendance.overtimeAmount || 0,
      });
    }
  }, [attendance]);

  if (!isOpen || !attendance) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendance) return;

    try {
       onStartLoading?.();
      // Gửi toàn bộ object với dữ liệu cập nhật
      const updateData: Partial<Attendance> = {
        ...attendance,
        bonus: formData.bonus,
        penalty: formData.penalty,
        supportCost: formData.supportCost,
        overtimeAmount: formData.overtimeAmount,
      };
      
      console.log("Submitting update data:", updateData);
      await attendanceService.update(attendance.id.toString(), updateData);
      onShowToast?.("Cập nhật chấm công thành công!", "success");
      console.log("Update successful");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
      
    } catch (error) {
      console.error("Failed to update attendance:", error);
      onShowToast?.("Cập nhật chấm công thất bại!", "error");
    } finally {
      onStopLoading?.();
    }
  };

  const totalAmount =
    formData.bonus -
    formData.penalty +
    formData.supportCost +
    formData.overtimeAmount;

  return (
    <div className="fixed inset-0 bg-[rgba(58,58,58,0.5)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Sửa chấm công
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {new Intl.DateTimeFormat("vi-VN").format(
              new Date(attendance.date)
            )}{" "}
            - {attendance.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thưởng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thưởng (Bonus)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                name="bonus"
                ref={(el) => { inputRefs.current.bonus = el; }}
                value={formatInput(formData.bonus)}
                onChange={(e) => handleFormattedChange('bonus', e.target.value, e.target)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                đ
              </span>
            </div>
          </div>

          {/* Phạt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phạt (Penalty)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                name="penalty"
                ref={(el) => { inputRefs.current.penalty = el; }}
                value={formatInput(formData.penalty)}
                onChange={(e) => handleFormattedChange('penalty', e.target.value, e.target)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                đ
              </span>
            </div>
          </div>

          {/* Hỗ trợ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hỗ trợ (Support Cost)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                name="supportCost"
                ref={(el) => { inputRefs.current.supportCost = el; }}
                value={formatInput(formData.supportCost)}
                onChange={(e) => handleFormattedChange('supportCost', e.target.value, e.target)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                đ
              </span>
            </div>
          </div>

          {/* Tăng ca
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tăng ca (Overtime)
            </label>
            <div className="relative">
              <input
                type="number"
                name="overtimeAmount"
                value={formData.overtimeAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
                min="0"
                step="any"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                đ
              </span>
            </div>
          </div> */}

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {/* {loading && (
                <svg
                  className="animate-spin h-4 w-4"
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
              )}
              {loading ? "Đang lưu..." : "Lưu"} */}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
