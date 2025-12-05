"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { employeeService } from "@/services/employeeService";
import { Employee, EmployeeType } from "@/types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(""); // Keyword được gửi đến API
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Employee>>({
    employeeCode: "",
    name: "",
    phone: "",
    username: "",
    password: "",
    address: "",
    idCard: "",
    bankAccount: "",
    bankName: "",
    roleId: 2,
    description: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [addLoading, setAddLoading] = useState(false);

  const router = useRouter();

  // Load employees from API with pagination
  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchKeyword, filterType]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchTerm);
      setCurrentPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Client-side filter by employee type only
  const filteredEmployees =
    filterType === "all"
      ? employees
      : employees.filter((emp) => emp.employeeType === filterType);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleAddEmployee = async () => {
    // Validate required fields
    if (!addForm.username || addForm.username.trim() === "") {
      toast.error("Tên đăng nhập không được để trống");
      return;
    }
    if (addForm.username.length < 3 || addForm.username.length > 50) {
      toast.error("Tên đăng nhập phải có độ dài từ 3 đến 50 ký tự");
      return;
    }
    if (!addForm.employeeCode || addForm.employeeCode.trim() === "") {
      toast.error("Mã nhân viên không được để trống");
      return;
    }
    if (addForm.employeeCode.length > 50) {
      toast.error("Mã nhân viên không được vượt quá 50 ký tự");
      return;
    }
    if (!addForm.password || addForm.password.trim() === "") {
      toast.error("Mật khẩu không được để trống");
      return;
    }
    if (addForm.password.length < 6 || addForm.password.length > 255) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!addForm.phone || addForm.phone.trim() === "") {
      toast.error("Số điện thoại không được để trống");
      return;
    }
    if (addForm.phone.length > 50) {
      toast.error("Số điện thoại không được vượt quá 50 ký tự");
      return;
    }
    if (!addForm.idCard || addForm.idCard.trim() === "") {
      toast.error("CCCD không được để trống");
      return;
    }
    if (addForm.idCard.length > 50) {
      toast.error("CCCD không được vượt quá 50 ký tự");
      return;
    }
    if (addForm.address && addForm.address.length > 255) {
      toast.error("Địa chỉ không được vượt quá 255 ký tự");
      return;
    }
    if (!addForm.name || addForm.name.trim() === "") {
      toast.error("Tên nhân viên không được để trống");
      return;
    }
    if (addForm.name.length > 150) {
      toast.error("Tên không được vượt quá 150 ký tự");
      return;
    }

    try {
      setAddLoading(true);
      const response = await employeeService.create(addForm);
      if (response.success) {
        toast.success("Đã thêm nhân viên mới thành công");
        setShowAddModal(false);
        setAddForm({
          employeeCode: "",
          name: "",
          phone: "",
          username: "",
          password: "",
          address: "",
          idCard: "",
          bankAccount: "",
          bankName: "",
          roleId: 2,
          description: "",
        });
        // Reload employees
        loadEmployees();
      } else {
        toast.error(response.message || "Thêm nhân viên thất bại");
      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thêm nhân viên");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm nhân viên
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
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
      )}

      {!loading && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tên, mã NV, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nhân viên
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value={EmployeeType.FIXED_BY_CONTRACT}>
                    Nhân viên chính tại chỗ
                  </option>
                  <option value={EmployeeType.FIXED_BY_DAY}>
                    Nhân viên chính điều động
                  </option>
                  <option value={EmployeeType.TEMPORARY}>
                    Nhân viên thời vụ
                  </option>
                </select>
              </div> */}

              {/* <div className="flex items-end">
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Xuất Excel
                </button>
              </div> */}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng nhân viên</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalElements}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Nhân viên chính tại chỗ{" "}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      employees.filter(
                        (e) => e.employeeType === EmployeeType.FIXED_BY_CONTRACT
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Nhân viên chính điều động
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      employees.filter(
                        (e) => e.employeeType === EmployeeType.FIXED_BY_DAY
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nhân viên thời vụ</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      employees.filter(
                        (e) => e.employeeType === EmployeeType.TEMPORARY
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã NV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ và tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CCCD

                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lương
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/employees/${employee.id}`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.employeeCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {employee.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.idCard}
                      </td>  
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.status === "ACTIVE"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.monthlySalary
                          ? formatCurrency(employee.monthlySalary) + "/tháng"
                          : employee.dailySalary
                          ? formatCurrency(employee.dailySalary) + "/ngày"
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.updatedAt
                          ? formatDate(employee.updatedAt)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Không tìm thấy nhân viên
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {currentPage * pageSize + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">{totalElements}</span> nhân
                      viên
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Trước</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i;
                          } else if (currentPage < 3) {
                            pageNum = i;
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1)
                          )
                        }
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Sau</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thêm nhân viên mới
                  </h2>
                  <button
                    onClick={() => {
                      if (!addLoading) setShowAddModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={addLoading}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã nhân viên *
                    </label>
                    <input
                      type="text"
                      value={addForm.employeeCode}
                      onChange={(e) =>
                        setAddForm({ ...addForm, employeeCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: NV001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CCCD *
                    </label>
                    <input
                      type="text"
                      value={addForm.idCard}
                      onChange={(e) =>
                        setAddForm({ ...addForm, idCard: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số CCCD"
                    />
                  </div>

                  {/* Email removed per request */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      value={addForm.username || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tên đăng nhập"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={addForm.password || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mật khẩu"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      value={addForm.address}
                      onChange={(e) =>
                        setAddForm({ ...addForm, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      value={addForm.bankAccount || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, bankAccount: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số tài khoản ngân hàng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngân hàng
                    </label>
                    <input
                      type="text"
                      value={addForm.bankName || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, bankName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: VietBank"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={addForm.description || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ghi chú thêm về nhân viên..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      if (!addLoading) setShowAddModal(false);
                    }}
                    disabled={addLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    disabled={addLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? (
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
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Thêm nhân viên
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
