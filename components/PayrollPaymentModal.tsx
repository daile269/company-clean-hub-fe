"use client";
import { useState, useEffect } from "react";
import { Payroll } from "@/services/payrollService";

interface PayrollPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: Payroll | null;
    onSuccess: () => void;
}

export default function PayrollPaymentModal({
    isOpen,
    onClose,
    payroll,
    onSuccess,
}: PayrollPaymentModalProps) {
    const [paidAmount, setPaidAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (isOpen && payroll) {
            // Reset form when modal opens
            setPaidAmount("");
            setError("");
        }
    }, [isOpen, payroll]);

    if (!isOpen || !payroll) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const parseCurrency = (value: string): number => {
        // Remove all non-digit and non-decimal characters except comma/dot
        const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned) || 0;
        // Round to 2 decimal places to avoid floating-point precision issues
        return Math.round(parsed * 100) / 100;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPaidAmount(value);
        setError("");
    };

    const handlePayAll = () => {
        // Round to 2 decimals to match display
        const roundedAmount = Math.round(payroll.remainingAmount * 100) / 100;
        setPaidAmount(roundedAmount.toString());
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseCurrency(paidAmount);
        // Round remainingAmount for comparison to avoid floating-point errors
        const maxAmount = Math.round(payroll.remainingAmount * 100) / 100;

        // Validation
        if (amount <= 0) {
            setError("Số tiền phải lớn hơn 0");
            return;
        }

        // Use small epsilon for comparison to handle floating-point precision
        if (amount > maxAmount + 0.01) {
            setError(`Số tiền không được vượt quá số tiền còn lại (${formatCurrency(maxAmount)})`);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const payrollService = (await import("@/services/payrollService")).default;

            // Calculate total paid amount
            const totalPaid = payroll.paidAmount + amount;

            await payrollService.updatePaymentStatus(payroll.id, totalPaid);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra khi cập nhật thanh toán");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <div
                className="fixed inset-0 transition-opacity bg-[rgb(0,0,0,0.5)]"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2  2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Thanh toán lương
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white px-6 py-4">
                        {/* Employee Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Thông tin nhân viên</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Tên:</span>{" "}
                                    <span className="font-medium text-gray-900">{payroll.employeeName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Mã NV:</span>{" "}
                                    <span className="font-medium text-gray-900">{payroll.employeeCode}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tháng:</span>{" "}
                                    <span className="font-medium text-gray-900">{payroll.month}/{payroll.year}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ngày công:</span>{" "}
                                    <span className="font-medium text-gray-900">{payroll.totalDays}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="mb-6 space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tổng lương:</span>
                                <span className="font-bold text-lg text-blue-600">{formatCurrency(payroll.finalSalary)}</span>
                            </div>

                            {payroll.paidAmount > 0 && (
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm text-gray-700">Đã thanh toán:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(payroll.paidAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                                <span className="text-sm font-medium text-gray-900">Còn lại:</span>
                                <span className="font-bold text-xl text-orange-600">{formatCurrency(payroll.remainingAmount)}</span>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền thanh toán <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={paidAmount}
                                    onChange={handleAmountChange}
                                    placeholder="Nhập số tiền..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handlePayAll}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                >
                                    Trả hết
                                </button>
                            </div>
                            {paidAmount && parseCurrency(paidAmount) > 0 && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Số tiền: <span className="font-semibold text-blue-600">{formatCurrency(parseCurrency(paidAmount))}</span>
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Info box */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-yellow-700">
                                Bạn có thể thanh toán một phần hoặc toàn bộ số tiền còn lại. Trạng thái sẽ tự động cập nhật sau khi thanh toán.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !paidAmount || parseCurrency(paidAmount) <= 0}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
