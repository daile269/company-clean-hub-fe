"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Contract, ContractDocument } from "@/types";
import contractService from "@/services/contractService";
import contractDocumentService from "@/services/contractDocumentService";
import serviceService from "@/services/serviceService";
import invoiceService, {
  Invoice,
  InvoiceCreateRequest,
} from "@/services/invoiceService";
import { apiService } from "@/services/api";
import ContractDocuments from "@/components/ContractDocuments";
import toast, { Toaster } from "react-hot-toast";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

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

  // Load contract details
  useEffect(() => {
    const loadContract = async () => {
      try {
        setLoading(true);
        const data = await contractService.getById(contractId);
        console.log("Loaded contract data:", data);
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
    if (!contract) return;
    setEditForm({ ...contract });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!contract || !editForm) return;

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
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("Không thể cập nhật hợp đồng");
    } finally {
      setSavingContract(false);
    }
  };

  const handleAddService = () => {
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
    setInvoiceForm({
      invoiceMonth: new Date().getMonth() + 1,
      invoiceYear: new Date().getFullYear(),
      notes: "",
    });
    setShowInvoiceModal(true);
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!contract) return;

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
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Không thể xóa hóa đơn");
    } finally {
      setDeletingInvoice(null);
    }
  };

  const handleSaveInvoice = async () => {
    if (!contract) return;

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
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Không thể tạo hóa đơn");
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
            {/* <button
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
            </button> */}
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
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      status.color === "green"
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
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      contract.paymentStatus === "PAID"
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

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(service.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {service.vat}%
                        </span>
                      </td>

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
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Hóa đơn ({invoices.length})
            </h3>
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
                      onClick={() => router.push(`/admin/contracts/${contract.id}/invoices/${invoice.id}`)}
                      onKeyDown={(e) => {
                        if ((e as any).key === "Enter")
                          router.push(`/admin/contracts/${contract.id}/invoices/${invoice.id}`);
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
      {showEditModal && editForm && (
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
                    editForm.workingDaysPerWeek &&
                    editForm.workingDaysPerWeek.length > 0
                      ? editForm.workingDaysPerWeek
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
      )}

      {/* Service Modal */}
      {showServiceModal && (
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
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && contract && (
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
      )}

      {/* Update Invoice Status Modal */}
      {showUpdateStatusModal && selectedInvoice && (
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
      )}
    </div>
  );
}
