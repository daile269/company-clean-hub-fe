"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { customerService } from "@/services/customerService";
import customerAssignmentService from "@/services/customerAssignmentService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import { employeeService } from "@/services/employeeService";
import {
  assignmentService,
  AssignmentCreateRequest,
  TemporaryReassignmentRequest,
  Assignment,
  AssignmentHistory,
} from "@/services/assignmentService";
import serviceService, { ServiceRequest } from "@/services/serviceService";
import contractService from "@/services/contractService";
import { Customer, Employee } from "@/types";
import { usePermission } from "@/hooks/usePermission";
import { authService } from "@/services/authService";
import { reviewService } from "@/services/reviewService";

export default function CustomerDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  // Role check for routing
  const role = authService.getUserRole();

  const routerForEmployee = (
    employeeId: string | number,
    assignmentId: string | number
  ) => {
    if (role === "CUSTOMER") {
      router.push(`/admin/employees/${employeeId}`);
    } else {
      router.push(`/admin/assignments/${assignmentId}`);
    }
  };

  // Permission checks
  const canView = usePermission("CUSTOMER_VIEW");
  const canEdit = usePermission("CUSTOMER_EDIT");
  const canDelete = usePermission("CUSTOMER_DELETE");
  const canAssign = usePermission("ASSIGNMENT_CREATE");
  const canAddContract = usePermission("CONTRACT_CREATE");
  const canViewEmployee = usePermission("EMPLOYEE_VIEW");
  const canEditEmployee = usePermission("EMPLOYEE_EDIT");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState<Customer | null>(null);

  // Assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  // Paginated employees for selection in reassignment modal
  const [employeesPage, setEmployeesPage] = useState<any>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  });
  const [employeesPageLoading, setEmployeesPageLoading] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingAllAssignments, setLoadingAllAssignments] = useState(false);
  const [allAssignedEmployees, setAllAssignedEmployees] = useState<any[]>([]);
  const [notAssignedEmployees, setNotAssignedEmployees] = useState<Employee[]>(
    []
  );
  const [notAssignedPage, setNotAssignedPage] = useState<any>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  });
  const [loadingNotAssigned, setLoadingNotAssigned] = useState(false);

  // Modal-specific filters for not-assigned list
  const [assignmentModalMonth, setAssignmentModalMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [assignmentModalYear, setAssignmentModalYear] = useState<number>(
    new Date().getFullYear()
  );
  const [notAssignedKeyword, setNotAssignedKeyword] = useState<string>("");
  const [notAssignedEmploymentType, setNotAssignedEmploymentType] =
    useState<string>("");
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [savingReassignment, setSavingReassignment] = useState(false);

  // Contract states
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractForm, setContractForm] = useState({
    customerId: "",
    serviceIds: [] as number[],
    serviceName: "",
    servicePrice: "" as any,
    serviceVat: "" as any,
    serviceDescription: "",
    serviceEffectiveFrom: new Date().toISOString().split("T")[0],
    serviceServiceType: "RECURRING",
    startDate: "",
    endDate: "",
    workingDaysPerWeek: [] as string[],
    contractType: "ONE_TIME",
    finalPrice: 0,
    paymentStatus: "PENDING",
    description: "",
  });

  // Customer reviews (customer feedback about assigned employees)
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [loadingCustomerReviews, setLoadingCustomerReviews] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [contractAssignments, setContractAssignments] = useState<any[]>([]);
  const [loadingContractAssignments, setLoadingContractAssignments] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    contractId: string;
    assignmentId: string;
    employeeId: string;
    rating: number;
    comment: string;
  }>({
    contractId: "",
    assignmentId: "",
    employeeId: "",
    rating: 5,
    comment: "",
  });

  const [assignmentForm, setAssignmentForm] = useState<{
    employeeId: number | null;
    contractId: number | null;
    assignmentType: string;
    allowance: number | string;
    startDate: string;
    salaryAtTime: number | string;
    description: string;
    dates: string[];
  }>({
    employeeId: null,
    contractId: null,
    assignmentType: "FIXED_BY_CONTRACT",
    allowance: "",
    startDate: new Date().toISOString().split("T")[0],
    salaryAtTime: "",
    description: "",
    dates: [],
  });
  const [reassignmentForm, setReassignmentForm] = useState<{
    replacementEmployeeId: number | null;
    replacedEmployeeId: number | null;
    replacedAssignmentId: number | null;
    fromDate: string;
    toDate: string;
    selectedDates: string[];
    salaryAtTime?: number | string;
    description: string;
  }>({
    replacementEmployeeId: null,
    replacedEmployeeId: null,
    replacedAssignmentId: null,
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    selectedDates: [],
    salaryAtTime: "",
    description: "",
  });

  // Assignment history states
  const [assignmentHistories, setAssignmentHistories] = useState<any[]>([]);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<AssignmentHistory | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [historyContractFilter, setHistoryContractFilter] =
    useState<string>("");
  const [historyPage, setHistoryPage] = useState<number>(0);
  const [historyPageSize, setHistoryPageSize] = useState<number>(10);
  const [historyTotalPages, setHistoryTotalPages] = useState<number>(0);

  // Filter states for Card 1
  const [assignmentContractFilter, setAssignmentContractFilter] =
    useState<string>("");
  const [filterAssignmentType, setFilterAssignmentType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState<number>(
    new Date().getFullYear()
  );
  const [sortBy, setSortBy] = useState<string>("startDate_desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Load contracts for customer
  const loadContracts = async () => {
    if (!id) return;
    setLoadingContracts(true);
    try {
      const contractsList = await contractService.getByCustomerId(id);
      setContracts(contractsList);
    } catch (error: any) {
      console.error("Error loading contracts:", error);
      toast.error(error.message || "Không thể tải danh sách hợp đồng");
    } finally {
      setLoadingContracts(false);
    }
  };

  // Load customer data from API
  useEffect(() => {
    if (id) {
      loadCustomer();
      loadAllAssignedEmployeesForCustomer();
      loadContracts();
    }
  }, [id]);

  // Load reviews left by customers for assigned employees
  useEffect(() => {
    const loadCustomerReviews = async () => {
      if (!id) return;
      // Skip loading reviews for QLV and EMPLOYEE roles
      if (role === 'QLV' || role === 'EMPLOYEE') return;
      
      try {
        setLoadingCustomerReviews(true);
        const res = await reviewService.getByCustomerId(Number(id));
        setCustomerReviews(res || []);
      } catch (err) {
        console.error("Error loading customer reviews:", err);
        setCustomerReviews([]);
      } finally {
        setLoadingCustomerReviews(false);
      }
    };

    loadCustomerReviews();
  }, [id]);

  // Reload when filters or pagination changes
  useEffect(() => {
    if (id) {
      loadAllAssignedEmployeesForCustomer();
    }
  }, [
    filterMonth,
    filterYear,
    filterAssignmentType,
    filterStatus,
    assignmentContractFilter,
  ]);

  // Load history when customer is loaded
  useEffect(() => {
    if (id) {
      loadAssignmentHistories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, historyContractFilter, historyPage, historyPageSize]);

  const loadNotAssignedEmployees = async (
    page = 0,
    pageSize: number = notAssignedPage.pageSize,
    keyword: string | null = null
  ) => {
    try {
      setLoadingNotAssigned(true);
      const q = keyword !== null ? keyword : notAssignedKeyword || undefined;
      const response = await employeeService.getAll({
        keyword: q,
        page,
        pageSize,
        employmentType: notAssignedEmploymentType || undefined,
      });
      console.log("All employees (paginated):", response);
      setNotAssignedEmployees(response.content || []);
      setNotAssignedPage({
        content: response.content || [],
        totalElements: response.totalElements ?? 0,
        totalPages: response.totalPages ?? 0,
        currentPage: response.currentPage ?? 0,
        pageSize: response.pageSize ?? pageSize,
      });
    } catch (error: any) {
      console.error("Error loading employees:", error);
      toast.error(error.message || "Không thể tải danh sách nhân viên");
      setNotAssignedEmployees([]);
      setNotAssignedPage({
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize,
      });
    } finally {
      setLoadingNotAssigned(false);
    }
  };

  // reload not-assigned list when modal shown or month/year change
  useEffect(() => {
    if (showAssignmentModal) {
      loadNotAssignedEmployees(0, notAssignedPage.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showAssignmentModal,
    assignmentModalMonth,
    assignmentModalYear,
    notAssignedEmploymentType,
  ]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await customerService.getById(id!);
      setCustomer(data);

      // Check if manager role (QLT2, QLV) has access to this customer
      const currentRole = authService.getUserRole();
      if (currentRole === "QLT2" || currentRole === "QLV") {
        try {
          // Check if this customer is in their assigned list
          const assignedCustomers = await customerAssignmentService.getMyAssignedCustomers();
          const hasAccess = assignedCustomers.content.some((c: Customer) => String(c.id) === String(id));

          if (!hasAccess) {
            toast.error("Bạn không có quyền xem khách hàng này");
            router.push("/admin/customers");
            return;
          }
        } catch (error) {
          console.error("Error checking customer access:", error);
          toast.error("Không thể xác thực quyền truy cập");
          router.push("/admin/customers");
          return;
        }
      }
    } catch (error: any) {
      console.error("Error loading customer:", error);
      toast.error(error.message || "Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedEmployees = async () => {
    try {
      setLoadingAssignments(true);
      const data = await assignmentService.getAllByCustomerId(id!, {});
      setAssignedEmployees(data);
    } catch (error) {
      console.error("Error loading assigned employees:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadAssignmentsForContract = async (contractId: string | number) => {
    if (!contractId) {
      setContractAssignments([]);
      return;
    }
    try {
      setLoadingContractAssignments(true);
      const resp = await assignmentService.getByContractMonthYear(Number(contractId), filterMonth, filterYear, 0, 200);
      setContractAssignments(resp.content || []);
    } catch (error) {
      console.error('Error loading assignments for contract:', error);
      setContractAssignments([]);
    } finally {
      setLoadingContractAssignments(false);
    }
  };

  const loadAllAssignedEmployeesForCustomer = async () => {
    try {
      setLoadingAllAssignments(true);
      const data = await assignmentService.getAllByCustomerId(id!, {
        month: filterMonth,
        year: filterYear,
        status: filterStatus || undefined,
        contractType: filterAssignmentType || undefined,
        contractId: assignmentContractFilter
          ? Number(assignmentContractFilter)
          : undefined,
      });
      console.log("All assigned employees (grouped):", data);
      setAllAssignedEmployees(data);
    } catch (error) {
      console.error("Error loading assigned employees:", error);
    } finally {
      setLoadingAllAssignments(false);
    }
  };

  const loadAssignmentHistories = async () => {
    if (!id) return;
    try {
      setLoadingHistories(true);
      const response = await assignmentService.getHistoryByCustomerId(id, {
        contractId: historyContractFilter
          ? Number(historyContractFilter)
          : undefined,
        page: historyPage,
        pageSize: historyPageSize,
      });
      console.log("Assignment histories loaded:", response);
      setAssignmentHistories(response.content || []);
      setHistoryTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error loading assignment histories:", error);
      setAssignmentHistories([]);
    } finally {
      setLoadingHistories(false);
    }
  };

  const handleOpenRollbackModal = (history: AssignmentHistory) => {
    console.log("Opening rollback modal for history:", history);
    setSelectedHistory(history);
    setShowRollbackModal(true);
  };

  const handleConfirmRollback = async () => {
    if (!selectedHistory) return;

    console.log("Rolling back history:", selectedHistory);
    const historyId = selectedHistory.historyId || (selectedHistory as any).id;

    if (!historyId) {
      toast.error("Không tìm thấy ID lịch sử");
      console.error("No historyId found in selectedHistory:", selectedHistory);
      return;
    }

    try {
      setRollingBack(true);
      const response = await assignmentService.rollbackHistory(historyId);

      if (response.success) {
        toast.success(
          response.data?.message || "Đã hoàn tác điều động thành công"
        );
        setShowRollbackModal(false);

        // Refresh both cards
        await Promise.all([
          loadAllAssignedEmployeesForCustomer(),
          loadAssignmentHistories(),
        ]);
      } else {
        toast.error(response.message || "Không thể hoàn tác điều động");
      }
    } catch (error: any) {
      console.error("Error rolling back assignment:", error);
      toast.error(error?.message || "Không thể hoàn tác điều động");
    } finally {
      setRollingBack(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Bạn không có quyền xem thông tin khách hàng
          </p>
        </div>
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

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Không tìm thấy khách hàng</h1>
      </div>
    );
  }

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date as any);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("vi-VN").format(d);
  };

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Filter and sort assignments for Card 1
  const getFilteredAndSortedAssignments = () => {
    let filtered = [...allAssignedEmployees];

    // Apply filters
    if (filterAssignmentType) {
      filtered = filtered.filter(
        (a) => a.assignmentType === filterAssignmentType
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      if (sortBy === "startDate_asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA; // default: desc
      }
    });

    return filtered;
  };

  const getAssignmentTypeBadge = (type: string) => {
    switch (type) {
      case "FIXED_BY_CONTRACT":
      case "FIXED_BY_DAY":
        return "bg-green-100 text-green-800";
      case "FIXED_BY_COMPANY":
        return "bg-blue-100 text-blue-800";
      case "SUPPORT":
        return "bg-gray-100 text-gray-800";
      case "TEMPORARY":
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case "FIXED_BY_CONTRACT":
        return "Cố định theo hợp đồng";
      case "FIXED_BY_DAY":
        return "Cố định theo ngày";
      case "FIXED_BY_COMPANY":
        return "Làm việc tại công ty";
      case "SUPPORT":
        return "Hỗ trợ";
      case "TEMPORARY":
      default:
        return "Tạm thời";
    }
  };

  const handleEdit = () => {
    if (!canEdit) return;
    // Use customer data as editForm; username is derived from code on save
    setEditForm({ ...customer! });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const response = await customerService.update(editForm.id, editForm);
      if (response.success) {
        toast.success("Đã cập nhật thông tin khách hàng thành công");
        setShowEditModal(false);
        // Reload customer data
        loadCustomer();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!customer || !canDelete) return;

    try {
      const response = await customerService.delete(customer.id);
      if (response.success) {
        toast.success("Đã xóa khách hàng thành công");
        setShowDeleteModal(false);
        // Navigate back to customers list
        router.push("/admin/customers");
      } else {
        toast.error(response.message || "Xóa thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  // Load employees for assignment
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getAll({
        keyword: searchEmployee,
        page: 0,
        pageSize: 100,
      });
      setEmployees(response.content);
    } catch (error: any) {
      console.error("Error loading employees:", error);
      toast.error(error.message || "Không thể tải danh sách nhân viên");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadEmployeesPage = async (
    page: number = 0,
    pageSize: number = employeesPage.pageSize,
    keyword: string | null = null
  ) => {
    try {
      setEmployeesPageLoading(true);
      const q = keyword !== null ? keyword : searchEmployee;
      const response = await employeeService.getAll({
        keyword: q,
        page,
        pageSize,
      });
      setEmployeesPage({
        content: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        pageSize: response.pageSize,
      });
    } catch (error: any) {
      console.error("Error loading paginated employees:", error);
      toast.error(error.message || "Không thể tải danh sách nhân viên");
    } finally {
      setEmployeesPageLoading(false);
    }
  };

  const handleOpenAssignmentModal = async () => {
    setShowAssignmentModal(true);
    await loadContracts();
    await loadNotAssignedEmployees(0, notAssignedPage.pageSize);
  };

  const handleOpenReassignmentModal = async () => {
    setShowReassignmentModal(true);
    // Load assigned employees for "replaced" column
    await loadAssignedEmployees();
    // Load paginated system employees for "replacement" column
    await loadEmployeesPage(0);
  };

  const handleAssignEmployee = async () => {
    if (!customer) return;
    if (!assignmentForm.employeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }
    if (!assignmentForm.contractId) {
      toast.error("Vui lòng chọn hợp đồng");
      return;
    }

    if (
      assignmentForm.assignmentType === "SUPPORT" &&
      (!assignmentForm.dates || assignmentForm.dates.length === 0)
    ) {
      toast.error("Vui lòng chọn ít nhất một ngày hỗ trợ");
      return;
    }

    setSavingAssignment(true);
    try {
      // Parse formatted currency strings (e.g. "5.000.000") to raw numbers
      const salaryRaw = assignmentForm.salaryAtTime
        ? Number(parseFormattedNumber(String(assignmentForm.salaryAtTime)))
        : undefined;
      const allowanceRaw = assignmentForm.allowance
        ? Number(parseFormattedNumber(String(assignmentForm.allowance)))
        : undefined;

      const assignmentData: AssignmentCreateRequest = {
        employeeId: assignmentForm.employeeId,
        contractId: assignmentForm.contractId,
        startDate: assignmentForm.startDate,
        scope: "CONTRACT",
        status: "IN_PROGRESS",
        assignmentType: assignmentForm.assignmentType,
        salaryAtTime: salaryRaw,
        additionalAllowance: allowanceRaw,
        description: assignmentForm.description,
        dates:
          assignmentForm.assignmentType === "SUPPORT"
            ? assignmentForm.dates
            : undefined,
      };
      console.log("Assignment data:", assignmentData);
      const response = await assignmentService.create(assignmentData);

      if (response.success) {
        toast.success("Đã phân công nhân viên thành công");
        setShowAssignmentModal(false);
        // Reset form
        setAssignmentForm({
          employeeId: null,
          contractId: null,
          assignmentType: "FIXED_BY_CONTRACT",
          allowance: "",
          startDate: new Date().toISOString().split("T")[0],
          salaryAtTime: "",
          description: "",
          dates: [],
        });
        // Reload assigned employees list and histories
        await Promise.all([
          loadAssignedEmployees(),
          loadAllAssignedEmployeesForCustomer(),
          loadAssignmentHistories(),
        ]);
      } else {
        toast.error(response.message || "Phân công thất bại");
      }
    } catch (error: any) {
      console.error("Error assigning employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi phân công");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleTemporaryReassignment = async () => {
    if (!customer) return;
    if (
      !reassignmentForm.replacedEmployeeId ||
      !reassignmentForm.replacementEmployeeId
    ) {
      toast.error("Vui lòng chọn nhân viên bị thay và nhân viên thay thế");
      return;
    }
    if (
      !reassignmentForm.selectedDates ||
      reassignmentForm.selectedDates.length === 0
    ) {
      toast.error("Vui lòng chọn ít nhất một ngày điều động");
      return;
    }

    setSavingReassignment(true);
    try {
      const reassignmentSalaryRaw = reassignmentForm.salaryAtTime
        ? Number(parseFormattedNumber(String(reassignmentForm.salaryAtTime)))
        : undefined;

      const reassignmentData: TemporaryReassignmentRequest = {
        replacementEmployeeId: reassignmentForm.replacementEmployeeId,
        replacedEmployeeId: reassignmentForm.replacedEmployeeId,
        replacedAssignmentId: reassignmentForm.replacedAssignmentId!,
        dates: reassignmentForm.selectedDates,
        salaryAtTime: reassignmentSalaryRaw,
        description: reassignmentForm.description,
      };

      console.log("=== TEMPORARY REASSIGNMENT DATA ===");
      console.log(
        "Replacement Employee ID:",
        reassignmentData.replacementEmployeeId
      );
      console.log("Replaced Employee ID:", reassignmentData.replacedEmployeeId);
      console.log(
        "Replaced Assignment ID:",
        reassignmentData.replacedAssignmentId
      );
      console.log("Dates:", reassignmentData.dates);
      console.log("===================================");

      const response = await assignmentService.temporaryReassignment(
        reassignmentData
      );

      if (response.success) {
        toast.success("Đã điều động nhân viên tạm thời thành công");
        setShowReassignmentModal(false);
        // Reset form
        setReassignmentForm({
          replacementEmployeeId: null,
          replacedEmployeeId: null,
          replacedAssignmentId: null,
          fromDate: new Date().toISOString().split("T")[0],
          toDate: new Date().toISOString().split("T")[0],
          selectedDates: [],
          salaryAtTime: "",
          description: "",
        });
        // Reload assigned employees list, grouped assignments and histories
        await Promise.all([
          loadAssignedEmployees(),
          loadAllAssignedEmployeesForCustomer(),
          loadAssignmentHistories(),
        ]);
      } else {
        toast.error(response.message || "Điều động thất bại");
      }
    } catch (error: any) {
      console.error("Error creating temporary reassignment:", error);
      toast.error(error.message || "Có lỗi xảy ra khi điều động");
    } finally {
      setSavingReassignment(false);
    }
  };

  const handleAddContract = async () => {
    setSavingContract(true);
    try {
      // Parse formatted numbers correctly
      const rawPrice = parseFormattedNumber(
        String(contractForm.servicePrice || "")
      );
      const servicePrice = Number(rawPrice) || 0;
      const serviceVat =
        contractForm.serviceVat === "" ? 0 : Number(contractForm.serviceVat);
      console.log(
        "Creating contract with service price:",
        contractForm.serviceName
      );
      if (
        !contractForm.serviceName ||
        servicePrice <= 0 ||
        !contractForm.startDate ||
        !contractForm.endDate
      ) {
        console.error("Missing required contract fields:", contractForm);
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Calculate finalPrice from service price + vat percentage
      const calculatedFinalPrice =
        servicePrice + (servicePrice * serviceVat) / 100;

      // Step 1: Create service first
      const serviceRequest: ServiceRequest = {
        title: contractForm.serviceName,
        description: contractForm.serviceDescription,
        price: servicePrice,
        vat: serviceVat,
        effectiveFrom: contractForm.serviceEffectiveFrom,
        serviceType: contractForm.serviceServiceType || "RECURRING",
      };

      const serviceResponse = await serviceService.create(serviceRequest);

      if (!serviceResponse || !serviceResponse.id) {
        toast.error("Không thể tạo dịch vụ");
        return;
      }

      // Step 2: Create contract with the service ID
      const contractData = {
        customerId: Number(id),
        serviceIds: [serviceResponse.id],
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        workingDaysPerWeek: contractForm.workingDaysPerWeek,
        contractType: contractForm.contractType,
        finalPrice: calculatedFinalPrice,
        paymentStatus: contractForm.paymentStatus,
        description: contractForm.description,
      };

      await contractService.create(contractData);

      toast.success("Đã thêm hợp đồng mới thành công");
      setShowAddContractModal(false);
      loadContracts(); // Reload contracts list

      // Reset form
      setContractForm({
        customerId: "",
        serviceIds: [],
        serviceName: "",
        servicePrice: "" as any,
        serviceVat: "" as any,
        serviceDescription: "",
        serviceEffectiveFrom: new Date().toISOString().split("T")[0],
        serviceServiceType: "RECURRING",
        startDate: "",
        endDate: "",
        workingDaysPerWeek: [],
        contractType: "ONE_TIME",
        finalPrice: 0,
        paymentStatus: "PENDING",
        description: "",
      });
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast.error(error.message || "Không thể tạo hợp đồng");
    } finally {
      setSavingContract(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatNumber = (num: number | string) => {
    if (!num && num !== 0) return "";
    // Parse to remove any existing formatting, then format again
    const rawValue =
      typeof num === "string" ? parseFormattedNumber(num) : num.toString();
    return new Intl.NumberFormat("vi-VN").format(Number(rawValue));
  };

  const parseFormattedNumber = (str: string) => {
    // Remove both comma and dot separators (vi-VN uses dot as thousand separator)
    return str.replace(/[,.]/g, "");
  };

  const handleNumberInput = (value: string) => {
    // Chỉ cho phép số
    return value.replace(/[^0-9]/g, "");
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
        </div>
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
          {canAssign && (
            <button
              onClick={handleOpenAssignmentModal}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2"
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
              Phân công nhân viên
            </button>
          )}
          {canAssign && (
            <button
              onClick={handleOpenReassignmentModal}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 inline-flex items-center gap-2"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Điều động tạm thời
            </button>
          )}
          {canEdit && (
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2"
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
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10"
                />
              </svg>
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Main Information Grid - 2 Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.code}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${customer.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {customer.status === "ACTIVE"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tên khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.name}
                </p>
              </div>
              {customer.username && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
                  <p className="text-sm text-gray-900">{customer.username}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">
                  {customer.email || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-sm text-gray-900">{customer.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-gray-900">
                  {customer.createdAt ? formatDate(customer.createdAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-900">
                  {customer.updatedAt ? formatDate(customer.updatedAt) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thông tin doanh nghiệp */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin doanh nghiệp
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tên công ty</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer.company || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Mã số thuế</p>
              <p className="text-sm font-mono font-medium text-gray-900">
                {customer.taxCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Người liên hệ</p>
              <p className="text-sm text-gray-900">
                {customer.contactPerson || "N/A"}
              </p>
            </div>

            {customer.description && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {customer.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Card 3: Hợp đồng */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Hợp đồng</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={loadContracts}
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
            {canAddContract && (
              <button
                onClick={() => {
                  setContractForm((prev) => ({
                    ...prev,
                    customerId: id || "",
                    startDate: prev.serviceEffectiveFrom || prev.startDate,
                    serviceServiceType: "RECURRING",
                  }));
                  setShowAddContractModal(true);
                }}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 inline-flex items-center gap-1"
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
                Thêm hợp đồng
              </button>
            )}
          </div>
        </div>

        {loadingContracts ? (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
        ) : contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">Chưa có hợp đồng nào cho khách hàng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Mã HĐ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Loại HĐ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Dịch vụ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Thanh toán
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Mô tả
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(`/admin/contracts/${contract.id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        router.push(`/admin/contracts/${contract.id}`);
                    }}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">
                        {contract.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">
                        {contract.contractType === "ONE_TIME"
                          ? "Một lần"
                          : contract.contractType === "MONTHLY_FIXED"
                          ? "Hàng tháng (cố định)"
                          : contract.contractType === "MONTHLY_ACTUAL"
                          ? "Hàng tháng (thực tế)"
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {contract.services
                          ?.map((s: any) => s.title)
                          .join(", ") || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        <div>{formatDate(contract.startDate)}</div>
                        <div className="text-xs text-gray-500">
                          đến {formatDate(contract.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${contract.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : contract.paymentStatus === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {contract.paymentStatus === "PAID"
                          ? "Đã thanh toán"
                          : contract.paymentStatus === "PARTIAL"
                            ? "Thanh toán 1 phần"
                            : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {contract.description || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card X: Đánh giá của khách hàng (với nhân viên được phân công) */}
      {role !== 'QLV' && role !== 'EMPLOYEE' && (
        <>
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Đánh giá nhân viên</h3>
          <div>
            <button
              onClick={async () => {
                await loadAssignedEmployees();
                await loadContracts();
                setShowAddReviewModal(true);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              + Thêm đánh giá
            </button>
          </div>
        </div>

        {loadingCustomerReviews ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customerReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              Chưa có đánh giá của khách hàng liên quan tới nhân viên này
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã nhân viên
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hợp đồng
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bình luận
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerReviews.map((r: any, idx: number) => (
                  <tr
                    key={r.id || idx}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      r.id && router.push(`/admin/reviews/${r.id}`)
                    }
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter" && r.id)
                        router.push(`/admin/reviews/${r.id}`);
                    }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.employeeName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.employeeCode ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.contractId ?? "-"} - {r.contractDescription ?? ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{r.rating ?? "-"}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`w-4 h-4 ${r.rating >= s
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                              viewBox="0 0 20 20"
                              fill={r.rating >= s ? "currentColor" : "none"}
                              stroke={r.rating >= s ? "none" : "currentColor"}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.287 3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.784.57-1.84-.197-1.54-1.118l1.287-3.973a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L9.05 2.927z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.comment ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
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

      {/* Add Review Modal (customer adds review for employee) */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm đánh giá</h3>
              <button onClick={() => setShowAddReviewModal(false)} className="text-gray-500">Đóng</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Hợp đồng</label>
                <select
                  value={reviewForm.contractId}
                  onChange={async (e) => {
                    const newContractId = e.target.value;
                    setReviewForm({ ...reviewForm, contractId: newContractId, employeeId: "", assignmentId: "" });
                    await loadAssignmentsForContract(newContractId);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                >
                  <option value="">Chọn hợp đồng</option>
                  {contracts.map((c: any) => (
                    <option key={c.id} value={String(c.id)}>
                      HĐ #{c.id} - {c.description || c.services?.map((s: any) => s.title).join(", ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Nhân viên</label>
                <select
                  value={reviewForm.employeeId}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, employeeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                >
                  <option value="">Chọn nhân viên</option>
                  {loadingContractAssignments ? (
                    <option value="">Đang tải...</option>
                  ) : (
                    contractAssignments
                      .reduce((acc: any[], a: any) => {
                        if (!acc.find((x) => x.employeeId === a.employeeId)) acc.push(a);
                        return acc;
                      }, [])
                      .map((a: any, idx: number) => (
                        <option key={`${a.employeeId}-${idx}`} value={String(a.employeeId)}>
                          {a.employeeName || a.employeeId} - {a.employeeCode || ""}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Số điểm</label>
                <div className="flex items-center gap-2 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: v })}
                        className={`text-xl ${reviewForm.rating >= v ? "text-yellow-400" : "text-gray-300"}`}
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
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
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
                    if (!reviewForm.contractId || !reviewForm.employeeId || !reviewForm.rating) {
                      toast.error("Vui lòng chọn hợp đồng, nhân viên và số điểm");
                      return;
                    }
                    try {
                      setSavingReview(true);
                      const payload: any = {
                        contractId: Number(reviewForm.contractId),
                        employeeId: Number(reviewForm.employeeId),
                        rating: reviewForm.rating,
                        comment: reviewForm.comment,
                      };
                      // find assignment: prefer contractAssignments (assignments for selected contract)
                      let found: any = undefined;
                      if (contractAssignments && contractAssignments.length > 0) {
                        found = contractAssignments.find((a: any) => String(a.employeeId) === reviewForm.employeeId && (a.contractId ? String(a.contractId) === reviewForm.contractId : true));
                      }
                      // fallback: assignedEmployees might be grouped by contract (each item has .assignments)
                      if (!found && assignedEmployees && assignedEmployees.length > 0) {
                        const flattened: any[] = assignedEmployees[0] && assignedEmployees[0].assignments
                          ? assignedEmployees.flatMap((g: any) => g.assignments || [])
                          : assignedEmployees;
                        found = flattened.find((a: any) => String(a.employeeId) === reviewForm.employeeId && String(a.contractId) === reviewForm.contractId);
                      }
                      if (found) payload.assignmentId = found.id;

                      const res = await reviewService.create(payload);
                      if (res && (res.success === false)) {
                        toast.error(res.message || "Lỗi khi thêm đánh giá");
                      } else {
                        toast.success("Đã thêm đánh giá");
                        setShowAddReviewModal(false);
                        // reload reviews
                        try {
                          setLoadingCustomerReviews(true);
                          const r = await reviewService.getByCustomerId(Number(id));
                          setCustomerReviews(r || []);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setLoadingCustomerReviews(false);
                        }
                      }
                    } catch (err: any) {
                      console.error(err);
                      toast.error(err?.message || "Có lỗi");
                    } finally {
                      setSavingReview(false);
                    }
                  }}
                  disabled={savingReview}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  {savingReview ? "Đang thêm..." : "Thêm đánh giá"}
                </button>
              </div>
            </div>
          </div>
        </div>

      )}
        </>
      )}

      {/* Card 4: Nhân viên đang phụ trách */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Nhân viên đang phụ trách
          </h3>
          <div className="flex items-center gap-2">
            {/* Contract filter */}
            <select
              value={assignmentContractFilter}
              onChange={(e) => setAssignmentContractFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả hợp đồng</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  HĐ #{contract.id} -{" "}
                  {contract.description ||
                    contract.services?.map((s: any) => s.title).join(", ")}
                </option>
              ))}
            </select>

            {/* Month and Year filters */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Tháng 1</option>
              <option value={2}>Tháng 2</option>
              <option value={3}>Tháng 3</option>
              <option value={4}>Tháng 4</option>
              <option value={5}>Tháng 5</option>
              <option value={6}>Tháng 6</option>
              <option value={7}>Tháng 7</option>
              <option value={8}>Tháng 8</option>
              <option value={9}>Tháng 9</option>
              <option value={10}>Tháng 10</option>
              <option value={11}>Tháng 11</option>
              <option value={12}>Tháng 12</option>
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from(
                { length: 50 },
                (_, i) => new Date().getFullYear() - 5 + i
              ).map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>

            {/* Filters */}
            {/* <select
              value={filterAssignmentType}
              onChange={(e) => setFilterAssignmentType(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="FIXED_BY_CONTRACT">Cố định HĐ</option>
              <option value="FIXED_BY_DAY">Cố định ngày</option>
              <option value="TEMPORARY">Tạm thời</option>
            </select> */}

            {/* <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select> */}

            {/* <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="startDate_desc">Mới nhất</option>
              <option value="startDate_asc">Cũ nhất</option>
            </select> */}

            <button
              onClick={loadAllAssignedEmployeesForCustomer}
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {loadingAllAssignments ? (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
        ) : allAssignedEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm">Không có nhân viên phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="space-y-6">
            {allAssignedEmployees.map(
              (contractGroup: any, groupIdx: number) => (
                <div
                  key={`contract-${contractGroup.contractId}-${groupIdx}`}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Contract Header */}
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-blue-900">
                          Hợp đồng #{contractGroup.contractId}
                        </span>
                        <span className="text-sm text-blue-700 ml-2">
                          - {contractGroup.contractDescription || "N/A"}
                        </span>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {contractGroup.assignments?.length || 0} nhân viên
                      </span>
                    </div>
                  </div>

                  {/* Assignments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Mã phân công
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Mã NV
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Tên nhân viên
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Loại phân công
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Ngày bắt đầu
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                            Trạng thái
                          </th>
                          {canViewEmployee && (
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                              Lương
                            </th>
                          )}
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                            Ngày công
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                            Dự kiến
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(contractGroup.assignments || []).map(
                          (assignment: any) => (
                            <tr
                              key={assignment.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                if (!canViewEmployee) {
                                  return;
                                }
                                routerForEmployee(
                                  assignment.employeeId,
                                  assignment.id
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  router.push(
                                    `/admin/assignments/${assignment.id}`
                                  );
                              }}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                            >
                              <td className="px-4 py-3">
                                <span className="text-sm font-mono font-medium text-blue-600">
                                  {assignment.id}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-mono font-medium text-blue-600">
                                  {assignment.employeeCode}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-gray-900">
                                  {assignment.employeeName}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getAssignmentTypeBadge(
                                    assignment.assignmentType || ""
                                  )}`}
                                >
                                  {getAssignmentTypeLabel(
                                    assignment.assignmentType || ""
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-700">
                                  {formatDate(assignment.startDate)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${assignment.status === "SCHEDULED"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : assignment.status === "IN_PROGRESS"
                                      ? "bg-green-100 text-green-800"
                                      : assignment.status === "COMPLETED"
                                        ? "bg-blue-100 text-blue-800"
                                        : assignment.status === "TERMINATED"
                                          ? "bg-orange-100 text-orange-800"
                                          : assignment.status === "CANCELLED"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {assignment.status === "SCHEDULED"
                                    ? "Chưa bắt đầu"
                                    : assignment.status === "IN_PROGRESS"
                                      ? "Đang thực hiện"
                                      : assignment.status === "COMPLETED"
                                        ? "Hoàn thành"
                                        : assignment.status === "TERMINATED"
                                          ? "Kết thúc giữa chừng"
                                          : assignment.status === "CANCELLED"
                                            ? "Đã hủy"
                                            : (assignment.status || "N/A")}
                                </span>
                              </td>
                              {canViewEmployee && (
                                <td className="px-4 py-3 text-right">

                                  {role === 'CUSTOMER' ? (
                                    <div className="group relative flex items-center justify-center h-6  cursor-help">
                                      {/* Trạng thái 1: Dấu hoa thị (Mặc định hiện) */}
                                      <div className="flex items-center space-x-2 transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-95">
                                        <FontAwesomeIcon icon={SolidIcons.faEyeSlash} className="text-blue-600" />
                                        <span className="text-lg font-bold text-blue-600 leading-none tracking-widest">
                                          ********
                                        </span>
                                      </div>

                                      {/* Trạng thái 2: Dòng chữ thông báo (Hiện khi hover) */}
                                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
                                        Bạn không có quyền xem
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(assignment.salaryAtTime)}
                                    </span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {assignment.workDays} ngày
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {assignment.plannedDays} ngày
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Card 5: Lịch sử điều động */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Lịch sử điều động
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={historyContractFilter}
              onChange={(e) => {
                setHistoryContractFilter(e.target.value);
                setHistoryPage(0);
              }}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả hợp đồng</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  HĐ #{contract.id} -{" "}
                  {contract.description ||
                    contract.services?.map((s: any) => s.title).join(", ")}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadAssignmentHistories()}
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {loadingHistories ? (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
        ) : assignmentHistories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto mb-3 text-gray-300"
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
            <p className="text-sm">Chưa có lịch sử điều động nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignmentHistories.map((contractGroup: any, groupIdx: number) => (
              <div
                key={`contract-${contractGroup.contractId}-${groupIdx}`}
                className="border rounded-lg overflow-hidden"
              >
                {/* Contract Header */}
                <div className="bg-blue-50 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-blue-900">
                        Hợp đồng #{contractGroup.contractId}
                      </span>
                      <span className="text-sm text-blue-700 ml-2">
                        - {contractGroup.contractDescription || "N/A"}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {contractGroup.histories?.length || 0} lịch sử
                    </span>
                  </div>
                </div>

                {/* Histories Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Mã
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Người bị thay
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Người làm thay
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Ngày điều động
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Người tạo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Ngày tạo
                        </th>
                        {canEditEmployee && (
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                            Hành động
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(contractGroup.histories || []).map(
                        (history: any, idx: number) => (
                          <tr
                            key={`history-${history.id}-${idx}`}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <span className="text-sm font-mono font-medium text-blue-600">
                                #{history.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-900">
                                  {history.replacedEmployeeName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {history.replacedEmployeeId}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-900">
                                  {history.replacementEmployeeName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {history.replacementEmployeeId}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700">
                                {(history.reassignmentDates || []).map(
                                  (date: string, dIdx: number) => (
                                    <div key={`date-${dIdx}`}>
                                      {formatDate(date)}
                                    </div>
                                  )
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${history.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {history.status === "ACTIVE"
                                  ? "Đang áp dụng"
                                  : "Đã hoàn tác"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">
                                {history.createdByUsername}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">
                                {formatDate(history.createdAt)}
                              </span>
                            </td>
                            {canEditEmployee && (
                              <td className="px-4 py-3 text-center">
                                {history.status === "ACTIVE" ? (
                                  <button
                                    onClick={() =>
                                      handleOpenRollbackModal(history)
                                    }
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 inline-flex items-center gap-1"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-3 h-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                      />
                                    </svg>
                                    Hoàn tác
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Đã hoàn tác{" "}
                                    {history.rollbackAt
                                      ? `(${formatDate(history.rollbackAt)})`
                                      : ""}
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {historyTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hiển thị</span>
                  <select
                    value={historyPageSize}
                    onChange={(e) => {
                      setHistoryPageSize(Number(e.target.value));
                      setHistoryPage(0);
                    }}
                    className="text-sm px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm text-gray-600">kết quả</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setHistoryPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={historyPage === 0}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>

                  <span className="text-sm text-gray-600">
                    Trang {historyPage + 1} / {historyTotalPages}
                  </span>

                  <button
                    onClick={() =>
                      setHistoryPage((prev) =>
                        Math.min(historyTotalPages - 1, prev + 1)
                      )
                    }
                    disabled={historyPage >= historyTotalPages - 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Phân công nhân viên cho {customer.name}
              </h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
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

            {/* Assignment Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Thông tin phân công
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Loại phân công *
                  </label>
                  <select
                    value={assignmentForm.assignmentType}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        assignmentType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="FIXED_BY_CONTRACT">Phân công cố định</option>
                    <option value="FIXED_BY_DAY">
                      Phân công cố định theo ngày
                    </option>
                    <option value="SUPPORT">
                      Phân công hỗ trợ (chọn ngày)
                    </option>
                    <option value="TEMPORARY">Tạm thời</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Hợp đồng *
                  </label>
                  <select
                    value={assignmentForm.contractId || ""}
                    onChange={(e) => {
                      const newContractId = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setAssignmentForm({
                        ...assignmentForm,
                        contractId: newContractId,
                        dates: [], // reset support dates when contract changes
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn hợp đồng</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        HĐ #{contract.id} -{" "}
                        {contract.services?.map((s: any) => s.title).join(", ")} {" "}
                          ({formatDate(contract.startDate)} -{" "}
                          {formatDate(contract.endDate)}) - Hợp đồng {contract.contractType === "ONE_TIME"
                          ? "Một lần"
                          : contract.contractType === "MONTHLY_FIXED"
                          ? "Hàng tháng (cố định)"
                          : contract.contractType === "MONTHLY_ACTUAL"
                          ? "Hàng tháng (thực tế)"
                          : "N/A"}
                      </option>
                    ))}
                  </select>
                  {loadingContracts && (
                    <p className="text-xs text-gray-500 mt-1">
                      Đang tải danh sách hợp đồng...
                    </p>
                  )}
                  {!loadingContracts && contracts.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Chưa có hợp đồng nào cho khách hàng này
                    </p>
                  )}
                </div>
                {assignmentForm.assignmentType === "SUPPORT" && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Chọn ngày hỗ trợ
                    </label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={assignmentModalMonth}
                        onChange={(e) =>
                          setAssignmentModalMonth(Number(e.target.value))
                        }
                        className="text-sm px-2 py-1 border border-gray-300 rounded-lg"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <option key={m} value={m}>
                              Tháng {m}
                            </option>
                          )
                        )}
                      </select>
                      <select
                        value={assignmentModalYear}
                        onChange={(e) =>
                          setAssignmentModalYear(Number(e.target.value))
                        }
                        className="text-sm px-2 py-1 border border-gray-300 rounded-lg"
                      >
                        {Array.from(
                          { length: 15 },
                          (_, i) => new Date().getFullYear() - 2 + i
                        ).map((y) => (
                          <option key={y} value={y}>
                            Năm {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <table className="w-full border text-center mb-2">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-1 text-xs">CN</th>
                          <th className="p-1 text-xs">T2</th>
                          <th className="p-1 text-xs">T3</th>
                          <th className="p-1 text-xs">T4</th>
                          <th className="p-1 text-xs">T5</th>
                          <th className="p-1 text-xs">T6</th>
                          <th className="p-1 text-xs">T7</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const year = assignmentModalYear;
                          const month = assignmentModalMonth;
                          const d = new Date(year, month, 0); // last day of month
                          const days = d.getDate();
                          const selectedContract = contracts.find(
                            (c: any) =>
                              String(c.id) === String(assignmentForm.contractId)
                          );
                          
                          // Helper to extract date string in YYYY-MM-DD format
                          const toDateStr = (dateInput: any) => {
                            if (!dateInput) return null;
                            if (dateInput instanceof Date) {
                              return dateInput.toISOString().split("T")[0];
                            }
                            if (typeof dateInput === "string") {
                              return dateInput.split("T")[0];
                            }
                            return String(dateInput).split("T")[0];
                          };
                          
                          const contractStartStr = toDateStr(selectedContract?.startDate);
                          const contractEndStr = toDateStr(selectedContract?.endDate);
                          const rawWorkingDays: any[] =
                            (selectedContract &&
                              (selectedContract.workingDaysPerWeek ||
                                selectedContract.workingDays)) ||
                            [];
                          const nameToIndex: any = {
                            SUNDAY: 0,
                            MONDAY: 1,
                            TUESDAY: 2,
                            WEDNESDAY: 3,
                            THURSDAY: 4,
                            FRIDAY: 5,
                            SATURDAY: 6,
                          };
                          const allowedWeekdays: number[] = rawWorkingDays
                            .map((w: any) => {
                              if (typeof w === "number") return w;
                              if (typeof w === "string" && /^\d+$/.test(w))
                                return Number(w);
                              const up = String(w).toUpperCase();
                              return nameToIndex[up];
                            })
                            .filter((v: any) => typeof v === "number");
                          const firstWeekday = new Date(
                            year,
                            month - 1,
                            1
                          ).getDay();
                          const weeks: any[][] = [];
                          let week: any[] = [];
                          // Fill leading empty cells
                          for (let i = 0; i < firstWeekday; i++) {
                            week.push(<td key={`empty-${i}`} />);
                          }
                          for (let day = 1; day <= days; day++) {
                            const date = new Date(year, month - 1, day);
                            // Format date as YYYY-MM-DD without timezone conversion
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const weekday = date.getDay();
                            const inRange =
                              (!contractStartStr || dateStr >= contractStartStr) &&
                              (!contractEndStr || dateStr <= contractEndStr);
                            const allowedByWeekday =
                              allowedWeekdays.length === 0 ||
                              allowedWeekdays.includes(weekday);
                            const enabled = inRange && allowedByWeekday;
                            const selected =
                              assignmentForm.dates.includes(dateStr);
                            week.push(
                              <td key={dateStr} className={`p-0.5 border`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!enabled) return;
                                    const exists =
                                      assignmentForm.dates.includes(dateStr);
                                    setAssignmentForm({
                                      ...assignmentForm,
                                      dates: exists
                                        ? assignmentForm.dates.filter(
                                          (d) => d !== dateStr
                                        )
                                        : [...assignmentForm.dates, dateStr],
                                    });
                                  }}
                                  disabled={!enabled}
                                  className={`w-8 h-8 flex items-center justify-center text-sm border rounded ${selected
                                    ? "bg-blue-600 text-white border-blue-700"
                                    : enabled
                                      ? "bg-white text-gray-800 hover:bg-gray-50"
                                      : "bg-transparent text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                  {day}
                                </button>
                              </td>
                            );
                            if (week.length === 7) {
                              weeks.push(week);
                              week = [];
                            }
                          }
                          // Fill trailing empty cells
                          if (week.length > 0) {
                            while (week.length < 7) {
                              week.push(
                                <td key={`empty-end-${week.length}`} />
                              );
                            }
                            weeks.push(week);
                          }
                          return weeks.map((w, i) => <tr key={i}>{w}</tr>);
                        })()}
                      </tbody>
                    </table>
                    {assignmentForm.dates.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Chưa chọn ngày nào
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lương theo phân công (VND)
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.salaryAtTime}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setAssignmentForm({
                        ...assignmentForm,
                        salaryAtTime: rawValue ? formatNumber(rawValue) : "",
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập lương theo phân công (VD: 5.000.000)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phụ cấp (VND)
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.allowance}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setAssignmentForm({
                        ...assignmentForm,
                        allowance: rawValue ? formatNumber(rawValue) : "",
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ghi chú về phân công..."
                  />
                </div>
              </div>
            </div>

            {/* Search */}

            {/* Employee List (with month/year filter + pagination) */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={assignmentModalMonth}
                  onChange={(e) =>
                    setAssignmentModalMonth(Number(e.target.value))
                  }
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>

                <select
                  value={assignmentModalYear}
                  onChange={(e) =>
                    setAssignmentModalYear(Number(e.target.value))
                  }
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg"
                >
                  {Array.from(
                    { length: 15 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>

                <select
                  value={notAssignedEmploymentType}
                  onChange={(e) => {
                    setNotAssignedEmploymentType(e.target.value);
                    loadNotAssignedEmployees(0, notAssignedPage.pageSize);
                  }}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg"
                >
                  <option value="">Tất cả loại NV</option>
                  <option value="CONTRACT_STAFF">NV hợp đồng KH</option>
                  <option value="COMPANY_STAFF">NV văn phòng</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên..."
                  value={notAssignedKeyword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNotAssignedKeyword(v);
                    // immediate reload (could debounce)
                    loadNotAssignedEmployees(0, notAssignedPage.pageSize, v);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                />

                <button
                  onClick={() =>
                    loadNotAssignedEmployees(0, notAssignedPage.pageSize)
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {loadingNotAssigned ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {!notAssignedPage || notAssignedPage.content.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Không tìm thấy nhân viên
                    </p>
                  ) : (
                    notAssignedPage.content.map((employee: any) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={
                              assignmentForm.employeeId === Number(employee.id)
                            }
                            onChange={(e) => {
                              setAssignmentForm({
                                ...assignmentForm,
                                employeeId: e.target.checked
                                  ? Number(employee.id)
                                  : null,
                              });
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {employee.name?.charAt(0) ?? ""}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {employee.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {employee?.employeeCode} • {employee.phone}
                            </p>

                            <p className="text-xs text-gray-400">
                              {employee.employmentType === "COMPANY_STAFF"
                                ? "Nhân viên văn phòng / công ty"
                                : "Nhân viên làm theo hợp đồng khách hàng"}
                            </p>
                          </div>
                        </div>
                        {(role === "QLT1" || role === "QLT2") && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {employee.monthlySalary
                                ? formatCurrency(employee.monthlySalary) +
                                "/tháng"
                                : employee.dailySalary
                                  ? formatCurrency(employee.dailySalary) + "/ngày"
                                  : "N/A"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination controls */}
                {notAssignedPage.totalPages > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Trang {notAssignedPage.currentPage + 1} /{" "}
                      {Math.max(1, notAssignedPage.totalPages)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          loadNotAssignedEmployees(
                            Math.max(0, notAssignedPage.currentPage - 1),
                            notAssignedPage.pageSize
                          )
                        }
                        disabled={notAssignedPage.currentPage <= 0}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() =>
                          loadNotAssignedEmployees(
                            Math.min(
                              notAssignedPage.totalPages - 1,
                              notAssignedPage.currentPage + 1
                            ),
                            notAssignedPage.pageSize
                          )
                        }
                        disabled={
                          notAssignedPage.currentPage >=
                          notAssignedPage.totalPages - 1
                        }
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignEmployee}
                disabled={savingAssignment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingAssignment && (
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
                )}
                {savingAssignment ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa khách hàng
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
                  Mã khách hàng *
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng *
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
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
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
                  Tên công ty
                </label>
                <input
                  type="text"
                  value={editForm.company || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, company: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={editForm.taxCode || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, taxCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người liên hệ
                </label>
                <input
                  type="text"
                  value={editForm.contactPerson || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactPerson: e.target.value })
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
                  Mô tả
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm về khách hàng..."
                />
              </div>
            </div>

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
          </div>
        </div>
      )}

      {/* Temporary Reassignment Modal */}
      {showReassignmentModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Điều động nhân viên tạm thời
              </h2>
              <button
                onClick={() => setShowReassignmentModal(false)}
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

            {/* Reassignment Form */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Thông tin điều động
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Từ ngày *
                  </label>
                  <input
                    type="date"
                    value={reassignmentForm.fromDate}
                    onChange={(e) => {
                      const fromDate = e.target.value;
                      setReassignmentForm({
                        ...reassignmentForm,
                        fromDate,
                        selectedDates: [], // Reset selected dates when range changes
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Đến ngày *
                  </label>
                  <input
                    type="date"
                    value={reassignmentForm.toDate}
                    min={reassignmentForm.fromDate}
                    onChange={(e) => {
                      const toDate = e.target.value;
                      setReassignmentForm({
                        ...reassignmentForm,
                        toDate,
                        selectedDates: [], // Reset selected dates when range changes
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Chọn các ngày điều động *
                  </label>
                  {reassignmentForm.fromDate && reassignmentForm.toDate && (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {(() => {
                        const dates = [];
                        const start = new Date(reassignmentForm.fromDate);
                        const end = new Date(reassignmentForm.toDate);

                        for (
                          let d = new Date(start);
                          d <= end;
                          d.setDate(d.getDate() + 1)
                        ) {
                          const dateStr = d.toISOString().split("T")[0];
                          const dayName = [
                            "CN",
                            "T2",
                            "T3",
                            "T4",
                            "T5",
                            "T6",
                            "T7",
                          ][d.getDay()];
                          const displayDate = `${d.getDate()}/${d.getMonth() + 1
                            } (${dayName})`;

                          dates.push(
                            <label
                              key={dateStr}
                              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-purple-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={reassignmentForm.selectedDates.includes(
                                  dateStr
                                )}
                                onChange={(e) => {
                                  const newDates = e.target.checked
                                    ? [
                                      ...reassignmentForm.selectedDates,
                                      dateStr,
                                    ]
                                    : reassignmentForm.selectedDates.filter(
                                      (d) => d !== dateStr
                                    );
                                  setReassignmentForm({
                                    ...reassignmentForm,
                                    selectedDates: newDates.sort(),
                                  });
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-xs">{displayDate}</span>
                            </label>
                          );
                        }

                        return dates.length > 0 ? (
                          dates
                        ) : (
                          <p className="col-span-4 text-center text-gray-500 text-xs py-4">
                            Vui lòng chọn khoảng ngày hợp lệ
                          </p>
                        );
                      })()}
                    </div>
                  )}
                  {reassignmentForm.selectedDates.length > 0 && (
                    <p className="text-xs text-purple-600 mt-2">
                      Đã chọn {reassignmentForm.selectedDates.length} ngày
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lương tại thời điểm điều động (VND)
                  </label>
                  <input
                    type="text"
                    value={reassignmentForm.salaryAtTime}
                    onChange={(e) => {
                      const rawValue = handleNumberInput(e.target.value);
                      setReassignmentForm({
                        ...reassignmentForm,
                        salaryAtTime: rawValue ? formatNumber(rawValue) : "",
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lý do điều động
                  </label>
                  <textarea
                    value={reassignmentForm.description}
                    onChange={(e) =>
                      setReassignmentForm({
                        ...reassignmentForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="VD: Nhân viên A nghỉ ốm, B thay thế..."
                  />
                </div>
              </div>
            </div>

            {/* Search (moved into replacement column) */}

            {/* Two Columns for Selection */}
            <div className="grid grid-cols-2 gap-6">
              {/* Column 1: Nhân viên bị thay (đang phụ trách) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                  Nhân viên bị thay (đang phụ trách)
                  {reassignmentForm.replacedEmployeeId && (
                    <span className="ml-2 text-xs text-purple-600">
                      ✓ Đã chọn
                    </span>
                  )}
                </h3>
                {loadingAssignments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : assignedEmployees.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    Chưa có nhân viên phụ trách
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {assignedEmployees.map(
                      (contractGroup: any, groupIdx: number) => (
                        <div
                          key={`contract-replaced-${contractGroup.contractId}-${groupIdx}`}
                        >
                          {/* Contract Header */}
                          <div className="bg-blue-50 px-3 py-2 rounded-t-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-800">
                              Hợp đồng {contractGroup.contractId}:{" "}
                              {contractGroup.contractDescription}
                            </p>
                          </div>
                          {/* Assignments under this contract */}
                          <div className="space-y-2 border-x border-b border-blue-200 rounded-b-lg p-2">
                            {contractGroup.assignments &&
                              contractGroup.assignments.length > 0 ? (
                              contractGroup.assignments.map(
                                (assignment: any, aIdx: number) => (
                                  <label
                                    key={`replaced-${assignment.id ??
                                      assignment.employeeId ??
                                      aIdx
                                      }`}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${reassignmentForm.replacedAssignmentId ===
                                      assignment.id
                                      ? "border-purple-500 bg-purple-50"
                                      : "border-gray-200 hover:bg-gray-50"
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        reassignmentForm.replacedAssignmentId ===
                                        assignment.id
                                      }
                                      onChange={(e) => {
                                        console.log("Selected assignment:", {
                                          id: assignment.id,
                                          employeeId: assignment.employeeId,
                                          employeeName: assignment.employeeName,
                                          contractId: contractGroup.contractId,
                                          contractDescription:
                                            contractGroup.contractDescription,
                                        });
                                        setReassignmentForm({
                                          ...reassignmentForm,
                                          replacedEmployeeId: e.target.checked
                                            ? assignment.employeeId
                                            : null,
                                          replacedAssignmentId: e.target.checked
                                            ? assignment.id
                                            : null,
                                        });
                                      }}
                                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-semibold text-red-600">
                                        {assignment.employeeName?.charAt(0) ||
                                          "N"}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">
                                        {assignment.employeeName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {assignment.employeeCode}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {assignment.startDate && (
                                          <span>
                                            Phụ trách từ{" "}
                                            {formatDate(assignment.startDate)}
                                          </span>
                                        )}
                                        {assignment.workDays !== undefined &&
                                          assignment.workDays !== null && (
                                            <span className="ml-2">
                                              • {assignment.workDays} ngày
                                            </span>
                                          )}
                                      </p>
                                    </div>
                                  </label>
                                )
                              )
                            ) : (
                              <p className="text-center text-gray-400 py-4 text-xs">
                                Chưa có nhân viên
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Column 2: Nhân viên thay thế (không phụ trách) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                  Nhân viên thay thế
                  {reassignmentForm.replacementEmployeeId && (
                    <span className="ml-2 text-xs text-green-600">
                      ✓ Đã chọn
                    </span>
                  )}
                </h3>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchEmployee}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchEmployee(v);
                      // pass the value directly so loader uses current input (avoids stale state)
                      loadEmployeesPage(0, employeesPage.pageSize, v);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {employeesPageLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {!employeesPage || employeesPage.content.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 text-sm">
                          Không có nhân viên khả dụng
                        </p>
                      ) : (
                        employeesPage.content.map((employee: any) => (
                          <label
                            key={`replacement-${employee.id}`}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${reassignmentForm.replacementEmployeeId ===
                              Number(employee.id)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:bg-gray-50"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={
                                reassignmentForm.replacementEmployeeId ===
                                Number(employee.id)
                              }
                              onChange={(e) => {
                                setReassignmentForm({
                                  ...reassignmentForm,
                                  replacementEmployeeId: e.target.checked
                                    ? Number(employee.id)
                                    : null,
                                });
                              }}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-green-600">
                                {employee.name?.charAt(0) || "N"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {employee.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {employee.employeeCode}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    {/* Pagination controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Trang {employeesPage.currentPage + 1} /{" "}
                        {Math.max(1, employeesPage.totalPages)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            loadEmployeesPage(
                              Math.max(0, employeesPage.currentPage - 1),
                              employeesPage.pageSize
                            )
                          }
                          disabled={employeesPage.currentPage <= 0}
                          className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            loadEmployeesPage(
                              Math.min(
                                employeesPage.totalPages - 1,
                                employeesPage.currentPage + 1
                              ),
                              employeesPage.pageSize
                            )
                          }
                          disabled={
                            employeesPage.currentPage >=
                            employeesPage.totalPages - 1
                          }
                          className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReassignmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleTemporaryReassignment}
                disabled={savingReassignment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingReassignment && (
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
                )}
                {savingReassignment ? "Đang xử lý..." : "Xác nhận điều động"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {showAddContractModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Thêm hợp đồng mới
              </h2>
              <button
                onClick={() => setShowAddContractModal(false)}
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

            {/* Contract Section Header */}
            <div className="mt-6 mb-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Thông tin hợp đồng
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={contractForm.startDate}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      startDate: e.target.value,
                      // Keep serviceEffectiveFrom in sync with contract start date
                      serviceEffectiveFrom: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  value={contractForm.endDate}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hợp đồng *
                </label>
                <select
                  value={contractForm.contractType}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      contractType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ONE_TIME">Hợp đồng 1 lần (trọn gói)</option>
                  <option value="MONTHLY_FIXED">
                    Hợp đồng hàng tháng cố định
                  </option>
                  <option value="MONTHLY_ACTUAL">
                    Hợp đồng hàng tháng theo ngày thực tế
                  </option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày làm việc trong tuần
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "MONDAY", label: "Thứ 2" },
                    { value: "TUESDAY", label: "Thứ 3" },
                    { value: "WEDNESDAY", label: "Thứ 4" },
                    { value: "THURSDAY", label: "Thứ 5" },
                    { value: "FRIDAY", label: "Thứ 6" },
                    { value: "SATURDAY", label: "Thứ 7" },
                    { value: "SUNDAY", label: "CN" },
                  ].map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={contractForm.workingDaysPerWeek.includes(
                          day.value
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setContractForm({
                              ...contractForm,
                              workingDaysPerWeek: [
                                ...contractForm.workingDaysPerWeek,
                                day.value,
                              ],
                            });
                          } else {
                            setContractForm({
                              ...contractForm,
                              workingDaysPerWeek:
                                contractForm.workingDaysPerWeek.filter(
                                  (d) => d !== day.value
                                ),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán *
                </label>
                <select
                  value={contractForm.paymentStatus}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Chưa thanh toán</option>
                  <option value="PARTIAL">Thanh toán 1 phần</option>
                  <option value="PAID">Đã thanh toán</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hợp đồng
                </label>
                <textarea
                  value={contractForm.description}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hợp đồng dọn dẹp văn phòng"
                />
              </div>
            </div>

            {/* Service Section Header */}
            <div className="mb-6 pb-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Thông tin dịch vụ trong hợp đồng
              </h3>
              <p className="text-sm text-gray-500">
                Nhập thông tin dịch vụ mới cho hợp đồng
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên dịch vụ *
                </label>
                <input
                  type="text"
                  value={contractForm.serviceName}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      serviceName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Dọn dẹp văn phòng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá dịch vụ (VND) *
                </label>
                <input
                  type="text"
                  value={contractForm.servicePrice}
                  onChange={(e) => {
                    const rawValue = handleNumberInput(e.target.value);
                    if (rawValue === "") {
                      setContractForm({
                        ...contractForm,
                        servicePrice: "",
                        finalPrice: 0,
                      });
                      return;
                    }
                    const price = Number(rawValue) || 0;
                    const vatValue =
                      contractForm.serviceVat === ""
                        ? 0
                        : Number(contractForm.serviceVat);
                    setContractForm({
                      ...contractForm,
                      servicePrice: formatNumber(rawValue),
                      finalPrice: price + (price * vatValue) / 100,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập giá dịch vụ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={contractForm.serviceVat}
                  onChange={(e) => {
                    const vat =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    // Parse formatted price to get raw number
                    const priceStr = String(contractForm.servicePrice || "");
                    const rawPrice = parseFormattedNumber(priceStr);
                    const price = Number(rawPrice) || 0;
                    setContractForm({
                      ...contractForm,
                      serviceVat: e.target.value,
                      finalPrice: price + (price * vat) / 100,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập VAT (%)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày áp dụng giá
                </label>
                <input
                  type="date"
                  value={contractForm.serviceEffectiveFrom}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng giá (Giá dịch vụ + VAT) (VNĐ)
                </label>
                <input
                  type="text"
                  value={
                    contractForm.finalPrice
                      ? formatNumber(contractForm.finalPrice)
                      : ""
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-green-600"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả dịch vụ
                </label>
                <textarea
                  value={contractForm.serviceDescription}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      serviceDescription: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chi tiết về dịch vụ..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddContractModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddContract}
                disabled={savingContract}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingContract && (
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
                )}
                {savingContract ? "Đang thêm..." : "Thêm hợp đồng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Modal */}
      {showRollbackModal && selectedHistory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Xác nhận hoàn tác điều động
              </h2>
              <button
                onClick={() => setShowRollbackModal(false)}
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-yellow-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Thông tin điều động
                    </h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <p>
                        <strong>Người bị thay:</strong>{" "}
                        {selectedHistory.replacedEmployeeName} (
                        {selectedHistory.replacedEmployeeCode})
                      </p>
                      <p>
                        <strong>Người làm thay:</strong>{" "}
                        {selectedHistory.replacementEmployeeName} (
                        {selectedHistory.replacementEmployeeCode})
                      </p>
                      <p>
                        <strong>Ngày điều động:</strong>{" "}
                        {selectedHistory.reassignmentDates
                          .map((d) => formatDate(d))
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  Sau khi hoàn tác:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  <li>Chấm công của người làm thay sẽ bị xóa</li>
                  <li>Chấm công của người bị thay được khôi phục</li>
                  <li>Số ngày công được cập nhật lại</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRollbackModal(false)}
                disabled={rollingBack}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRollback}
                disabled={rollingBack}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {rollingBack ? (
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
                    Đang xử lý...
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
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                    Xác nhận hoàn tác
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
