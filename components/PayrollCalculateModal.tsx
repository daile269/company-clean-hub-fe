"use client";
import { useState, useEffect } from "react";
import payrollService, { PayrollCalculateRequest } from "@/services/payrollService";
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
  const [formData, setFormData] = useState<PayrollCalculateRequest>({
    employeeId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    insuranceAmount: undefined,
    advanceSalary: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Load employees on modal open or when search/page changes
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, currentPage, searchKeyword]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchTerm);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setEmployeesLoading(false);
    }
  };

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
      setSelectedEmployee(null);
      setSearchTerm("");
      setSearchKeyword("");
      setCurrentPage(0);
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

  const handleSelectEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      ...formData,
      employeeId: employee.id,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tính lương nhân viên</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Employee Selection with Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhân viên <span className="text-red-500">*</span>
              </label>
              
              {/* Search Input */}
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã nhân viên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />

              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Đã chọn:</span> {selectedEmployee.name} ({selectedEmployee.employeeCode})
                  </p>
                </div>
              )}

              {/* Employees List */}
              <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                {employeesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-600"
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
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Không tìm thấy nhân viên</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                          selectedEmployee?.id === emp.id
                            ? "bg-blue-100 border-l-4 border-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-500">
                              Mã: {emp.employeeCode} | SĐT: {emp.phone || "N/A"}
                            </p>
                          </div>
                          {selectedEmployee?.id === emp.id && (
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                  <p>
                    Hiển thị {currentPage * pageSize + 1} đến{" "}
                    {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages - 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
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

            {/* Insurance & Advance Salary */}
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
          </form>
        </div>

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
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang tính..." : "Tính lương"}
          </button>
        </div>
      </div>
    </div>
  );
}