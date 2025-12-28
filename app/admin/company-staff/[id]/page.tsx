"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { mockCustomers } from "@/lib/mockData";
import { Employee } from "@/types";
import { employeeService, buildCloudinaryUrl, type EmployeeImage } from "@/services/employeeService";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { assignmentService, Assignment } from "@/services/assignmentService";
import PayrollAdvanceInsuranceModal from "@/components/PayrollAdvanceInsuranceModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import { usePermission } from '@/hooks/usePermission';
import { authService } from '@/services/authService';
export default function CompanyStaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const canManageCost = usePermission("COST_MANAGE");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const role = authService.getUserRole();
  // Format number utilities
  const formatNumber = (num: number | string) => {
    if (!num && num !== 0) return "";
    const rawValue = typeof num === 'string' ? parseFormattedNumber(num) : num.toString();
    return new Intl.NumberFormat("vi-VN").format(Number(rawValue));
  };

  const parseFormattedNumber = (str: string) => {
    return str.replace(/[,.]/g, "");
  };

  const handleNumberInput = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  // Image management states
  const [employeeImages, setEmployeeImages] = useState<EmployeeImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageManageModal, setShowImageManageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEmployeeImage, setIsUploadingEmployeeImage] = useState(false);

  // Assignment states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentPage, setAssignmentPage] = useState(0);
  const [assignmentPageSize] = useState(8);
  const [assignmentTotalPages, setAssignmentTotalPages] = useState(0);
  const [assignmentTotalElements, setAssignmentTotalElements] = useState(0);
  const [assignmentMonth, setAssignmentMonth] = useState(new Date().getMonth() + 1);
  const [assignmentYear, setAssignmentYear] = useState(new Date().getFullYear());

  // Payroll advance insurance modal
  const [showPayrollAdvanceInsuranceModal, setShowPayrollAdvanceInsuranceModal] = useState(false);

  // Work schedule assignment modal
  const [showWorkScheduleModal, setShowWorkScheduleModal] = useState(false);
  const [savingWorkSchedule, setSavingWorkSchedule] = useState(false);
  const [workScheduleForm, setWorkScheduleForm] = useState<{
    startDate: string;
    salaryAtTime: string;
    additionalAllowance: string;
    workingDaysPerWeek: string[];
    description: string;
  }>({
    startDate: new Date().toISOString().split('T')[0],
    salaryAtTime: '',
    additionalAllowance: '',
    workingDaysPerWeek: [],
    description: '',
  });

  const loadEmployee = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await employeeService.getById(id);
      if (!data) {
        // handle missing employee gracefully
        setEmployee(null);
        toast.error("Không tìm thấy nhân viên");
        return;
      }
      setEmployee(data);
      // Pre-fill work schedule form with employee salary and allowance
      setWorkScheduleForm((prev) => ({
        ...prev,
        salaryAtTime: data.monthlySalary ? formatNumber(data.monthlySalary) : "",
        additionalAllowance: data.allowance ? formatNumber(data.allowance) : "",
      }));
      // Load images
      const images = await employeeService.getEmployeeImages(id);
      setEmployeeImages(images);
    } catch (error: any) {
      console.error("Error loading employee:", error);
      toast.error(error.message || "Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!id) return;
    try {
      setLoadingAssignments(true);
      const response = await assignmentService.getByEmployeeId(id, {
        month: assignmentMonth,
        year: assignmentYear,
        page: assignmentPage,
        pageSize: assignmentPageSize,
      });
      setAssignments(response.content || []);
      setAssignmentTotalPages(response.totalPages || 0);
      setAssignmentTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error("Error loading assignments:", error);
      toast.error(error.message || "Không thể tải danh sách phân công");
      setAssignments([]);
      setAssignmentTotalPages(0);
      setAssignmentTotalElements(0);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAssignments();
    }
  }, [id, assignmentPage, assignmentMonth, assignmentYear]);

  // previous mockAssignments removed in favor of real API

  if (loading) {
    return (
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
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Không tìm thấy nhân viên</h1>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getAssignmentStatusClass = (status?: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
      case "ACTIVE":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssignmentStatusLabel = (status?: string) => {
    if (!status) return "";
    const s = status.toUpperCase();
    switch (s) {
      case "PENDING":
        return "Chờ xử lý";
      case "IN_PROGRESS":
      case "ACTIVE":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
      case "CANCELED":
        return "Đã hủy";
      default:
        // Fallback to raw status with capitalization
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const handleEdit = () => {
    // include username and an empty password field so hidden inputs exist
    setEditForm({
      ...(employee as Employee),
      username: (employee as any).username || "",
      password: (employee as any).password || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    setSavingEmployee(true);
    try {
      // Parse formatted numbers if they are strings
      const monthlySalary = typeof editForm.monthlySalary === 'string'
        ? Number(parseFormattedNumber(editForm.monthlySalary))
        : editForm.monthlySalary;
      const allowance = typeof editForm.allowance === 'string'
        ? Number(parseFormattedNumber(editForm.allowance))
        : editForm.allowance;
      const socialInsurance = typeof editForm.socialInsurance === 'string'
        ? Number(parseFormattedNumber(editForm.socialInsurance))
        : editForm.socialInsurance;

      const monthlyAdvanceLimit = typeof editForm.monthlyAdvanceLimit === 'string'
        ? Number(parseFormattedNumber(editForm.monthlyAdvanceLimit))
        : editForm.monthlyAdvanceLimit;

      const response = await employeeService.updateCompanyStaff(editForm.id, {
        ...editForm,
        monthlySalary,
        allowance,
        socialInsurance,
        monthlyAdvanceLimit,
      });
      if (response.success) {
        toast.success("Đã cập nhật thông tin nhân viên thành công");
        setShowEditModal(false);
        // Reload employee data
        loadEmployee();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleSaveWorkSchedule = async () => {
    if (!workScheduleForm.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }
    if (workScheduleForm.workingDaysPerWeek.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ngày làm việc trong tuần");
      return;
    }

    setSavingWorkSchedule(true);
    try {
      const payload = {
        employeeId: Number(id),
        startDate: workScheduleForm.startDate,
        scope: "COMPANY",
        salaryAtTime: workScheduleForm.salaryAtTime
          ? Number(parseFormattedNumber(workScheduleForm.salaryAtTime))
          : undefined,
        additionalAllowance: workScheduleForm.additionalAllowance
          ? Number(parseFormattedNumber(workScheduleForm.additionalAllowance))
          : undefined,
        workingDaysPerWeek: workScheduleForm.workingDaysPerWeek,
        assignmentType: "FIXED_BY_COMPANY",
        description: workScheduleForm.description || undefined,
      };

      const response = await assignmentService.create(payload);

      if (response.success) {
        toast.success("Đã thêm lịch làm việc thành công");
        setShowWorkScheduleModal(false);
        // Reset form
        setWorkScheduleForm({
          startDate: new Date().toISOString().split('T')[0],
          salaryAtTime: '',
          additionalAllowance: '',
          workingDaysPerWeek: [],
          description: '',
        });
        // Reload assignments
        loadAssignments();
      } else {
        toast.error(response.message || "Thêm lịch làm việc thất bại");
      }
    } catch (error: any) {
      console.error("Error creating work schedule:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thêm lịch làm việc");
    } finally {
      setSavingWorkSchedule(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setIsDeletingImage(true);
      await employeeService.deleteImage(id!, imageId);
      toast.success("Đã xóa ảnh thành công");
      // Reload images
      const images = await employeeService.getEmployeeImages(id!);
      setEmployeeImages(images);
      setImageToDelete(null);
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa ảnh");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const response = await employeeService.uploadImages(id, formData);
      if (response.success) {
        toast.success("Đã tải lên ảnh thành công");
        // Reload images
        const images = await employeeService.getEmployeeImages(id!);
        setEmployeeImages(images);
      } else {
        toast.error(response.message || "Tải lên thất bại");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải lên");
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadEmployeeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    try {
      setIsUploadingEmployeeImage(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const response = await employeeService.uploadImages(id, formData);
      if (response.success) {
        toast.success("Đã tải lên ảnh thành công");
        // Reload images
        const images = await employeeService.getEmployeeImages(id!);
        setEmployeeImages(images);
        setSelectedImageIndex(0);
      } else {
        toast.error(response.message || "Tải lên thất bại");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải lên");
    } finally {
      setIsUploadingEmployeeImage(false);
      // Reset input
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chi tiết nhân viên văn phòng</h1>
        {employee && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkScheduleModal(true)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 inline-flex items-center gap-2"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Nhập lịch làm việc
            </button>
            <button
              onClick={() => setShowPayrollAdvanceInsuranceModal(true)}
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 inline-flex items-center gap-2"
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ứng lương / Bảo hiểm
            </button>
            <button
              onClick={() => router.push("/admin/company-staff")}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 inline-flex items-center gap-2"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-[#19AD70] text-white rounded hover:bg-[#158F60] inline-flex items-center gap-2 cursor-pointer"
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
                  d="M11 4h6m-1 4L7 17l-4 1 1-4 9-9z"
                />
              </svg>
              Sửa
            </button>
          </div>
        )}
      </div>

      {/* Main Information Grid - 2 Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin cá nhân */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã nhân viên</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.employeeCode}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${employee.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {employee.status === "ACTIVE"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CCCD</p>
                <p className="text-sm text-gray-900">
                  {employee.idCard || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
                <p className="text-sm text-gray-900">
                  {(employee as any).username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {(employee as any).roleName || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
              <p className="text-sm text-gray-900">{employee.phone}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-sm text-gray-900">{employee.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-gray-900">
                  {employee.createdAt ? formatDate(employee.createdAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-900">
                  {employee.updatedAt ? formatDate(employee.updatedAt) : "N/A"}
                </p>
              </div>
            </div>

            {employee.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {employee.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin tài chính */}
        {canManageCost && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Thông tin tài chính
            </h3>
            <div className="space-y-4">
              {/* Salary information for COMPANY_STAFF */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Lương tháng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.monthlySalary ? formatCurrency(employee.monthlySalary) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phụ cấp</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.allowance ? formatCurrency(employee.allowance) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Lương đóng bảo hiểm</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.socialInsurance ? formatCurrency(employee.socialInsurance) : "N/A"}
                </p>
              </div>

              {/* Bank information */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-1">Số tài khoản</p>
                <p className="text-sm font-mono font-medium text-gray-900">
                  {employee.bankAccount || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngân hàng</p>
                <p className="text-sm font-medium text-gray-900">
                  {employee.bankName || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
        {!canManageCost && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Hình ảnh nhân viên
              </h3>
              {employeeImages.length > 0 && (
                <button
                  onClick={() => setShowImageManageModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer text-sm"
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
                      d="M11 4h6m-1 4L7 17l-4 1 1-4 9-9z"
                    />
                  </svg>
                  Sửa
                </button>
              )}
            </div>

            {employeeImages.length > 0 ? (
              <>
                <div className="space-y-4 flex gap-3">

                  {/* Main Image - Fixed size container */}
                  <div className="w-9/12 h-96 bg-gray-100 rounded-lg py-3 overflow-hidden flex justify-center items-center">
                    {employeeImages[selectedImageIndex] ? (
                      <img
                        src={buildCloudinaryUrl(employeeImages[selectedImageIndex].cloudinaryPublicId)}
                        alt={`Employee image ${selectedImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images - Square grid */}
                  {employeeImages.length > 1 && (
                    <div className="w-3/12 grid grid-cols-3 gap-2">
                      {employeeImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === index
                            ? "border-blue-500 ring-2 ring-blue-300"
                            : "border-gray-300 hover:border-gray-400"
                            }`}
                          onClick={() => setSelectedImageIndex(index)}
                          onMouseEnter={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={buildCloudinaryUrl(image.cloudinaryPublicId)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Info */}
                {employeeImages[selectedImageIndex] && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    <p>
                      Ảnh {selectedImageIndex + 1} / {employeeImages.length}
                    </p>
                    {employeeImages[selectedImageIndex].uploadedAt && (
                      <p>
                        Ngày tải lên:{" "}
                        {new Intl.DateTimeFormat("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(employeeImages[selectedImageIndex].uploadedAt))}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <ImageUploader
                onChange={handleUploadEmployeeImage}
                isLoading={isUploadingEmployeeImage}
                loadingText="Đang tải..."
                emptyText="Chưa có hình ảnh"
                helpText="Click để chọn hoặc kéo thả ảnh"
                aspectRatio="video"
                width="w-7/12"
                multiple={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Employee Images Section */}
      {canManageCost && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Hình ảnh nhân viên
            </h3>
            {employeeImages.length > 0 && (
              <button
                onClick={() => setShowImageManageModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer text-sm"
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
                    d="M11 4h6m-1 4L7 17l-4 1 1-4 9-9z"
                  />
                </svg>
                Sửa
              </button>
            )}
          </div>

          {employeeImages.length > 0 ? (
            <>
              <div className="space-y-4 flex gap-3">

                {/* Main Image - Fixed size container */}
                <div className="w-9/12 h-96 bg-gray-100 rounded-lg py-3 overflow-hidden flex justify-center items-center">
                  {employeeImages[selectedImageIndex] ? (
                    <img
                      src={buildCloudinaryUrl(employeeImages[selectedImageIndex].cloudinaryPublicId)}
                      alt={`Employee image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images - Square grid */}
                {employeeImages.length > 1 && (
                  <div className="w-3/12 grid grid-cols-3 gap-2">
                    {employeeImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                          }`}
                        onClick={() => setSelectedImageIndex(index)}
                        onMouseEnter={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={buildCloudinaryUrl(image.cloudinaryPublicId)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Info */}
              {employeeImages[selectedImageIndex] && (
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <p>
                    Ảnh {selectedImageIndex + 1} / {employeeImages.length}
                  </p>
                  {employeeImages[selectedImageIndex].uploadedAt && (
                    <p>
                      Ngày tải lên:{" "}
                      {new Intl.DateTimeFormat("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(employeeImages[selectedImageIndex].uploadedAt))}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <ImageUploader
              onChange={handleUploadEmployeeImage}
              isLoading={isUploadingEmployeeImage}
              loadingText="Đang tải..."
              emptyText="Chưa có hình ảnh"
              helpText="Click để chọn hoặc kéo thả ảnh"
              aspectRatio="video"
              width="w-7/12"
              multiple={true}
            />
          )}
        </div>
      )}

      {/* Assignments */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">
            Phân công
          </h2>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tháng:</label>
              <select
                value={assignmentMonth}
                onChange={(e) => {
                  setAssignmentMonth(Number(e.target.value));
                  setAssignmentPage(0);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Năm:</label>
              <select
                value={assignmentYear}
                onChange={(e) => {
                  setAssignmentYear(Number(e.target.value));
                  setAssignmentPage(0);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loadingAssignments ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có phân công nào</p>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => {
              // prefer customerName returned by API, fallback to mockCustomers
              const customer = (a.customerName && { name: a.customerName }) || mockCustomers.find((c) => c.id === String(a.customerId));
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/assignments/${a.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/admin/assignments/${a.id}`);
                  }}
                  className="p-4 bg-white rounded shadow-sm border cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {customer?.name || a.customerId}
                        </p>
                        {a.status && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getAssignmentStatusClass(
                              a.status
                            )}`}
                          >
                            {getAssignmentStatusLabel(a.status)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {(a as any).workSchedule || a.description || (a.workDays ? `${a.workDays} ngày` : "")}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {a.startDate ? new Intl.DateTimeFormat("vi-VN").format(new Date(a.startDate)) : ""}
                    </div>
                  </div>
                  {a.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      Ghi chú: {a.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loadingAssignments && assignmentTotalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Trang {assignmentPage + 1} / {assignmentTotalPages} (Tổng {assignmentTotalElements} phân công)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAssignmentPage(Math.max(0, assignmentPage - 1))}
                disabled={assignmentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => setAssignmentPage(Math.min(assignmentTotalPages - 1, assignmentPage + 1))}
                disabled={assignmentPage >= assignmentTotalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa nhân viên văn phòng
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  value={editForm.employeeCode}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD *
                </label>
                <input
                  type="text"
                  value={editForm.idCard}
                  onChange={(e) =>
                    setEditForm({ ...editForm, idCard: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editForm.status || "ACTIVE"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Salary fields for COMPANY_STAFF */}
              {role !== 'QLV' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lương tháng *
                  </label>
                  <input
                    type="text"
                    value={typeof editForm.monthlySalary === 'number' ? formatNumber(editForm.monthlySalary) : editForm.monthlySalary || ""}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setEditForm({
                        ...editForm,
                        monthlySalary: rawValue ? formatNumber(rawValue) as any : "" as any
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 10.000.000"
                  />
                </div>
              )} {role !== 'QLV' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phụ cấp
                  </label>
                  <input
                    type="text"
                    value={typeof editForm.allowance === 'number' ? formatNumber(editForm.allowance) : editForm.allowance || ""}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setEditForm({
                        ...editForm,
                        allowance: rawValue ? formatNumber(rawValue) as any : "" as any
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 1.000.000"
                  />
                </div>
              )} {role !== 'QLV' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lương đóng bảo hiểm *
                  </label>
                  <input
                    type="text"
                    value={typeof editForm.socialInsurance === 'number' ? formatNumber(editForm.socialInsurance) : editForm.socialInsurance || ""}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setEditForm({
                        ...editForm,
                        socialInsurance: rawValue ? formatNumber(rawValue) as any : "" as any
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 8.000.000"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={editForm.bankAccount || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankAccount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân hàng
                </label>
                <input
                  type="text"
                  value={editForm.bankName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: VietBank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền xin ứng hàng tháng (VND)
                </label>
                <input
                  type="text"
                  value={typeof editForm.monthlyAdvanceLimit === 'number' ? formatNumber(editForm.monthlyAdvanceLimit) : editForm.monthlyAdvanceLimit || ""}
                  onChange={(e) => {
                    const rawValue = handleNumberInput(e.target.value);
                    setEditForm({
                      ...editForm,
                      monthlyAdvanceLimit: rawValue ? formatNumber(rawValue) as any : "" as any
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 5.000.000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm về nhân viên..."
                />
              </div>
              <input type="hidden" value={editForm.username || ""} />
              <input type="hidden" value={editForm.password || ""} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={savingEmployee}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingEmployee ? (
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
                ) : (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {savingEmployee ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageManageModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Loading Overlay */}
            {(isUploadingImage || isDeletingImage) && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
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
                  <p className="text-sm font-medium text-gray-700">{isDeletingImage ? "Đang xóa..." : "Đang tải..."}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Quản lý hình ảnh nhân viên
              </h2>
              <button
                onClick={() => setShowImageManageModal(false)}
                className="text-gray-400 hover:text-gray-600"
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

            {/* Confirm Delete Toast */}
            {imageToDelete && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImageToDelete(null)}
                    disabled={isDeletingImage}
                    className="px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeleteImage(imageToDelete)}
                    disabled={isDeletingImage}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeletingImage ? (
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
                        Đang xóa...
                      </>
                    ) : (
                      "Xóa"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Images Grid */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-4">
                Hình ảnh hiện tại ({employeeImages.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {employeeImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square group"
                  >
                    <img
                      src={buildCloudinaryUrl(image.cloudinaryPublicId)}
                      alt={`Employee image ${image.id}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {/* Delete button */}
                    <button
                      onClick={() => setImageToDelete(image.id.toString())}
                      disabled={isDeletingImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa ảnh"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Upload area */}
                <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
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
                        <p className="text-xs font-medium text-gray-600">Đang tải...</p>
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 mx-auto text-gray-400 mb-2"
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
                    <p className="text-xs font-medium text-gray-600">
                      {isUploadingImage ? "Đang tải..." : "Thêm ảnh"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowImageManageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Advance Insurance Modal */}
      <PayrollAdvanceInsuranceModal
        isOpen={showPayrollAdvanceInsuranceModal}
        onClose={() => setShowPayrollAdvanceInsuranceModal(false)}
        employeeId={id!}
        employeeName={employee?.name || ""}
        onSuccess={() => {
          // Optional: reload employee data or other updates
        }}
      />

      {/* Work Schedule Modal */}
      {showWorkScheduleModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Nhập lịch làm việc - {employee?.name}
              </h2>
              <button
                onClick={() => setShowWorkScheduleModal(false)}
                disabled={savingWorkSchedule}
                className="text-gray-400 hover:text-gray-600"
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={workScheduleForm.startDate}
                  onChange={(e) =>
                    setWorkScheduleForm({
                      ...workScheduleForm,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày làm việc trong tuần *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'MONDAY', label: 'Thứ 2' },
                    { value: 'TUESDAY', label: 'Thứ 3' },
                    { value: 'WEDNESDAY', label: 'Thứ 4' },
                    { value: 'THURSDAY', label: 'Thứ 5' },
                    { value: 'FRIDAY', label: 'Thứ 6' },
                    { value: 'SATURDAY', label: 'Thứ 7' },
                    { value: 'SUNDAY', label: 'Chủ nhật' },
                  ].map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={workScheduleForm.workingDaysPerWeek.includes(day.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkScheduleForm({
                              ...workScheduleForm,
                              workingDaysPerWeek: [
                                ...workScheduleForm.workingDaysPerWeek,
                                day.value,
                              ],
                            });
                          } else {
                            setWorkScheduleForm({
                              ...workScheduleForm,
                              workingDaysPerWeek: workScheduleForm.workingDaysPerWeek.filter(
                                (d) => d !== day.value
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lương (VND) - Từ hồ sơ nhân viên
                  </label>
                  <input
                    type="text"
                    value={workScheduleForm.salaryAtTime}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    placeholder="VD: 10.000.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phụ cấp (VND) - Từ hồ sơ nhân viên
                  </label>
                  <input
                    type="text"
                    value={workScheduleForm.additionalAllowance}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    placeholder="VD: 1.000.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={workScheduleForm.description}
                  onChange={(e) =>
                    setWorkScheduleForm({
                      ...workScheduleForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú về lịch làm việc..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowWorkScheduleModal(false)}
                disabled={savingWorkSchedule}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveWorkSchedule}
                disabled={savingWorkSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingWorkSchedule ? (
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
                    Đang lưu...
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Lưu lịch làm việc
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
