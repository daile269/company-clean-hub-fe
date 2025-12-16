"use client";
import { useState, useEffect } from "react";
import payrollService from "@/services/payrollService";
import { employeeService } from "@/services/employeeService";
import { toast } from "react-hot-toast";

interface PayrollCalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayrollCalculateModal({
  isOpen,
  onClose,
  onSuccess,
}: PayrollCalculateModalProps) {
  const [mode, setMode] = useState<"all" | "single">("all"); // Toggle mode
  const [formData, setFormData] = useState<{
    employeeId?: number;
    month: number;
    year: number;
    insuranceAmount?: number;
    advanceSalary?: number;
  }>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);

  // Employee selection states
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Load employees when in single mode
  useEffect(() => {
    if (isOpen && mode === "single") {
      loadEmployees();
    }
  }, [isOpen, mode, currentPage, searchKeyword]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchTerm);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load existing payroll data when employee selected
  useEffect(() => {
    if (selectedEmployee && formData.month && formData.year) {
      loadExistingPayroll();
    }
  }, [selectedEmployee, formData.month, formData.year]);

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await employeeService.getAll({
        keyword: searchKeyword,
        page: currentPage,
        pageSize: pageSize,
      });
      setEmployees(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadExistingPayroll = async () => {
    if (!selectedEmployee) return;

    try {
      // Try to get existing payroll to pre-fill insurance & advance
      const response = await payrollService.getPayrolls({
        keyword: selectedEmployee.employeeCode,
        month: formData.month,
        year: formData.year,
        page: 0,
        pageSize: 1,
      });

      if (response.content && response.content.length > 0) {
        const existingPayroll = response.content[0];
        setFormData(prev => ({
          ...prev,
          insuranceAmount: existingPayroll.insuranceTotal || undefined,
          advanceSalary: existingPayroll.advanceTotal || undefined,
        }));
      } else {
        // No existing, clear fields
        setFormData(prev => ({
          ...prev,
          insuranceAmount: undefined,
          advanceSalary: undefined,
        }));
      }
    } catch (error) {
      console.error("Error loading existing payroll:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "single" && !formData.employeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    try {
      setLoading(true);
      const payload = mode === "all"
        ? { month: formData.month, year: formData.year } // Bulk - no employeeId
        : formData; // Single - include employeeId, insurance, advance

      const res = await payrollService.calculatePayroll(payload);
      console.log("Response from calculatePayroll:", res);

      if (mode === "all") {
        const employeeCount = res.length > 0 ? Math.ceil(res.length / 2) : 0;
        toast.success(`Đã tính lương cho ${employeeCount} nhân viên`);
      } else {
        toast.success("Tính lương thành công");
      }

      // Reset form
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      setSelectedEmployee(null);
      setSearchTerm("");
      setMode("all");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi tính lương");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tính lương</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế độ tính lương
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setMode("all");
                  setSelectedEmployee(null);
                  setFormData(prev => ({
                    month: prev.month,
                    year: prev.year,
                  }));
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${mode === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700"
                  }`}
              >
                <div className="font-medium">Tất cả nhân viên</div>
                <div className="text-xs mt-1">Tính lương cho toàn bộ nhân viên</div>
              </button>
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${mode === "single"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700"
                  }`}
              >
                <div className="font-medium">1 nhân viên</div>
                <div className="text-xs mt-1">Tính lương cho nhân viên cụ thể</div>
              </button>
            </div>
          </div>

          {/* Month & Year */}
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

          {/* Single Employee Mode */}
          {mode === "single" && (
            <>
              {/* Employee Search & Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {selectedEmployee && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{selectedEmployee.name}</div>
                      <div className="text-sm text-gray-600">Mã: {selectedEmployee.employeeCode}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setFormData(prev => ({ ...prev, employeeId: undefined }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {!selectedEmployee && (
                  <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {employeesLoading ? (
                      <div className="p-4 text-center text-gray-500">Đang tải...</div>
                    ) : employees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Không tìm thấy nhân viên</div>
                    ) : (
                      employees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleSelectEmployee(emp)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-600">Mã: {emp.employeeCode}</div>
                        </button>
                      ))
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-2 border-t border-gray-200 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                        >
                          Trước
                        </button>
                        <span className="text-sm text-gray-600">
                          Trang {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage >= totalPages - 1}
                          className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Insurance & Advance (only for single mode) */}
              {selectedEmployee && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bảo hiểm
                    </label>
                    <input
                      type="number"
                      placeholder="Nhập số tiền bảo hiểm"
                      value={formData.insuranceAmount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          insuranceAmount: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền ứng lương
                    </label>
                    <input
                      type="number"
                      placeholder="Nhập tiền ứng"
                      value={formData.advanceSalary || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          advanceSalary: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info Note */}
          {mode === "all" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Hệ thống sẽ tính lương cho toàn bộ nhân viên có công làm trong tháng này.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (mode === "single" && !selectedEmployee)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tính..." : "Tính lương"}
          </button>
        </div>
      </div>
    </div>
  );
}