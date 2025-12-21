"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Contract, ContractDocument } from "@/types";
import contractService from "@/services/contractService";
import contractDocumentService from "@/services/contractDocumentService";
import serviceService from "@/services/serviceService";
import { authService } from "@/services/authService";
import invoiceService, {
  Invoice,
  InvoiceCreateRequest,
} from "@/services/invoiceService";
import { apiService } from "@/services/api";
import attendanceService from "@/services/attendanceService";
import { assignmentService } from "@/services/assignmentService";
import { reviewService } from "@/services/reviewService";
import ContractDocuments from "@/components/ContractDocuments";
import toast, { Toaster } from "react-hot-toast";
import { usePermission } from "@/hooks/usePermission";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  const role = authService.getUserRole();

  const [contract, setContract] = useState<Contract | null>(null);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contract>>({});
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [savingService, setSavingService] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "" as any,
    vat: "" as any,
    effectiveFrom: new Date().toISOString().split("T")[0],
    serviceType: "RECURRING",
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceMonth: new Date().getMonth() + 1,
    invoiceYear: new Date().getFullYear(),
    notes: "",
  });
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: "PAID" as string,
    notes: "",
  });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsMonth, setAssignmentsMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [assignmentsYear, setAssignmentsYear] = useState<number>(
    new Date().getFullYear()
  );
  const [assignmentsStatus, setAssignmentsStatus] = useState<string>("");

  // Leave (deleted attendances) list + filters
  const [leaveMonth, setLeaveMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [leaveYear, setLeaveYear] = useState<number>(new Date().getFullYear());
  const [leaveEmployeeId, setLeaveEmployeeId] = useState<string>("");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveList, setLeaveList] = useState<any[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [savingLeave, setSavingLeave] = useState(false);
  const [leaveFormState, setLeaveFormState] = useState({
    date: new Date().toISOString().split("T")[0],
    employeeId: "",
    description: "",
  });

  // Reviews for this contract
  const [contractReviews, setContractReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    assignmentId: string;
    employeeId: string;
    rating: number;
    comment: string;
  }>({
    assignmentId: "",
    employeeId: "",
    rating: 5,
    comment: "",
  });
  const [savingReview, setSavingReview] = useState(false);

  // Derive employees for select from assignments (only employees of this contract)
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await (
          await import("@/services/employeeService")
        ).employeeService.getAll({ page: 0, pageSize: 200 });
        setEmployeeOptions(res.content || []);
      } catch (err) {
        console.error("Error loading employees:", err);
      }
    };

    loadEmployees();
  }, []);

  // Load deleted attendances (leave days)
  useEffect(() => {
    const loadDeletedAttendances = async () => {
      try {
        setLeaveLoading(true);
        const q = new URLSearchParams();
        if (contractId) q.append("contractId", String(contractId));
        if (leaveEmployeeId) q.append("employeeId", String(leaveEmployeeId));
        if (leaveMonth) q.append("month", String(leaveMonth));
        if (leaveYear) q.append("year", String(leaveYear));
        q.append("page", "0");
        q.append("pageSize", "50");

        const res = await attendanceService.getDeleted({
          contractId: contractId,
          employeeId: leaveEmployeeId || undefined,
          month: leaveMonth,
          year: leaveYear,
          page: 0,
          pageSize: 50,
        });
        setLeaveList(res.content || []);
      } catch (err) {
        console.error("Error loading deleted attendances:", err);
        setLeaveList([]);
      } finally {
        setLeaveLoading(false);
      }
    };

    if (contractId) loadDeletedAttendances();
  }, [contractId, leaveMonth, leaveYear, leaveEmployeeId]);

  // Load reviews for this contract
  useEffect(() => {
    const loadReviews = async () => {
      if (!contractId) return;
      try {
        setLoadingReviews(true);
        const list = await reviewService.getByContractId(Number(contractId));
        setContractReviews(list || []);
      } catch (err) {
        console.error(err, "Error loading contract reviews:");
        setContractReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [contractId]);

  // Permission checks
  const canView = usePermission("CONTRACT_VIEW");
  const canEdit = usePermission("CONTRACT_EDIT");
  const canCreate = usePermission("CONTRACT_CREATE");
  const canDelete = usePermission("CONTRACT_DELETE");
  const canAssign = usePermission("CUSTOMER_ASSIGN");
  const canManageCost = usePermission("COST_MANAGE");
  const canCreateService = usePermission("SERVICE_CREATE");
  const canEditService = usePermission("SERVICE_EDIT");
  // Load contract details
  useEffect(() => {
    const loadContract = async () => {
      try {
        setLoading(true);
        const data = await contractService.getById(contractId);
        setContract(data);
      } catch (error) {
        console.error("Error loading contract:", error);
        toast.error("Không thể tải thông tin hợp đồng");
      } finally {
        setLoading(false);
      }
    };
    loadContract();
  }, [contractId]);

  // Load contract documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const docs = await contractDocumentService.getContractDocuments(
          contractId
        );
        setDocuments(docs);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, [contractId]);

  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const invoiceList = await invoiceService.getByContractId(
          Number(contractId)
        );
        setInvoices(invoiceList);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, [contractId]);

  // Load assignments for this contract (selected month/year)
  const fetchAssignments = async (month: number, year: number) => {
    try {
      setAssignmentsLoading(true);
      const res = await assignmentService.getByContractMonthYear(
        Number(contractId),
        month,
        year,
        1,
        50,
        assignmentsStatus || undefined
      );
      setAssignments(res.content || []);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) fetchAssignments(assignmentsMonth, assignmentsYear);
  }, [contractId, assignmentsMonth, assignmentsYear, assignmentsStatus]);

  const getCustomerName = (customerName?: string) => {
    return customerName || "N/A";
  };

  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const daysUntilEnd = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (now < start) {
      return { status: "Chưa bắt đầu", color: "gray" };
    } else if (now > end) {
      return { status: "Hết hạn", color: "red" };
    } else if (daysUntilEnd <= 30) {
      return { status: "Sắp hết hạn", color: "yellow" };
    } else {
      return { status: "Đang thực hiện", color: "green" };
    }
  };

  const getAssignmentTypeLabel = (type?: string) => {
    if (!type) return "-";
    const map: Record<string, string> = {
      FIXED_BY_CONTRACT: "Cố định theo hợp đồng",
      FIXED_BY_DAY: "Cố định theo ngày",
      TEMPORARY: "Tạm thời",
      FIXED_BY_COMPANY: "Làm việc tại công ty",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  const getAssignmentStatusLabel = (status?: string) => {
    if (!status) return "-";
    switch (status) {
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "CANCELED":
        return "Đã hủy";
      case "PENDING":
        return "Chưa bắt đầu";
      case "COMPLETED":
        return "Hoàn thành";
      case "OVERDUE":
        return "Quá hạn";
      default:
        return status;
    }
  };

  const getAssignmentStatusColor = (status?: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const computeServicesBaseTotal = (services?: any[]) => {
    if (!services || services.length === 0) return 0;
    return services.reduce(
      (sum, s) => sum + (Number(s.baseAmount ?? s.price) || 0),
      0
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  const formatDateInput = (date?: Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

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

  const handleEdit = () => {
    if (!contract || !canEdit) return;
    setEditForm({ ...contract });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!contract || !editForm || !canEdit) return;

    try {
      setSavingContract(true);
      // Get current service IDs from contract.services
      const currentServiceIds =
        contract.services?.map((service) => service.id) || [];

      // Calculate finalPrice from services
      const finalPrice =
        contract.services?.reduce((sum, service) => {
          return sum + service.price + service.vat;
        }, 0) || 0;

      const updateData = {
        customerId: contract.customerId,
        serviceIds: currentServiceIds,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        workingDaysPerWeek:
          editForm.workingDaysPerWeek || contract.workingDaysPerWeek || [],
        contractType:
          editForm.contractType || contract.contractType || "ONE_TIME",
        finalPrice: finalPrice,
        paymentStatus: editForm.paymentStatus,
        description: editForm.description,
      };
      await contractService.update(contract.id, updateData);
      toast.success("Đã cập nhật hợp đồng thành công");
      setShowEditModal(false);
      // Reload contract data
      const updatedContract = await contractService.getById(contract.id);
      setContract(updatedContract);
    } catch (error: any) {
      console.error("Error updating contract:", error);
      toast.error(error.message || "Không thể cập nhật hợp đồng");
    } finally {
      setSavingContract(false);
    }
  };

  const handleDelete = async () => {
    if (!contract || !canDelete) return;

    if (confirm("Xác nhận xóa hợp đồng này?")) {
      try {
        await contractService.delete(contract.id);
        toast.success("Đã xóa hợp đồng thành công");
        router.push("/admin/contracts");
      } catch (error: any) {
        console.error("Error deleting contract:", error);
        toast.error(error.message || "Không thể xóa hợp đồng");
      }
    }
  };
  const handleAddService = () => {
    if (!canEdit) return;
    setEditingService(null);
    setServiceForm({
      title: "",
      description: "",
      price: "" as any,
      vat: "" as any,
      effectiveFrom: new Date().toISOString().split("T")[0],
      serviceType: "RECURRING",
    });
    setShowServiceModal(true);
  };

  const handleEditService = (service: any) => {
    if (!canEdit) return;
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description || "",
      price: service.price,
      vat: service.vat || 0,
      effectiveFrom:
        service.effectiveFrom || new Date().toISOString().split("T")[0],
      serviceType: service.serviceType || "RECURRING",
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!canEdit) return;
    // Parse formatted numbers correctly
    const rawPrice = parseFormattedNumber(String(serviceForm.price || ""));
    const servicePrice = Number(rawPrice) || 0;
    const serviceVat = serviceForm.vat === "" ? 0 : Number(serviceForm.vat);

    if (!serviceForm.title || servicePrice <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSavingService(true);
      if (editingService) {
        // Update existing service via contract endpoint
        await apiService.put(`/contracts/${contract?.id}/services`, {
          serviceId: editingService.id,
          title: serviceForm.title,
          description: serviceForm.description,
          price: servicePrice,
          vat: serviceVat,
          effectiveFrom: serviceForm.effectiveFrom,
          serviceType: serviceForm.serviceType,
        });
        toast.success("Đã cập nhật dịch vụ");
      } else {
        // Create new service first
        const newService = await serviceService.create({
          title: serviceForm.title,
          description: serviceForm.description,
          price: servicePrice,
          vat: serviceVat,
          effectiveFrom: serviceForm.effectiveFrom,
          serviceType: serviceForm.serviceType,
        });

        // Then add service to contract
        if (contract && newService.id) {
          await contractService.addServiceToContract(
            contract.id,
            newService.id
          );
        }

        toast.success("Đã thêm dịch vụ");
      }

      setShowServiceModal(false);

      // Reload contract data
      if (contract) {
        const updatedContract = await contractService.getById(contract.id);
        setContract(updatedContract);
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(
        editingService ? "Không thể cập nhật dịch vụ" : "Không thể thêm dịch vụ"
      );
    } finally {
      setSavingService(false);
    }
  };

  const handleCreateInvoice = () => {
    if (!canManageCost) return;
    setInvoiceForm({
      invoiceMonth: new Date().getMonth() + 1,
      invoiceYear: new Date().getFullYear(),
      notes: "",
    });
    setShowInvoiceModal(true);
  };
  const routerForEmployee = (id: string, assignmentId?: string) => {
    if (role === "CUSTOMER") {
      router.push(`/admin/employees/${id}`);
    } else {
      router.push(`/admin/assignments/${assignmentId}`);
    }
  };
  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!contract || !canManageCost) return;

    if (!confirm("Xác nhận xóa hóa đơn này?")) return;

    try {
      setDeletingInvoice(invoiceId);
      const toastId = toast.loading("Đang xóa hóa đơn...");
      await invoiceService.delete(invoiceId);
      toast.dismiss(toastId);
      toast.success("Đã xóa hóa đơn thành công");

      // Reload invoices
      const updatedInvoices = await invoiceService.getByContractId(
        Number(contract.id)
      );
      setInvoices(updatedInvoices);
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      toast.error(error.message || "Không thể xóa hóa đơn");
    } finally {
      setDeletingInvoice(null);
    }
  };

  const handleSaveInvoice = async () => {
    if (!contract || !canManageCost) return;

    try {
      setSavingInvoice(true);
      const invoiceData: InvoiceCreateRequest = {
        contractId: Number(contract.id),
        invoiceMonth: invoiceForm.invoiceMonth,
        invoiceYear: invoiceForm.invoiceYear,
        notes: invoiceForm.notes,
      };

      // Note: `actualWorkingDays` is handled server-side now; do not include from UI.

      await invoiceService.create(invoiceData);
      toast.success("Đã tạo hóa đơn thành công");
      setShowInvoiceModal(false);

      // Reload invoices
      const updatedInvoices = await invoiceService.getByContractId(
        Number(contract.id)
      );
      setInvoices(updatedInvoices);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.message || "Không thể tạo hóa đơn");
    } finally {
      setSavingInvoice(false);
    }
  };

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
      case "OVERDUE":
        return "Quá hạn";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateInvoiceStatus = (invoice: Invoice) => {
    if (!canManageCost) return;
    setSelectedInvoice(invoice);
    setStatusUpdateForm({
      status: invoice.status,
      notes: invoice.notes || "",
    });
    setShowUpdateStatusModal(true);
  };

  const handleSaveStatusUpdate = async () => {
    if (!selectedInvoice) return;

    try {
      setUpdatingStatus(true);
      await invoiceService.update(selectedInvoice.id, {
        status: statusUpdateForm.status,
        notes: statusUpdateForm.notes,
      });
      toast.success("Đã cập nhật trạng thái hóa đơn");
      setShowUpdateStatusModal(false);

      // Reload invoices
      if (contract) {
        const updatedInvoices = await invoiceService.getByContractId(
          Number(contract.id)
        );
        setInvoices(updatedInvoices);
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Không thể cập nhật trạng thái hóa đơn");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportExcel = async (invoiceId: number) => {
    try {
      const toastId = toast.loading("Đang xuất Excel...");
      const blob = await apiService.getFile(
        `/invoices/${invoiceId}/export/excel`
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const inv = invoices.find((i) => i.id === invoiceId);
      const sanitize = (str: string) => str.replace(/[\\/:*?"<>|]/g, "_");
      const filename =
        `Hóa đơn ` +
        `${sanitize(inv?.customerName || "Khách hàng")}_HĐ_` +
        `${sanitize(String(inv?.contractId || invoiceId))}_` +
        `${inv?.invoiceMonth || "MM"}-${inv?.invoiceYear || "YYYY"}.xlsx`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success("Đã xuất Excel");
    } catch (error) {
      console.error("Export Excel failed", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  if (!canView && role !== "CUSTOMER") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bạn không có quyền xem hợp đồng
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy hợp đồng
            </h2>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getContractStatus(contract);
  const paymentStatusLabel =
    contract.paymentStatus === "PAID"
      ? "Đã thanh toán"
      : contract.paymentStatus === "PARTIAL"
        ? "Thanh toán 1 phần"
        : "Chưa thanh toán";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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

          <div className="flex gap-3">
            {canManageCost && (
              <button
                onClick={handleCreateInvoice}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Xuất hóa đơn
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleEdit}
                className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
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
                onClick={handleDelete}
                className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Split Card 1 into two cards for better layout */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Thông tin hợp đồng
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Mã hợp đồng</p>
                  <p className="text-sm font-semibold text-gray-900">
                    #{contract.id}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">
                    Trạng thái hợp đồng
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.color === "green"
                      ? "bg-green-100 text-green-800"
                      : status.color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : status.color === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {status.status}
                  </span>
                </div>
              </div>

              {contract.contractNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Số hợp đồng</p>
                  <p className="text-sm font-mono font-medium text-gray-900">
                    {contract.contractNumber}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getCustomerName(contract.customerName)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(contract.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(contract.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Chi tiết hợp đồng
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Trạng thái thanh toán
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${contract.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : contract.paymentStatus === "PARTIAL"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {paymentStatusLabel}
                  </span>
                </div>

                {contract.contractType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loại hợp đồng</p>
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {contract.contractType === "ONE_TIME"
                        ? "Hợp đồng 1 lần (trọn gói)"
                        : contract.contractType === "MONTHLY_FIXED"
                          ? "Hợp đồng hàng tháng cố định"
                          : contract.contractType === "MONTHLY_ACTUAL"
                            ? "Hợp đồng hàng tháng theo ngày thực tế"
                            : contract.contractType}
                    </span>
                  </div>
                )}
              </div>

              {contract.workingDaysPerWeek &&
                contract.workingDaysPerWeek.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Ngày làm việc trong tuần
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {contract.workingDaysPerWeek.map((day: string) => (
                        <span
                          key={day}
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {day === "MONDAY"
                            ? "T2"
                            : day === "TUESDAY"
                              ? "T3"
                              : day === "WEDNESDAY"
                                ? "T4"
                                : day === "THURSDAY"
                                  ? "T5"
                                  : day === "FRIDAY"
                                    ? "T6"
                                    : day === "SATURDAY"
                                      ? "T7"
                                      : day === "SUNDAY"
                                        ? "CN"
                                        : day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-sm text-gray-900">
                    {contract.createdAt
                      ? formatDate(contract.createdAt)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm text-gray-900">
                    {contract.updatedAt
                      ? formatDate(contract.updatedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {contract.description && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {contract.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Dịch vụ */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Dịch vụ trong hợp đồng
            </h3>
            {canCreateService && (
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
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
                Thêm dịch vụ
              </button>
            )}
          </div>

          {contract.services && contract.services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VAT
                    </th>

                    {canEditService && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contract.services.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-900">
                          {service.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {(service as any).serviceType === "ONE_TIME"
                            ? "Một lần mỗi tháng"
                            : (service as any).serviceType === "RECURRING"
                              ? "Định kỳ hàng tháng"
                              : (service as any).serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {service.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex ">
                        {role !== "CUSTOMER" && !canManageCost ? (
                          <div className="group relative flex items-center justify-center h-6 cursor-help">
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
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(service.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {role !== "CUSTOMER" && !canManageCost ? (
                          <div className="group relative flex items-center justify-center h-6 overflow-hidden cursor-help">
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
                          <span className="text-sm font-medium text-gray-700">
                            {service.vat}%
                          </span>
                        )}
                      </td>
                      {canEditService && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
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
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Chưa có dịch vụ nào cho hợp đồng này</p>
            </div>
          )}
        </div>

        {/* Invoices Section */}
        {canManageCost && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Hóa đơn ({invoices.length})
              </h3>
              {canManageCost && (
                <button
                  onClick={handleCreateInvoice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
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
                  Tạo hóa đơn
                </button>
              )}
            </div>

            {loadingInvoices ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Chưa có hóa đơn nào cho hợp đồng này</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số HĐ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tháng/Năm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số ngày làm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          router.push(
                            `/admin/contracts/${contract.id}/invoices/${invoice.id}`
                          )
                        }
                        onKeyDown={(e) => {
                          if ((e as any).key === "Enter")
                            router.push(
                              `/admin/contracts/${contract.id}/invoices/${invoice.id}`
                            );
                        }}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/contracts/${contract.id}/invoices/${invoice.id}`}
                            className="text-sm font-mono font-medium text-blue-600"
                          >
                            {invoice.invoiceNumber || `#${invoice.id}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {invoice.invoiceMonth}/{invoice.invoiceYear}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {invoice.actualWorkingDays || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(
                              invoice.status
                            )}`}
                          >
                            {getInvoiceStatusLabel(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {invoice.notes || "—"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* Assignments Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Nhân viên phụ trách
            </h3>
            <div className="flex gap-2 items-center">
              <select
                value={assignmentsStatus}
                onChange={(e) => setAssignmentsStatus(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Chọn trạng thái</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELED">Đã hủy</option>
              </select>
              <select
                value={assignmentsMonth}
                onChange={(e) => setAssignmentsMonth(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>

              <select
                value={assignmentsYear}
                onChange={(e) => setAssignmentsYear(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => assignmentsYear - 2 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {assignmentsLoading ? (
            <div className="py-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-3 text-gray-500">
              Chưa có nhân viên phụ trách cho hợp đồng này
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
                      Mã NV
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày bắt đầu
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số ngày
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dự kiến
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lương
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phụ cấp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((a: any, idx: number) => (
                    <tr
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      // onClick={() => router.push(`/admin/assignments/${a.id}`)}
                      onClick={() => routerForEmployee(a.employeeId, a.id)}
                      onKeyDown={(e) => {
                        if ((e as any).key === "Enter")
                          router.push(`/admin/assignments/${a.id}`);
                      }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <Link
                            href={`/admin/assignments/${a.id}`}
                            className="font-medium text-blue-600"
                          >
                            {a.employeeName || a.name || "-"}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {a.position || a.role || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {a.employeeCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {getAssignmentTypeLabel(a.assignmentType || a.scope)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getAssignmentStatusColor(
                            a.status
                          )}`}
                        >
                          {getAssignmentStatusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {a.startDate ? formatDate(a.startDate) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {a.workDays ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {a.plannedDays ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {a.salaryAtTime
                          ? formatCurrency(Number(a.salaryAtTime))
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {a.additionalAllowance
                          ? formatCurrency(Number(a.additionalAllowance))
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Leave (deleted attendances) Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách ngày nghỉ phép
          </h3>
          <div className="flex gap-2 items-center">
            <select
              value={leaveEmployeeId}
              onChange={(e) => setLeaveEmployeeId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tất cả nhân viên</option>
              {assignments.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeName}{" "}
                  {emp.employeeCode ? `(${emp.employeeCode})` : ""}
                </option>
              ))}
            </select>

            <select
              value={leaveMonth}
              onChange={(e) => setLeaveMonth(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={leaveYear}
              onChange={(e) => setLeaveYear(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => leaveYear - 2 + i).map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              )}
            </select>
            {canAssign && (
              <button
                onClick={() => {
                  setLeaveFormState((s) => ({
                    ...s,
                    employeeId: leaveEmployeeId || (employeeOptions[0]?.id ?? ""),
                    date: new Date().toISOString().split("T")[0],
                    description: "",
                  }));
                  setShowLeaveModal(true);
                }}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                + Thêm ngày không làm
              </button>
            )}
          </div >
        </div >

        {
          leaveLoading ? (
            <div className="py-6 flex items-center justify-center" >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leaveList.length === 0 ? (
            <div className="py-3 text-gray-500">
              Chưa có ngày nghỉ phép cho bộ lọc này
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
                      Mã NV
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày nghỉ
                    </th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveList.map((it: any, idx: number) => (
                    <tr key={it.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {it.employeeName || it.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {it.employeeCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(() => {
                          const raw =
                            it.date || it.attendanceDate || it.deletedAt;
                          if (!raw) return "-";
                          const d = new Date(raw);
                          return isNaN(d.getTime())
                            ? String(raw)
                            : new Intl.DateTimeFormat("vi-VN").format(d);
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {it.description || it.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const dateValue =
                                it.date || it.attendanceDate || it.deletedAt;
                              const employeeIdValue =
                                it.employeeId ?? it.employeeId ?? undefined;

                              await attendanceService.restoreByDate({
                                date: dateValue,
                                contractId: Number(contractId),
                                employeeId: Number(employeeIdValue),
                              });

                              toast.success("Đã hoàn tác ngày nghỉ");

                              // Refresh list
                              try {
                                const refreshed =
                                  await attendanceService.getDeleted({
                                    contractId: contractId,
                                    employeeId: leaveEmployeeId || undefined,
                                    month: leaveMonth,
                                    year: leaveYear,
                                    page: 0,
                                    pageSize: 50,
                                  });
                                setLeaveList(refreshed.content || []);
                                // Refresh assignments (danh sách nhân viên phụ trách)
                                try {
                                  await fetchAssignments(
                                    assignmentsMonth,
                                    assignmentsYear
                                  );
                                } catch (err) {
                                  console.error(
                                    "Error refreshing assignments after restore:",
                                    err
                                  );
                                }
                              } catch (err) {
                                console.error(
                                  "Error refreshing leaves after restore:",
                                  err
                                );
                              }
                            } catch (err: any) {
                              console.error(err);
                              toast.error(
                                err?.message || "Lỗi khi hoàn tác ngày nghỉ"
                              );
                            }
                          }}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div >

      {/* Add Review Modal */}
      {
        showAddReviewModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Thêm đánh giá nhân viên</h3>
                <button
                  onClick={() => setShowAddReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Chọn nhân viên (phân công)
                  </label>
                  <select
                    value={reviewForm.assignmentId}
                    onChange={(e) => {
                      const aid = e.target.value;
                      const sel = assignments.find(
                        (a: any) => String(a.id) === aid
                      );
                      setReviewForm({
                        ...reviewForm,
                        assignmentId: aid,
                        employeeId: sel
                          ? String(sel.employeeId ?? sel.employeeId)
                          : "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Chọn phân công / nhân viên</option>
                    {assignments.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.employeeName || a.name || `ID:${a.employeeId}`}{" "}
                        {a.employeeCode ? `(${a.employeeCode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Đánh giá
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        title={`${s} sao`}
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: s })
                        }
                        className="text-2xl focus:outline-none"
                      >
                        {reviewForm.rating >= s ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.287 3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.784.57-1.84-.197-1.54-1.118l1.287-3.973a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L9.05 2.927z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.287 3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.784.57-1.84-.197-1.54-1.118l1.287-3.973a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L11.05 2.927z"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                    <span className="text-sm text-gray-600">
                      {reviewForm.rating} sao
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Bình luận
                  </label>
                  <textarea
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* removed createdBy field as requested */}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!contractId) return toast.error("Không có mã hợp đồng");
                    if (!reviewForm.assignmentId && !reviewForm.employeeId)
                      return toast.error("Vui lòng chọn nhân viên");
                    if (
                      !reviewForm.rating ||
                      reviewForm.rating < 1 ||
                      reviewForm.rating > 5
                    )
                      return toast.error("Điểm phải từ 1 tới 5");

                    try {
                      setSavingReview(true);
                      const payload: any = {
                        contractId: Number(contractId),
                        assignmentId: reviewForm.assignmentId
                          ? Number(reviewForm.assignmentId)
                          : undefined,
                        employeeId: reviewForm.employeeId
                          ? Number(reviewForm.employeeId)
                          : undefined,
                        rating: Number(reviewForm.rating),
                        comment: reviewForm.comment,
                      };

                      const res = await reviewService.create(payload);
                      if (res && res.success) {
                        toast.success("Đã thêm đánh giá");
                        setShowAddReviewModal(false);
                        // reload reviews
                        try {
                          setLoadingReviews(true);
                          const list = await reviewService.getByContractId(
                            Number(contractId)
                          );
                          setContractReviews(list || []);
                        } catch (err) {
                          console.error("Error loading reviews after add:", err);
                        } finally {
                          setLoadingReviews(false);
                        }
                      } else {
                        toast.error(res?.message || "Thêm đánh giá thất bại");
                      }
                    } catch (err: any) {
                      console.error("Error creating review:", err);
                      toast.error(err?.message || "Lỗi khi thêm đánh giá");
                    } finally {
                      setSavingReview(false);
                    }
                  }}
                  disabled={savingReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingReview ? "Đang lưu..." : "Lưu đánh giá"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Leave modal */}
      {
        showLeaveModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Thêm ngày nghỉ phép</h3>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ngày</label>
                  <input
                    type="date"
                    value={leaveFormState.date}
                    onChange={(e) =>
                      setLeaveFormState({
                        ...leaveFormState,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Nhân viên
                  </label>
                  <select
                    value={leaveFormState.employeeId}
                    onChange={(e) =>
                      setLeaveFormState({
                        ...leaveFormState,
                        employeeId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employeeOptions.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}{" "}
                        {emp.employeeCode ? `(${emp.employeeCode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Lý do
                  </label>
                  <textarea
                    rows={3}
                    value={leaveFormState.description}
                    onChange={(e) =>
                      setLeaveFormState({
                        ...leaveFormState,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700"
                  disabled={savingLeave}
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!leaveFormState.employeeId) {
                      toast.error("Vui lòng chọn nhân viên");
                      return;
                    }
                    try {
                      setSavingLeave(true);
                      const payload = {
                        date: leaveFormState.date,
                        contractId: Number(contractId),
                        employeeId: Number(leaveFormState.employeeId),
                        description: leaveFormState.description,
                      };

                      await attendanceService.deleteByDate(payload);

                      toast.success(
                        "Đã thêm ngày nghỉ phép của nhân viên thành công"
                      );
                      setShowLeaveModal(false);

                      // Refresh list
                      try {
                        const refreshed = await attendanceService.getDeleted({
                          contractId: contractId,
                          employeeId: leaveEmployeeId || undefined,
                          month: leaveMonth,
                          year: leaveYear,
                          page: 0,
                          pageSize: 50,
                        });
                        setLeaveList(refreshed.content || []);
                      } catch (err) {
                        console.error("Error refreshing leaves after add:", err);
                      }
                      // Also refresh assignments list after adding a leave
                      try {
                        await fetchAssignments(assignmentsMonth, assignmentsYear);
                      } catch (err) {
                        console.error(
                          "Error refreshing assignments after add:",
                          err
                        );
                      }
                    } catch (err: any) {
                      console.error(err);
                      toast.error(err?.message || "Lỗi khi thêm ngày nghỉ");
                    } finally {
                      setSavingLeave(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={savingLeave}
                >
                  {savingLeave ? "Đang xử lý..." : "Xác nhận ngày nghỉ"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Reviews Card (customer feedback) */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Đánh giá của khách hàng
          </h3>
          <div className="flex items-center gap-3">
            {/* <button
            onClick={async () => {
              try {
                setLoadingReviews(true);
                const list = await reviewService.getByContractId(Number(contractId));
                setContractReviews(list || []);
              } catch (err) {
                console.error('Error refreshing reviews:', err);
                toast.error('Không thể tải đánh giá');
              } finally {
                setLoadingReviews(false);
              }
            }}
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
          </button> */}
            <button
              onClick={() => {
                // default select first assignment if available
                const first = assignments[0];
                setReviewForm((s) => ({
                  ...s,
                  assignmentId: first ? String(first.id) : "",
                  employeeId: first
                    ? String(first.employeeId ?? first.employeeId)
                    : "",
                  rating: 5,
                  comment: "",
                }));
                setShowAddReviewModal(true);
              }}
              className="text-sm px-3 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2 hover:bg-green-700"
            >
              + Thêm đánh giá nhân viên
            </button>
          </div>
        </div>

        {loadingReviews ? (
          <div className="py-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contractReviews.length === 0 ? (
          <div className="py-4 text-gray-500">
            Chưa có đánh giá cho hợp đồng này
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
                    Điểm đánh giá
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
                {contractReviews.map((r: any, idx: number) => (
                  <tr
                    key={r.id || idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => r.id && router.push(`/admin/reviews/${r.id}`)}
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
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.rating ?? "-"}
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

      {/* Documents Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <ContractDocuments
          contractId={contractId}
          documents={documents}
          onRefresh={async () => {
            try {
              const docs = await contractDocumentService.getContractDocuments(
                contractId
              );
              setDocuments(docs);
            } catch (error) {
              console.error("Error refreshing documents:", error);
            }
          }}
        />
      </div>
      {/* Edit Modal */}
      {
        showEditModal && editForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chỉnh sửa hợp đồng
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
                    Mã hợp đồng
                  </label>
                  <input
                    type="text"
                    value={editForm.id || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khách hàng
                  </label>
                  <input
                    type="text"
                    value={editForm.customerName || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái thanh toán *
                  </label>
                  <select
                    value={editForm.paymentStatus || "PENDING"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentStatus: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">Chưa thanh toán</option>
                    <option value="PARTIAL">Thanh toán 1 phần</option>
                    <option value="PAID">Đã thanh toán</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá cuối cùng (VND)
                  </label>
                  <input
                    type="number"
                    value={contract?.finalPrice || 0}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formatDateInput(editForm.startDate)}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        startDate: new Date(e.target.value),
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
                    value={formatDateInput(editForm.endDate)}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        endDate: new Date(e.target.value),
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
                    value={editForm.contractType || "ONE_TIME"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contractType: e.target.value })
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày làm việc trong tuần
                  </label>
                  <input
                    type="text"
                    value={
                      (editForm.workingDaysPerWeek ?? []).length > 0
                        ? (editForm.workingDaysPerWeek ?? [])
                          .map((day: string) =>
                            day === "MONDAY"
                              ? "T2"
                              : day === "TUESDAY"
                                ? "T3"
                                : day === "WEDNESDAY"
                                  ? "T4"
                                  : day === "THURSDAY"
                                    ? "T5"
                                    : day === "FRIDAY"
                                      ? "T6"
                                      : day === "SATURDAY"
                                        ? "T7"
                                        : day === "SUNDAY"
                                          ? "CN"
                                          : day
                          )
                          .join(", ")
                        : "Chưa có dữ liệu"
                    }
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={savingContract}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingContract}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingContract ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Service Modal */}
      {
        showServiceModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </h2>
                <button
                  onClick={() => setShowServiceModal(false)}
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
                    Tên dịch vụ *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên dịch vụ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại dịch vụ *
                    </label>
                    <select
                      value={serviceForm.serviceType}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          serviceType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="RECURRING">Định kỳ (RECURRING)</option>
                      <option value="ONE_TIME">Một lần (ONE_TIME)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày áp dụng giá *
                    </label>
                    <input
                      type="date"
                      value={serviceForm.effectiveFrom}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          effectiveFrom: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá dịch vụ (VND) *
                    </label>
                    <input
                      type="text"
                      value={serviceForm.price}
                      onChange={(e) => {
                        const rawValue = handleNumberInput(e.target.value);
                        if (rawValue === "") {
                          setServiceForm({ ...serviceForm, price: "" });
                          return;
                        }
                        setServiceForm({
                          ...serviceForm,
                          price: formatNumber(rawValue),
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
                      value={serviceForm.vat}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, vat: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập VAT (%)"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổng giá (Price + VAT)
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      const rawPrice = parseFormattedNumber(
                        String(serviceForm.price || "")
                      );
                      const price = Number(rawPrice) || 0;
                      const vat =
                        serviceForm.vat === "" ? 0 : Number(serviceForm.vat);
                      const total = price + (price * vat) / 100;
                      return total ? formatNumber(total) : "";
                    })()}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mô tả dịch vụ"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowServiceModal(false)}
                  disabled={savingService}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveService}
                  disabled={savingService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingService ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {editingService ? "Lưu thay đổi" : "Thêm dịch vụ"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Invoice Modal */}
      {
        showInvoiceModal && contract && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tạo hóa đơn mới
                </h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Hợp đồng:</strong> #{contract.id} -{" "}
                    {contract.customerName}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Loại:</strong>{" "}
                    {contract.contractType === "ONE_TIME"
                      ? "Hợp đồng 1 lần (trọn gói)"
                      : contract.contractType === "MONTHLY_FIXED"
                        ? "Hợp đồng hàng tháng cố định"
                        : "Hợp đồng hàng tháng theo ngày thực tế"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng *
                    </label>
                    <select
                      value={invoiceForm.invoiceMonth}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoiceMonth: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            Tháng {month}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm *
                    </label>
                    <input
                      type="number"
                      value={invoiceForm.invoiceYear}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoiceYear: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="2020"
                      max="2100"
                    />
                  </div>
                </div>

                {/* actualWorkingDays removed — handled on backend now */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập ghi chú cho hóa đơn..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  disabled={savingInvoice}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveInvoice}
                  disabled={savingInvoice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Tạo hóa đơn
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Update Invoice Status Modal */}
      {
        showUpdateStatusModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cập nhật trạng thái hóa đơn
                </h2>
                <button
                  onClick={() => setShowUpdateStatusModal(false)}
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Hóa đơn:</strong>{" "}
                    {selectedInvoice.invoiceNumber || `#${selectedInvoice.id}`}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Tháng/Năm:</strong> {selectedInvoice.invoiceMonth}/
                    {selectedInvoice.invoiceYear}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Tổng tiền:</strong>{" "}
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái *
                  </label>
                  <select
                    value={statusUpdateForm.status}
                    onChange={(e) =>
                      setStatusUpdateForm({
                        ...statusUpdateForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UNPAID">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="OVERDUE">Quá hạn</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={statusUpdateForm.notes}
                    onChange={(e) =>
                      setStatusUpdateForm({
                        ...statusUpdateForm,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập ghi chú cập nhật (VD: Đã thanh toán qua chuyển khoản)..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowUpdateStatusModal(false)}
                  disabled={updatingStatus}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveStatusUpdate}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Cập nhật
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
