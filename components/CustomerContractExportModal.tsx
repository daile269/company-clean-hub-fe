"use client";
import { useState } from "react";
import { customerService } from "@/services/customerService";
import { toast } from "react-hot-toast";

interface CustomerContractExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerContractExportModal({
  isOpen,
  onClose,
}: CustomerContractExportModalProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await customerService.exportCustomersWithContractsToExcel();
      toast.success("Xuất file Excel thành công");
      onClose();
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Không thể xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Xuất danh sách khách hàng & hợp đồng
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Nội dung file Excel:</span>
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>STT</li>
              <li>Khách hàng (merge)</li>
              <li>Địa chỉ (merge)</li>
              <li>Mã số thuế (merge)</li>
              <li>Email (merge)</li>
              <li>Mã hợp đồng</li>
              <li>Ngày ký hợp đồng</li>
              <li>Ngày hết hạn</li>
              <li>Ngày làm việc</li>
              <li>Giá trị hợp đồng</li>
              <li>Số ngày làm</li>
              <li>Thuế VAT</li>
              <li>Tổng giá trị</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              * Khách hàng có nhiều hợp đồng sẽ được merge trên các cột khách hàng, địa chỉ, mã số thuế, email
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
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
                Đang xuất...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Xuất Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
