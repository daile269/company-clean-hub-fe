"use client";
import { useState } from "react";
import { employeeService } from "@/services/employeeService";
import { toast } from "react-hot-toast";

interface EmployeeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentType?: string;
}

export default function EmployeeExportModal({
  isOpen,
  onClose,
  employmentType,
}: EmployeeExportModalProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await employeeService.exportEmployeesToExcel(employmentType);
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
            Xuất danh sách nhân viên
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Nội dung file Excel:</span>
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>STT</li>
              <li>Mã nhân viên</li>
              <li>Tên</li>
              <li>Tên đăng nhập</li>
              <li>Email</li>
              <li>Số điện thoại</li>
              <li>Địa chỉ</li>
              <li>CCCD</li>
              <li>Tài khoản ngân hàng</li>
              <li>Ngân hàng</li>
              <li>Vai trò</li>
              <li>Loại nhân viên</li>
              <li>Mô tả</li>
              <li>Ngày tạo</li>
              <li>Cập nhật lần cuối</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              * File sẽ chứa đầy đủ thông tin nhân viên và thông tin tài khoản người dùng
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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
