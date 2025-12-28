"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { Employee, EmployeeType, AssignmentPayrollDetail } from "@/types";


import {
  employeeService,
  buildCloudinaryUrl,
  type EmployeeImage,
} from "@/services/employeeService";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { assignmentService, Assignment } from "@/services/assignmentService";
import payrollService, { Payroll } from "@/services/payrollService";
import { usePermission } from "@/hooks/usePermission";
import BankSelect from "@/components/BankSelect";
import { authService } from "@/services/authService";
import { reviewService } from "@/services/reviewService";
export default function EmployeeDetail() {
  const getTypeLabel = (t: "customer" | "coworker" | "manager") =>
    t === "customer"
      ? "Khách hàng"
      : t === "coworker"
        ? "Nhân viên"
        : "Quản lý vùng";

  const getTypeShort = (t: "customer" | "coworker" | "manager") =>
    t === "customer"
      ? "khách hàng"
      : t === "coworker"
        ? "nhân viên"
        : "quản lý";

  const getRoleLabel = (r?: string) => {
    if (!r) return "N/A";
    switch (r) {
      case "CUSTOMER":
        return "Khách hàng";
      case "QLT1":
        return "Quản lý tổng 1";
      case "QLT2":
        return "Quản lý tổng 2";
      case "QLV":
        return "Quản lý vùng";
      case "EMPLOYEE":
        return "Nhân viên";
      case "ACCOUNTANT":
        return "Kế toán";
      default:
        return r;
    }
  };

  const params = useParams();
  const id = params?.id as string | undefined;

  const router = useRouter();

  // Get current user role
  const role = authService.getUserRole();

  // Permission checks
  const canView = usePermission(["EMPLOYEE_VIEW", "EMPLOYEE_VIEW_OWN"]);
  const canEdit = usePermission("EMPLOYEE_EDIT");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [employeeImages, setEmployeeImages] = useState<EmployeeImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageManageModal, setShowImageManageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEmployeeImage, setIsUploadingEmployeeImage] =
    useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  // Payroll states for insurance input in edit dialog
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [payrollId, setPayrollId] = useState<number | null>(null);
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);
  // Reviews for this employee (from customers)
  const [employeeReviews, setEmployeeReviews] = useState<any[]>([]);
  const [loadingEmployeeReviews, setLoadingEmployeeReviews] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState<{
    customerId?: number;
    rating?: number;
    comment?: string;
  }>({});
  const [employeeGivenReviews, setEmployeeGivenReviews] = useState<any[]>([]);
  const [loadingEmployeeGivenReviews, setLoadingEmployeeGivenReviews] =
    useState(false);
  const [showGivenReviewModal, setShowGivenReviewModal] = useState(false);
  const [savingGivenReview, setSavingGivenReview] = useState(false);
  const [givenReviewForm, setGivenReviewForm] = useState<{
    customerId?: number;
    employeeId?: number;
    rating?: number;
    comment?: string;
  }>({});
  const [givenReviewType, setGivenReviewType] = useState<
    "customer" | "coworker" | "manager"
  >("customer");
  const [coworkerCustomerId, setCoworkerCustomerId] = useState<number | "">("");
  const [assignmentsFromCustomer, setAssignmentsFromCustomer] = useState<
    Assignment[]
  >([]);
  const [loadingAssignmentsFromCustomer, setLoadingAssignmentsFromCustomer] =
    useState(false);
  const [coworkerSelectedContractId, setCoworkerSelectedContractId] =
    useState<number | "">("");
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [managersList, setManagersList] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [
    showPayrollAdvanceInsuranceModal,
    setShowPayrollAdvanceInsuranceModal,
  ] = useState(false);
  const [assignmentCustomerId, setAssignmentCustomerId] = useState<
    number | undefined
  >();
  const [assignmentMonth, setAssignmentMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [assignmentYear, setAssignmentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [assignmentPage, setAssignmentPage] = useState(0);
  const [assignmentPageSize] = useState(10);
  const [assignmentTotalPages, setAssignmentTotalPages] = useState(0);
  const [assignmentTotalElements, setAssignmentTotalElements] = useState(0);

  // Assignment payroll details states (for EMPLOYEE role only)
  const [assignmentPayrollDetails, setAssignmentPayrollDetails] = useState<AssignmentPayrollDetail[]>([]);
  const [loadingPayrollDetails, setLoadingPayrollDetails] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  // Load reviews created by this employee (server-side reviewer endpoint)
  useEffect(() => {
    const loadGivenReviews = async () => {
      if (!id) return;
      try {
        setLoadingEmployeeGivenReviews(true);
        const res = await reviewService.getByReviewerId(Number(id));
        setEmployeeGivenReviews(res || []);
      } catch (err) {
        console.error("Error loading reviews given by employee:", err);
        setEmployeeGivenReviews([]);
      } finally {
        setLoadingEmployeeGivenReviews(false);
      }
    };

    loadGivenReviews();
  }, [id]);

  // Load reviews for this employee
  useEffect(() => {
    const loadEmployeeReviews = async () => {
      if (!id) return;
      try {
        setLoadingEmployeeReviews(true);
        const res = await reviewService.getByEmployeeId(Number(id));
        setEmployeeReviews(res || []);
      } catch (err) {
        console.error("Error loading employee reviews:", err);
        setEmployeeReviews([]);
      } finally {
        setLoadingEmployeeReviews(false);
      }
    };

    loadEmployeeReviews();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(id!);
      console.log(data);
      setEmployee(data);

      // EMPLOYEE can only view their own profile
      if (role === "EMPLOYEE") {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id !== Number(id)) {
          toast.error("Bạn không có quyền xem thông tin nhân viên này");
          router.push("/admin");
          return;
        }
      }

      // Load employee images
      const images = await employeeService.getEmployeeImages(id!);
      setEmployeeImages(images);
      setSelectedImageIndex(0);
    } catch (error) {
      console.error("Error loading employee:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadAssignments();
  }, [
    id,
    assignmentCustomerId,
    assignmentMonth,
    assignmentYear,
    assignmentPage,
  ]);

  // when coworker flow: load assignments for selected customer to get coworkers
  useEffect(() => {
    if (givenReviewType !== "coworker") return;
    if (!coworkerCustomerId) return;
    const load = async () => {
      try {
        setLoadingAssignmentsFromCustomer(true);
        const res = await assignmentService.getByCustomerId(
          String(coworkerCustomerId)
        );
        setAssignmentsFromCustomer(res || []);
      } catch (err) {
        console.error("Error loading assignments for customer:", err);
        setAssignmentsFromCustomer([]);
      } finally {
        setLoadingAssignmentsFromCustomer(false);
      }
    };
    load();
  }, [coworkerCustomerId, givenReviewType]);

  // Load assignment payroll details for EMPLOYEE role
  useEffect(() => {
    if (id && role === 'EMPLOYEE' && assignments.length > 0) {
      loadAssignmentPayrollDetails();
    }
  }, [id, assignmentMonth, assignmentYear, role, assignments]);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await assignmentService.getByEmployeeId(id!, {
        customerId: assignmentCustomerId,
        month: assignmentMonth,
        year: assignmentYear,
        page: assignmentPage,
        pageSize: assignmentPageSize,
      });
      setAssignments(response.content || []);
      setAssignmentTotalPages(response.totalPages);
      setAssignmentTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setAssignments([]);
      setAssignmentTotalPages(0);
      setAssignmentTotalElements(0);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadAssignmentPayrollDetails = async () => {
    // Only load if user is EMPLOYEE role
    if (role !== 'EMPLOYEE' || !id) return;

    try {
      setLoadingPayrollDetails(true);
      const details = await payrollService.getAssignmentPayrollDetails(
        Number(id),
        assignmentMonth,
        assignmentYear
      );
      setAssignmentPayrollDetails(details);
    } catch (error) {
      console.error('Error loading payroll details:', error);
      // Don't show error toast - just fail silently for optional feature
      setAssignmentPayrollDetails([]);
    } finally {
      setLoadingPayrollDetails(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">
          Bạn không có quyền xem thông tin nhân viên
        </p>
      </div>
    );
  }

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

  // derive unique customers from assignments for selection lists
  const uniqueCustomers = Array.from(
    new Map(
      assignments.map((a: any) => [
        a.customerId,
        {
          id: a.customerId,
          name: a.customerName || String(a.customerId),
          code: a.customerCode || "",
        },
      ])
    ).values()
  );

  const selectedNewCustomer = uniqueCustomers.find(
    (c: any) => c.id === newReviewForm.customerId
  );
  const selectedGivenCustomer = uniqueCustomers.find(
    (c: any) => c.id === givenReviewForm.customerId
  );

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

  const handleEdit = async () => {
    if (!canEdit) return;

    // Set edit form
    setEditForm({
      ...(employee as Employee),
      username: (employee as any).username || "",
      password: (employee as any).password || "",
    });

    // Load payroll for current month/year
    await loadPayrollForMonth(selectedMonth, selectedYear);

    setShowEditModal(true);
  };

  const loadPayrollForMonth = async (month: number, year: number) => {
    try {
      setIsLoadingPayroll(true);
      const response = await payrollService.getPayrolls({
        month,
        year,
        page: 0,
        pageSize: 100,
      });

      const employeePayroll = response.content?.find(
        (p) => Number(p.employeeId) === Number(id)
      );

      if (employeePayroll) {
        setPayrollId(employeePayroll.id);
        setInsuranceAmount(employeePayroll.insuranceTotal || 0);
      } else {
        setPayrollId(null);
        setInsuranceAmount(0);
      }
    } catch (error) {
      console.error("Error loading payroll:", error);
      setPayrollId(null);
      setInsuranceAmount(0);
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      // 1. Save employee info
      const response = await employeeService.update(editForm.id, editForm);
      if (response.success) {
        toast.success("Đã cập nhật thông tin nhân viên thành công");

        // 2. Handle payroll update/creation if insurance amount > 0
        if (insuranceAmount > 0) {
          try {
            if (payrollId) {
              // Update existing payroll
              await payrollService.recalculatePayroll(payrollId, {
                insuranceTotal: insuranceAmount,
              });
              toast.success("Đã cập nhật bảo hiểm thành công");
            } else {
              // Create new payroll
              const createData = {
                employeeId: Number(id),
                month: selectedMonth,
                year: selectedYear,
                insuranceAmount: insuranceAmount,
              };
              await payrollService.calculatePayroll(createData);
              toast.success("Đã tạo bảng lương và cập nhật bảo hiểm thành công");
            }
          } catch (payrollError: any) {
            console.error("Error updating payroll:", payrollError);
            toast.error(payrollError.message || "Không thể cập nhật bảo hiểm");
          }
        }

        setShowEditModal(false);
        // Reload employee data
        loadEmployee();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!canEdit) return;
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
    if (!canEdit) return;
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

  const handleUploadEmployeeImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!canEdit) return;
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
        <h1 className="text-2xl font-bold">Chi tiết nhân viên</h1>
        {employee && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
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
            {canEdit && (
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
            )}
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
                  {getRoleLabel((employee as any).roleName)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
              <p className="text-sm text-gray-900">
                {role === "CUSTOMER" ? "********" : employee.phone}
              </p>
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

        {/* Card 2: Thông tin ngân hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin ngân hàng
          </h3>
          <div className="space-y-4">
            <div>
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
      </div>
      {/* Reviews created by this employee */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Đánh giá của nhân viên
          </h3>
          <div>
            <button
              onClick={() => setShowGivenReviewModal(true)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Thêm đánh giá
            </button>
          </div>
        </div>

        {loadingEmployeeGivenReviews ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : employeeGivenReviews.length === 0 ? (
          <p className="text-sm text-gray-500">
            Chưa có đánh giá do nhân viên này tạo
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2">Đánh giá</th>
                  <th className="px-3 py-2">Bình luận</th>
                  <th className="px-3 py-2">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {employeeGivenReviews.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      r.id && router.push(`/admin/reviews/${r.id}`)
                    }
                  >
                    <td className="px-3 py-3 text-sm text-gray-800">
                      {r.customerName || r.customerId || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {r.rating ?? "-"}
                        </span>
                        <div className="flex text-yellow-400">
                          {Array.from({ length: r.rating || 0 }).map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.383 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118L10 13.348l-3.383 2.455c-.784.57-1.84-.196-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.617 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {r.comment || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400">
                      {r.createdAt
                        ? new Intl.DateTimeFormat("vi-VN").format(
                          new Date(r.createdAt)
                        )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Đánh giá từ khách hàng */}
      {role !== 'EMPLOYEE' && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Đánh giá từ khách hàng
            </h3>
            {/* <div>
            <button
              onClick={() => setShowAddReviewModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm đánh giá
            </button>
          </div> */}
          </div>

          {loadingEmployeeReviews ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : employeeReviews.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có đánh giá</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-3 py-2">Khách hàng</th>
                    <th className="px-3 py-2">Đánh giá</th>
                    <th className="px-3 py-2">Bình luận</th>
                    <th className="px-3 py-2">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeReviews.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/reviews/${r.id}`)}
                    >
                      <td className="px-3 py-3 text-sm text-gray-800">
                        {r.customerName || r.customerId || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {r.rating ?? "-"}
                          </span>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: r.rating || 0 }).map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.383 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118L10 13.348l-3.383 2.455c-.784.57-1.84-.196-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.617 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        {r.comment || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-400">
                        {r.createdAt
                          ? new Intl.DateTimeFormat("vi-VN").format(
                            new Date(r.createdAt)
                          )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thêm đánh giá</h3>
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">
                  {givenReviewType === "customer"
                    ? "Khách hàng mà nhân viên đã phụ trách"
                    : "Khách hàng"}
                </label>
                <select
                  value={newReviewForm.customerId ?? ""}
                  onChange={(e) =>
                    setNewReviewForm({
                      ...newReviewForm,
                      customerId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Chọn khách hàng</option>
                  {uniqueCustomers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Số sao</label>
                <div className="flex items-center gap-2 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() =>
                          setNewReviewForm({ ...newReviewForm, rating: v })
                        }
                        className={`text-xl ${newReviewForm.rating && newReviewForm.rating >= v
                          ? "text-yellow-400"
                          : "text-gray-300"
                          }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Bình luận</label>
                <textarea
                  rows={3}
                  value={newReviewForm.comment ?? ""}
                  onChange={(e) =>
                    setNewReviewForm({
                      ...newReviewForm,
                      comment: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-3 py-1 border rounded text-sm"
                  disabled={savingReview}
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!newReviewForm.customerId || !newReviewForm.rating) {
                      toast.error("Vui lòng chọn khách hàng và số sao");
                      return;
                    }
                    try {
                      setSavingReview(true);
                      const selectedAssignment = assignments.find(
                        (a: any) =>
                          a.customerId === Number(newReviewForm.customerId)
                      );
                      const currentUser = authService.getCurrentUser();
                      const payload: any = {
                        contractId: selectedAssignment?.contractId
                          ? Number(selectedAssignment.contractId)
                          : undefined,
                        assignmentId: selectedAssignment?.id
                          ? Number(selectedAssignment.id)
                          : undefined,
                        rating: newReviewForm.rating,
                        comment: newReviewForm.comment,
                        createdBy: currentUser?.id
                          ? String(currentUser.id)
                          : currentUser?.username || "",
                      };
                      const resp = await reviewService.create(payload);
                      if (resp.success) {
                        toast.success("Đã thêm đánh giá");
                        // reload reviews
                        const res = await reviewService.getAll({
                          employeeId: Number(id),
                          page: 0,
                          pageSize: 50,
                        });
                        setEmployeeReviews(res.content || []);
                        setShowAddReviewModal(false);
                        setNewReviewForm({});
                      } else {
                        toast.error(resp.message || "Thêm thất bại");
                      }
                    } catch (error) {
                      console.error("Error creating review:", error);
                      toast.error("Có lỗi xảy ra");
                    } finally {
                      setSavingReview(false);
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                  disabled={savingReview}
                >
                  {savingReview ? "Đang thêm..." : "Thêm đánh giá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add review modal for reviews created by the employee */}
      {showGivenReviewModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Thêm đánh giá (nhân viên)
              </h3>
              <button
                onClick={() => setShowGivenReviewModal(false)}
                className="text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Loại đánh giá</label>
                <select
                  value={givenReviewType}
                  onChange={(e) =>
                    setGivenReviewType(
                      e.target.value as "customer" | "coworker" | "manager"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                >
                  <option value="customer">
                    Đánh giá khách hàng đã phụ trách
                  </option>
                  <option value="coworker">Đánh giá nhân viên làm cùng</option>
                  {/* <option value="manager">Đánh giá quản lý vùng</option> */}
                </select>
              </div>
              {givenReviewType === "coworker" ? (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Khách hàng</label>
                    <select
                      value={coworkerCustomerId ?? ""}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : "";
                        setCoworkerCustomerId(v as any);
                        // reset selected contract & coworker when customer changes
                        setCoworkerSelectedContractId("");
                        setGivenReviewForm({
                          ...givenReviewForm,
                          employeeId: undefined,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Chọn khách hàng</option>
                      {uniqueCustomers.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.code}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Hợp đồng</label>
                    <select
                      value={coworkerSelectedContractId ?? ""}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : "";
                        setCoworkerSelectedContractId(v as any);
                        // reset selected employee when contract changes
                        setGivenReviewForm({ ...givenReviewForm, employeeId: undefined });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Chọn hợp đồng</option>
                      {Array.from(
                        new Map(
                          assignmentsFromCustomer
                            .filter((a) => a.contractId && Number(a.employeeId) === Number(id))
                            .map((a) => [String(a.contractId), { id: a.contractId, desc: a.contractDescription }])
                        ).values()
                      ).map((c: any) => (
                        <option key={c.id} value={c.id}>
                          HĐ #{c.id} - {c.desc || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Nhân viên</label>
                    <select
                      value={givenReviewForm.employeeId ?? ""}
                      onChange={(e) =>
                        setGivenReviewForm({
                          ...givenReviewForm,
                          employeeId: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Chọn nhân viên</option>
                      {loadingAssignmentsFromCustomer ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        // map assignments to unique employees filtered by selected contract
                        Array.from(
                          new Map(
                            assignmentsFromCustomer
                              .filter((a) =>
                                coworkerSelectedContractId ? String(a.contractId) === String(coworkerSelectedContractId) : true
                              )
                              .map((a) => [
                                a.employeeId,
                                {
                                  id: a.employeeId,
                                  name: a.employeeName || a.employeeId,
                                  code: a.employeeCode || "",
                                  assignmentId: a.id,
                                  contractId: a.contractId,
                                },
                              ])
                          ).values()
                        ).map((eObj: any) => (
                          <option key={eObj.id} value={eObj.id}>
                            {eObj.name} - {eObj.code}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm text-gray-600">
                    {getTypeLabel(givenReviewType)}
                  </label>
                  {givenReviewType === "customer" &&
                    selectedGivenCustomer?.code && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mã khách hàng: {selectedGivenCustomer.code}
                      </p>
                    )}
                  <select
                    value={givenReviewForm.customerId ?? ""}
                    onChange={(e) =>
                      setGivenReviewForm({
                        ...givenReviewForm,
                        customerId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">
                      Chọn {getTypeShort(givenReviewType)}
                    </option>
                    {givenReviewType === "customer" &&
                      uniqueCustomers.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.code}
                        </option>
                      ))}
                    {givenReviewType === "manager" &&
                      managersList.map((e: any) => (
                        <option key={e.id} value={e.id}>
                          {e.name} - {e.employeeCode}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600">Số điển</label>
                <div className="flex items-center gap-2 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() =>
                          setGivenReviewForm({ ...givenReviewForm, rating: v })
                        }
                        className={`text-xl ${givenReviewForm.rating && givenReviewForm.rating >= v
                          ? "text-yellow-400"
                          : "text-gray-300"
                          }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Bình luận</label>
                <textarea
                  rows={3}
                  value={givenReviewForm.comment ?? ""}
                  onChange={(e) =>
                    setGivenReviewForm({
                      ...givenReviewForm,
                      comment: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowGivenReviewModal(false)}
                  className="px-3 py-1 border rounded text-sm"
                  disabled={savingGivenReview}
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (givenReviewType === "coworker") {
                      if (
                        !coworkerCustomerId ||
                        !coworkerSelectedContractId ||
                        !givenReviewForm.employeeId ||
                        !givenReviewForm.rating
                      ) {
                        toast.error(
                          "Vui lòng chọn khách hàng, hợp đồng, nhân viên và số sao"
                        );
                        return;
                      }
                    } else {
                      if (
                        !givenReviewForm.customerId ||
                        !givenReviewForm.rating
                      ) {
                        toast.error("Vui lòng chọn khách hàng và số sao");
                        return;
                      }
                    }
                    try {
                      setSavingGivenReview(true);
                      let selectedAssignment: any = undefined;
                      if (givenReviewType === "customer") {
                        selectedAssignment = assignments.find(
                          (a: any) =>
                            a.customerId === Number(givenReviewForm.customerId)
                        );
                      } else if (givenReviewType === "coworker") {
                        selectedAssignment = assignmentsFromCustomer.find(
                          (a: any) =>
                            a.employeeId === Number(givenReviewForm.employeeId) &&
                            (coworkerSelectedContractId
                              ? String(a.contractId) === String(coworkerSelectedContractId)
                              : true)
                        );
                      }
                      const currentUser = authService.getCurrentUser();
                      const payload: any = {
                        contractId: selectedAssignment?.contractId
                          ? Number(selectedAssignment.contractId)
                          : undefined,
                        assignmentId: selectedAssignment?.id
                          ? Number(selectedAssignment.id)
                          : undefined,
                        rating: givenReviewForm.rating,
                        comment: givenReviewForm.comment,
                        createdBy: currentUser?.id
                          ? String(currentUser.id)
                          : currentUser?.username || "",
                        // legacy fields kept for compatibility
                        reviewId: Number(id),
                        reviewName: employee?.name,
                        reviewType: givenReviewType,
                      };
                      // include employeeId when creating a coworker review
                      if (givenReviewType === "coworker") {
                        payload.employeeId = Number(givenReviewForm.employeeId);
                        // ensure we do not send customerId for coworker reviews
                        if (payload.customerId !== undefined) delete payload.customerId;
                      }
                      const resp = await reviewService.create(payload);
                      if (resp && resp.success) {
                        toast.success("Đã thêm đánh giá");
                        // refresh given reviews via reviewer endpoint
                        const refreshed = await reviewService.getByReviewerId(
                          Number(id)
                        );
                        setEmployeeGivenReviews(refreshed || []);
                        setShowGivenReviewModal(false);
                        setGivenReviewForm({});
                      } else {
                        toast.error(resp?.message || "Thêm thất bại");
                      }
                    } catch (err) {
                      console.error("Error creating review by employee:", err);
                      toast.error("Có lỗi xảy ra");
                    } finally {
                      setSavingGivenReview(false);
                    }
                  }}
                  disabled={savingGivenReview}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  {savingGivenReview ? "Đang thêm..." : "Thêm đánh giá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* (moved above images) */}

      {/* Employee Images Section */}
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
                    src={buildCloudinaryUrl(
                      employeeImages[selectedImageIndex].cloudinaryPublicId
                    )}
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
                    }).format(
                      new Date(employeeImages[selectedImageIndex].uploadedAt)
                    )}
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

      {/* Assignments */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Phân công</h2>
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
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i
                ).map((y) => (
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
              // prefer customerName returned by API, fallback to id string
              const customer = { name: a.customerName || String(a.customerId) };
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/assignments/${a.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      router.push(`/admin/assignments/${a.id}`);
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
                        {(a as any).workSchedule ||
                          a.description ||
                          (a.workDays ? `${a.workDays} ngày` : "")}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {a.startDate
                        ? new Intl.DateTimeFormat("vi-VN").format(
                          new Date(a.startDate)
                        )
                        : ""}
                    </div>
                  </div>
                  {a.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      Ghi chú: {a.description}
                    </p>
                  )}

                  {/* Payroll Details - Only for EMPLOYEE role */}
                  {role === 'EMPLOYEE' && !loadingPayrollDetails && (() => {
                    const payrollDetail = assignmentPayrollDetails.find(
                      d => d.assignmentId === a.id
                    );

                    if (!payrollDetail) return null;

                    return (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1">Lương CB</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(payrollDetail.baseSalary)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1">Ngày công</span>
                            <span className="font-semibold text-blue-600">
                              {payrollDetail.workDays} ngày
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1">Lương DK</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(payrollDetail.expectedSalary)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loadingAssignments && assignmentTotalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Trang {assignmentPage + 1} / {assignmentTotalPages} (Tổng{" "}
              {assignmentTotalElements} phân công)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setAssignmentPage(Math.max(0, assignmentPage - 1))
                }
                disabled={assignmentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setAssignmentPage(
                    Math.min(assignmentTotalPages - 1, assignmentPage + 1)
                  )
                }
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
                Chỉnh sửa nhân viên
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
                <BankSelect
                  value={editForm.bankName || ""}
                  onChange={(v: string) =>
                    setEditForm({ ...editForm, bankName: v })
                  }
                />
              </div>

              {/* Payroll Insurance Section */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bảo hiểm</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={async (e) => {
                        const month = Number(e.target.value);
                        setSelectedMonth(month);
                        await loadPayrollForMonth(month, selectedYear);
                      }}
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
                      onChange={async (e) => {
                        const year = Number(e.target.value);
                        setSelectedYear(year);
                        await loadPayrollForMonth(selectedMonth, year);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền bảo hiểm (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={insuranceAmount}
                    onChange={(e) => setInsuranceAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    disabled={isLoadingPayroll}
                  />
                  {isLoadingPayroll && (
                    <p className="text-xs text-gray-500 mt-1">Đang tải...</p>
                  )}
                  {!isLoadingPayroll && payrollId && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Đã có bảng lương - sẽ cập nhật
                    </p>
                  )}
                  {!isLoadingPayroll && !payrollId && insuranceAmount > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      ⓘ Sẽ tạo bảng lương mới
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền xin ứng hàng tháng (VND)
                </label>
                <input
                  type="number"
                  value={editForm.monthlyAdvanceLimit || 0}
                  onChange={(e) =>
                    setEditForm({ ...editForm, monthlyAdvanceLimit: Number(e.target.value) })
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
            </div >

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div >
        </div >
      )
      }

      {/* Image Management Modal */}
      {
        showImageManageModal && (
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
                    <p className="text-sm font-medium text-gray-700">
                      {isDeletingImage ? "Đang xóa..." : "Đang tải..."}
                    </p>
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
                      Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn
                      tác.
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
                    <div key={image.id} className="relative aspect-square group">
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
                          <p className="text-xs font-medium text-gray-600">
                            Đang tải...
                          </p>
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
        )
      }
    </div >
  );
}
