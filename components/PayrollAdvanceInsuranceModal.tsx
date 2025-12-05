"use client";
import { useState, useEffect } from "react";
import payrollService, { Payroll } from "@/services/payrollService";
import toast from "react-hot-toast";

interface PayrollAdvanceInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | number;
  employeeName: string;
  onSuccess?: () => void;
}

type ModalMode = "select-month" | "view-payroll" | "add-advance" | "add-insurance" | "confirm-create";

export default function PayrollAdvanceInsuranceModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}: PayrollAdvanceInsuranceModalProps) {
  const [mode, setMode] = useState<ModalMode>("select-month");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [actionType, setActionType] = useState<"advance" | "insurance">("advance");

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    if (!isOpen) {
      // Reset modal
      setMode("select-month");
      setAdvanceAmount(0);
      setInsuranceAmount(0);
      setPayroll(null);
    }
  }, [isOpen]);

  const handleSelectMonth = async () => {
    try {
      setIsLoading(true);
      // Get payroll for this employee in the selected month/year
      const response = await payrollService.getPayrolls({
        month: selectedMonth,
        year: selectedYear,
        page: 0,
        pageSize: 100,
      });

      const employeePayroll = response.content?.find(
        (p) => Number(p.employeeId) === Number(employeeId)
      );

      if (employeePayroll) {
        // Payroll exists - show it
        setPayroll(employeePayroll);
        setAdvanceAmount(employeePayroll.advanceTotal || 0);
        setInsuranceAmount(employeePayroll.insuranceTotal || 0);
        setMode("view-payroll");
      } else {
        // Payroll doesn't exist - ask user if they want to create it
        setPayroll(null);
        setAdvanceAmount(0);
        setInsuranceAmount(0);
        setMode("confirm-create");
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
      toast.error("Không thể lấy thông tin bảng lương");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePayroll = async (advanceSalary?: number, insuranceAmount?: number) => {
    try {
      setIsLoading(true);
      const createData = {
        employeeId: Number(employeeId),
        month: selectedMonth,
        year: selectedYear,
        advanceSalary: advanceSalary || undefined,
        insuranceAmount: insuranceAmount || undefined,
      };

      const response = await payrollService.calculatePayroll(createData);
      setPayroll(response);
      setAdvanceAmount(response.advanceTotal || 0);
      setInsuranceAmount(response.insuranceTotal || 0);
      toast.success("Tạo bảng lương thành công");
      setMode("view-payroll");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating payroll:", error);
      toast.error(error.message || "Không thể tạo bảng lương");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdvance = async () => {
    if (!payroll) return;

    try {
      setIsLoading(true);
      // Update payroll with new advance amount (cumulative)
      const response = await payrollService.recalculatePayroll(payroll.id, {
        advanceTotal: advanceAmount,
        insuranceTotal: insuranceAmount,
      });

      setPayroll(response);
      toast.success("Cập nhật tiền ứng lương thành công");
      setMode("view-payroll");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating advance:", error);
      toast.error(error.message || "Không thể cập nhật tiền ứng lương");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInsurance = async () => {
    if (!payroll) return;

    try {
      setIsLoading(true);
      // Update payroll with new insurance amount (cumulative)
      const response = await payrollService.recalculatePayroll(payroll.id, {
        insuranceTotal: insuranceAmount,
        
      });

      setPayroll(response);
      toast.success("Cập nhật bảo hiểm thành công");
      setMode("view-payroll");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating insurance:", error);
      toast.error(error.message || "Không thể cập nhật bảo hiểm");
    } finally {
      setIsLoading(false);
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
    <div className="fixed inset-0 bg-[rgba(58,58,58,0.5)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Select Month Mode */}
        {mode === "select-month" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Quản lý tiền ứng / Bảo hiểm
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nhân viên: <span className="font-semibold">{employeeName}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tháng
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  Sẽ kiểm tra bảng lương tháng {selectedMonth}/{selectedYear}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleSelectMonth}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
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
                {isLoading ? "Đang kiểm tra..." : "Tiếp tục"}
              </button>
            </div>
          </>
        )}

        {/* View Payroll Mode */}
        {mode === "view-payroll" && payroll && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bảng lương tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {employeeName}
            </p>

            <div className="space-y-4 mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lương cuối:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(payroll.finalSalary)}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiền ứng:</span>
                  <span className="text-base font-semibold text-red-600">
                    {formatCurrency(advanceAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bảo hiểm:</span>
                  <span className="text-base font-semibold text-orange-600">
                    {formatCurrency(insuranceAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <button
                onClick={() => {
                  setActionType("advance");
                  setMode("add-advance");
                }}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium"
              >
                {advanceAmount > 0 ? "Cộng dồn tiền ứng" : "Thêm tiền ứng"}
              </button>
              <button
                onClick={() => {
                  setActionType("insurance");
                  setMode("add-insurance");
                }}
                className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 border border-orange-200 text-sm font-medium"
              >
                {insuranceAmount > 0 ? "Cộng dồn bảo hiểm" : "Thêm bảo hiểm"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("select-month")}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Quay lại
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </>
        )}

        {/* Add Advance Mode */}
        {mode === "add-advance" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {advanceAmount > 0 ? "Cộng dồn tiền ứng" : "Thêm tiền ứng"}
            </h3>

            {advanceAmount > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Tiền ứng hiện tại: <span className="font-semibold">{formatCurrency(advanceAmount)}</span>
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền ứng (VNĐ)
              </label>
              <input
                type="number"
                value={advanceAmount || ""}
                onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="any"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("view-payroll")}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateAdvance}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
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
                {isLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </>
        )}

        {/* Add Insurance Mode */}
        {mode === "add-insurance" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {insuranceAmount > 0 ? "Cộng dồn bảo hiểm" : "Thêm bảo hiểm"}
            </h3>

            {insuranceAmount > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Bảo hiểm hiện tại: <span className="font-semibold">{formatCurrency(insuranceAmount)}</span>
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền bảo hiểm (VNĐ)
              </label>
              <input
                type="number"
                value={insuranceAmount || ""}
                onChange={(e) => setInsuranceAmount(Number(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="any"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("view-payroll")}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateInsurance}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
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
                      d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </>
        )}

        {/* Confirm Create Mode */}
        {mode === "confirm-create" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Tạo bảng lương mới
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  Chưa có bảng lương cho <span className="font-semibold">{employeeName}</span> tháng {selectedMonth}/{selectedYear}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-3">
                  Bạn có muốn tạo bảng lương mới? Bạn cũng có thể thêm tiền ứng hoặc bảo hiểm ngay bây giờ nếu muốn.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tiền ứng lương (tùy chọn)
                </label>
                <input
                  type="number"
                  value={advanceAmount || ""}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="any"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bảo hiểm (tùy chọn)
                </label>
                <input
                  type="number"
                  value={insuranceAmount || ""}
                  onChange={(e) => setInsuranceAmount(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="any"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("select-month")}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCreatePayroll(advanceAmount || undefined, insuranceAmount || undefined)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
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
                {isLoading ? "Đang tạo..." : "Tạo bảng lương"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
