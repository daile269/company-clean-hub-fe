"use client";
import { useState, useEffect } from "react";
import { Payroll } from "@/services/payrollService";
import { QRPay } from "vietnam-qr-pay";
import QRCode from 'qrcode';
import { employeeService } from "@/services/employeeService";
import { ApiEmployee, Employee } from "@/types";
import banksData from "@/utils/binBank.json";
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
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [transferContent, setTransferContent] = useState<string>("");

    useEffect(() => {
        if (isOpen && payroll) {
            // Reset form when modal opens
            setPaidAmount("");
            fetchEmployee();
            setError("");
            setTransferContent(`Tra luong ${payroll.employeeName} ${payroll.month}/${payroll.year}`);
        }
    }, [isOpen, payroll]);

    // Generate QR code when amount or transfer content changes
    useEffect(() => {
        if (paidAmount && parseCurrency(paidAmount) > 0 && employee && transferContent) {
            const qrString = buildStringQr(parseCurrency(paidAmount), employee, transferContent);
            QRCode.toDataURL(qrString, {
                width: 220,
                margin: 2,
                errorCorrectionLevel: 'H',
            }).then((url: string) => {
                setQrCodeUrl(url);
            }).catch((err: unknown) => {
                console.error('Error generating QR code:', err);
                setQrCodeUrl("");
            });
        } else {
            setQrCodeUrl("");
        }
    }, [paidAmount, employee, transferContent]);

    if (!isOpen || !payroll) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };
    const buildStringQr = (paidAmount: number, employee: Employee | null, content: string): string => {
        if (!employee) return "";
        console.log("tiền chuyển (number):", paidAmount)
        console.log("tiền chuyển (string):", paidAmount.toString())
        // Get bankBin from binBank.json by matching employee's bankName with shortName
        const bankInfo = (banksData as any).data.find(
            (bank: any) => bank.shortName === employee.bankName
        );
        const bankBin = bankInfo?.bin; // Default to Vietcombank if not found

        const qrPay = QRPay.initVietQR({
            bankBin: bankBin,
            bankNumber: employee.bankAccount || "",
            amount: Math.round(paidAmount).toString(),
            purpose: content,
        });
        return qrPay.build();
    }
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
    const fetchEmployee = () => {
        employeeService.getById(payroll.employeeId.toString()).then((response) => {
            setEmployee(response);
        });

    }
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

            {/* Modal panel - wider for 2 columns */}
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-5xl">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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

                {/* Content - 2 columns layout */}
                <form onSubmit={handleSubmit}>
                    <div className="flex">
                        {/* Left column - Form */}
                        <div className="flex-1 bg-white px-6 py-4">
                            {/* Employee Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Thông tin nhân viên</h4>
                                <div className="grid grid-cols-3 gap-3 text-sm">
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
                                    <div>
                                        <span className="text-gray-600">Số tài khoản:</span>{" "}
                                        <span className="font-medium text-gray-900">{employee?.bankAccount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngân hàng:</span>{" "}
                                        <span className="font-medium text-gray-900">{employee?.bankName}</span>
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

                        {/* Right column - QR Code */}
                        <div className="w-80 bg-gray-50 px-6 py-4 border-l border-gray-200 flex flex-col items-center justify-center">
                            {paidAmount && parseCurrency(paidAmount) > 0 ? (
                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-900 mb-4">Mã QR thanh toán</h4>

                                    {/* Transfer Content Input */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-700 mb-2 text-left">
                                            Nội dung chuyển khoản
                                        </label>
                                        <input
                                            type="text"
                                            value={transferContent}
                                            onChange={(e) => setTransferContent(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập nội dung..."
                                        />
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-md">
                                        {qrCodeUrl ? (
                                            <img
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                className="w-full h-auto"
                                            />
                                        ) : (
                                            <div className="w-[220px] h-[220px] flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">
                                        Quét mã QR để thanh toán
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Số tiền: <span className="font-semibold text-blue-600">{formatCurrency(parseCurrency(paidAmount))}</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <svg className="w-20 h-20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-sm">Nhập số tiền để tạo mã QR</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
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
