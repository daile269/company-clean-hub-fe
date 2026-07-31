"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { employeeService } from "@/services/employeeService";
import { Employee, EmployeeType } from "@/types";
import EmployeeExportModal from "@/components/EmployeeExportModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcons from "@fortawesome/free-solid-svg-icons";
import { usePermission } from "@/hooks/usePermission";
import BankSelect from "@/components/BankSelect";
import SearchSelect from "@/components/SearchSelect";
import {
  VIETNAM_PROVINCES,
  formatLocationAddress,
  parseLocationAddress,
} from "@/utils/vietnamLocations";

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Khởi tạo state từ query trên URL (giúp quay lại vẫn giữ filter + page)
  const initialSearch = searchParams.get("keyword") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "0");
  const initialPageSize = Number(searchParams.get("pageSize") ?? "10");
  const initialFilterType = searchParams.get("filterType") ?? "all";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Permission checks
  const canView = usePermission("EMPLOYEE_VIEW");
  const canCreate = usePermission("EMPLOYEE_CREATE");

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch); // Keyword được gửi đến API
  const [filterType, setFilterType] = useState<string>(initialFilterType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
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
    monthlyAdvanceLimit: 0,
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [addLoading, setAddLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string>("");
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string>("");
  const [addProvince, setAddProvince] = useState<string>("");
  const [addWard, setAddWard] = useState<string>("");
  const [addDetailAddress, setAddDetailAddress] = useState<string>("");
  const [errorAlertMessage, setErrorAlertMessage] = useState<string>("");

  const handleCccdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCccdFrontFile(file);
      setCccdFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleCccdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCccdBackFile(file);
      setCccdBackPreview(URL.createObjectURL(file));
    }
  };
  // Load employees from API with pagination
  useEffect(() => {
    loadEmployees();
  }, [currentPage, pageSize, searchKeyword, filterType]);

  const initializedRef = useRef(false);

  // Mảng dependencies để sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("keyword", searchKeyword);
    params.set("page", currentPage.toString());
    params.set("pageSize", pageSize.toString());
    if (filterType && filterType !== "all")
      params.set("filterType", filterType);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [searchKeyword, currentPage, pageSize, filterType, pathname, router]);

  // Debounce search input
  const searchEffectFirstRunRef = useRef(true);
  useEffect(() => {
    if (searchEffectFirstRunRef.current) {
      searchEffectFirstRunRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setSearchKeyword(searchTerm);
      setCurrentPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadEmployees = async (overrides?: {
    page?: number;
    pageSize?: number;
  }) => {
    const p = overrides?.page ?? currentPage;
    const ps = overrides?.pageSize ?? pageSize;
    try {
      setLoading(true);
      console.debug("Loading employees with", {
        keyword: searchKeyword,
        page: p,
        pageSize: ps,
      });
      const response = await employeeService.getAll({
        keyword: searchKeyword,
        page: p,
        pageSize: ps,
        employmentType: "CONTRACT_STAFF",
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

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setGeneratingCode(true);
    setCccdFrontFile(null);
    setCccdFrontPreview("");
    setCccdBackFile(null);
    setCccdBackPreview("");
    setAddProvince("");
    setAddWard("");
    setAddDetailAddress("");
    try {
      const code = await employeeService.generateEmployeeCode("CONTRACT_STAFF");
      setAddForm({
        ...addForm,
        employeeCode: code,
        address: "",
      });
    } catch (error) {
      console.error("Error generating employee code:", error);
      toast.error("Không thể tạo mã nhân viên tự động");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleAddEmployee = async () => {
    // Validate required fields: SĐT, Mật khẩu, Họ tên, Chỗ ở hiện tại, Ảnh CCCD (Mặt trước & Mặt sau)
    if (!addForm.phone || addForm.phone.trim() === "") {
      toast.error("Số điện thoại không được để trống");
      return;
    }
    if (addForm.phone.length > 50) {
      toast.error("Số điện thoại không được vượt quá 50 ký tự");
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
    if (!addForm.name || addForm.name.trim() === "") {
      toast.error("Họ và tên không được để trống");
      return;
    }
    if (addForm.name.length > 150) {
      toast.error("Họ tên không được vượt quá 150 ký tự");
      return;
    }
    if (!addForm.idCard || addForm.idCard.trim() === "") {
      toast.error("Số CCCD không được để trống");
      return;
    }

    const locationAddress = formatLocationAddress(addWard, addProvince);
    const fullAddress = addDetailAddress.trim()
      ? `${addDetailAddress.trim()}, ${locationAddress}`
      : locationAddress;

    if (!fullAddress || fullAddress.trim() === "") {
      toast.error(
        "Vui lòng chọn Tỉnh/Thành phố và Phường/Xã cho chỗ ở hiện tại",
      );
      return;
    }

    if (!cccdFrontFile) {
      toast.error("Vui lòng tải lên ảnh CCCD mặt trước");
      return;
    }
    if (!cccdBackFile) {
      toast.error("Vui lòng tải lên ảnh CCCD mặt sau");
      return;
    }

    setErrorAlertMessage("");
    try {
      setAddLoading(true);
      const payload = {
        ...addForm,
        address: fullAddress,
        username: addForm.phone.trim(),
        phone: addForm.phone.trim(),
        employeeCode: addForm.employeeCode || "",
        idCard: addForm.idCard || addForm.phone.trim(),
      };

      const response = await employeeService.create(payload);
      if (response.success && response.data) {
        const newEmpId = String(response.data.id);
        if (cccdFrontFile || cccdBackFile) {
          await employeeService.uploadCccdImages(
            newEmpId,
            cccdFrontFile || undefined,
            cccdBackFile || undefined,
          );
        }
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
          monthlyAdvanceLimit: 0,
        });
        setCccdFrontFile(null);
        setCccdFrontPreview("");
        setCccdBackFile(null);
        setCccdBackPreview("");
        loadEmployees();
      } else {
        const errMsg = response.message || "Thêm nhân viên thất bại";
        toast.error(errMsg);
        setErrorAlertMessage(errMsg);
      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      const errMsg = error.message || "Có lỗi xảy ra khi thêm nhân viên";
      toast.error(errMsg);
      setErrorAlertMessage(errMsg);
    } finally {
      setAddLoading(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Bạn không có quyền xem danh sách nhân viên
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Quản lý nhân viên làm việc theo hợp đồng của khách hàng
        </h1>
        {canCreate && (
          <button
            onClick={handleOpenAddModal}
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
        )}
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
          </div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tên, mã NV, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end md:justify-end">
                <button
                  className="inline-flex items-center gap-2 px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  title="Xuất Excel"
                  onClick={() => setShowExportModal(true)}
                >
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
                      d="M12 3v12m0 0l-3-3m3 3l3-3M21 21H3"
                    />
                  </svg>
                  Xuất danh sách nhân viên
                </button>
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
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
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
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.updatedAt
                          ? employee.updatedAt instanceof Date
                            ? employee.updatedAt.toLocaleDateString("vi-VN")
                            : employee.updatedAt
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
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-700">
                        Hiển thị{" "}
                        <span className="font-medium">
                          {currentPage * pageSize + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                          {Math.min(
                            (currentPage + 1) * pageSize,
                            totalElements,
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">{totalElements}</span>{" "}
                        nhân viên
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">
                        Hàng / trang
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          const ps = Number(e.target.value) || 10;
                          setPageSize(ps);
                          setCurrentPage(0);
                          loadEmployees({ page: 0, pageSize: ps });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded-md bg-white text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
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
                        },
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1),
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
          {showAddModal && canCreate && (
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

                {/* Unique Fields Note */}
                <div className="mb-4 p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5 text-blue-900 text-xs shadow-2xs">
                  <FontAwesomeIcon icon={SolidIcons.faInfoCircle} className="text-blue-500 text-sm mt-0.5 shrink-0" />
                  <div className="leading-relaxed">
                    <span className="font-semibold text-blue-950">Thông tin không được trùng lặp:</span>{" "}
                    Số điện thoại (Tên đăng nhập), Số CCCD, Số tài khoản ngân hàng và Mã nhân viên.
                  </div>
                </div>

                {/* Error Alert Panel when duplicate or server error occurs */}
                {errorAlertMessage && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 shadow-sm animate-fade-in">
                    <FontAwesomeIcon icon={SolidIcons.faExclamationTriangle} className="text-red-600 text-sm mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-red-900 mb-0.5">Phát hiện trùng lặp hoặc lỗi dữ liệu!</p>
                      <p className="text-red-700 leading-relaxed font-medium">{errorAlertMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorAlertMessage("")}
                      className="text-red-400 hover:text-red-600 text-xs p-1 transition-colors"
                      title="Đóng thông báo"
                    >
                      <FontAwesomeIcon icon={SolidIcons.faTimes} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại (Tên đăng nhập){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          phone: e.target.value,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={addForm.password || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã nhân viên (Tự động sinh)
                    </label>
                    <input
                      type="text"
                      value={addForm.employeeCode}
                      onChange={(e) =>
                        setAddForm({ ...addForm, employeeCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder={
                        generatingCode ? "Đang tạo mã..." : "VD: NV000001"
                      }
                      readOnly={generatingCode}
                    />
                  </div>

                  <div className="col-span-2 border-t pt-3 mt-1">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Chỗ ở hiện tại <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tỉnh / Thành phố <span className="text-red-500">*</span>
                        </label>
                        <SearchSelect
                          options={VIETNAM_PROVINCES.map((p) => ({ id: p.name, label: p.name }))}
                          value={addProvince}
                          onChange={(val) => {
                            setAddProvince(String(val));
                            setAddWard("");
                          }}
                          placeholder="-- Chọn Tỉnh / Thành phố --"
                          searchPlaceholder="Tìm Tỉnh / Thành phố..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Phường / Xã / Quận <span className="text-red-500">*</span>
                        </label>
                        <SearchSelect
                          options={
                            addProvince
                              ? (VIETNAM_PROVINCES.find((p) => p.name === addProvince)?.wards.map((w) => ({ id: w, label: w })) || [])
                              : []
                          }
                          value={addWard}
                          onChange={(val) => setAddWard(String(val))}
                          disabled={!addProvince}
                          placeholder="-- Chọn Phường / Xã / Quận --"
                          searchPlaceholder="Tìm Phường / Xã / Quận..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Địa chỉ chi tiết (Số nhà, tên đường... - Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={addDetailAddress}
                        onChange={(e) => setAddDetailAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="VD: Số 123 đường Nguyễn Huệ"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 border-t pt-3 mt-1">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Hình ảnh Căn cước công dân (CCCD){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mặt trước */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50 hover:bg-blue-50/50 transition-colors">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Mặt trước CCCD <span className="text-red-500">*</span>
                        </label>
                        {cccdFrontPreview ? (
                          <div className="relative w-full h-32 rounded border overflow-hidden mb-2">
                            <img
                              src={cccdFrontPreview}
                              alt="CCCD Mặt trước"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCccdFrontFile(null);
                                setCccdFrontPreview("");
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              id="cccd-front-input"
                              onChange={handleCccdFrontChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="cccd-front-input"
                              className="cursor-pointer flex flex-col items-center justify-center py-4"
                            >
                              <svg
                                className="w-7 h-7 text-blue-500 mb-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-blue-600">
                                Chọn ảnh Mặt trước
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                PNG, JPG, JPEG
                              </span>
                            </label>
                          </>
                        )}
                      </div>

                      {/* Mặt sau */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50 hover:bg-blue-50/50 transition-colors">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Mặt sau CCCD <span className="text-red-500">*</span>
                        </label>
                        {cccdBackPreview ? (
                          <div className="relative w-full h-32 rounded border overflow-hidden mb-2">
                            <img
                              src={cccdBackPreview}
                              alt="CCCD Mặt sau"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCccdBackFile(null);
                                setCccdBackPreview("");
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              id="cccd-back-input"
                              onChange={handleCccdBackChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="cccd-back-input"
                              className="cursor-pointer flex flex-col items-center justify-center py-4"
                            >
                              <svg
                                className="w-7 h-7 text-blue-500 mb-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-blue-600">
                                Chọn ảnh Mặt sau
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                PNG, JPG, JPEG
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.idCard || ""}
                      onChange={(e) =>
                        setAddForm({ ...addForm, idCard: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số CCCD (nếu có)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tài khoản ngân hàng (Tùy chọn)
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
                    <BankSelect
                      value={addForm.bankName || ""}
                      onChange={(v: string) =>
                        setAddForm({ ...addForm, bankName: v })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền xin ứng hàng tháng (VND)
                    </label>
                    <input
                      type="number"
                      value={addForm.monthlyAdvanceLimit || 0}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          monthlyAdvanceLimit: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 5000000"
                      min="0"
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

      <EmployeeExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        employmentType="CONTRACT_STAFF"
      />
    </div>
  );
}
