"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import invoiceService from "@/services/invoiceService";
import { apiService } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: "UNPAID", notes: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(false);
  const canExport = usePermission("INVOICE_EXPORT");
  const canEdit = usePermission("INVOICE_EDIT");
  const canDelete = usePermission("INVOICE_DELETE");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await invoiceService.getById(Number(invoiceId));
        setInvoice(data);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) load();
  }, [invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "-";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    } catch {
      return String(date);
    }
  };

  const translateStatus = (s?: string) => {
    if (!s) return "-";
    const st = String(s).toUpperCase();
    switch (st) {
      case "UNPAID":
        return "Chưa thanh toán";
      case "PAID":
        return "Đã thanh toán";
      case "OVERDUE":
        return "Quá hạn";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return s;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-semibold">Không tìm thấy hóa đơn</h2>
            <button
              className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => router.back()}
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hóa đơn #{invoice.id}</h1>
            <p className="text-sm text-gray-600">{invoice.customerName} • HĐ #{invoice.contractId ?? "-"}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => router.back()}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  setStatusForm({ status: invoice?.status || "UNPAID", notes: invoice?.notes || "" });
                  setShowStatusModal(true);
                }}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M11 12h6M11 19h6M4 7h.01M4 12h.01M4 17h.01" />
                </svg>
                Cập nhật trạng thái
              </button>
            )}
            {canExport && (
              <button
                onClick={async () => {
                  try {
                    const toastId = toast.loading("Đang xuất Excel...");
                    const blob = await invoiceService.exportExcel(invoice.id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const sanitize = (str: string) => (str || "").replace(/[\\/:*?"<>|]/g, "_");
                    const filename = `Hóa đơn ${sanitize(invoice.customerName || "Khách hàng")}_HĐ_${sanitize(String(invoice.contractId || invoice.id))}_${invoice.invoiceMonth || "MM"}-${invoice.invoiceYear || "YYYY"}.xlsx`;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast.dismiss(toastId);
                    toast.success("Đã xuất Excel");
                  } catch (err) {
                    console.error(err);
                    toast.error("Không thể xuất file Excel");
                  }
                }}
                className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 inline-flex items-center"
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h6l2 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7V3.5L18.5 9H15a1 1 0 01-1-1z" />
              </svg>
                Xuất Excel
              </button>
            )}
            {canDelete && (
              <button
                onClick={async () => {
                  if (!confirm("Xác nhận xóa hóa đơn này?")) return;
                  try {
                    setDeletingInvoice(true);
                    await invoiceService.delete(invoice.id);
                    toast.success("Đã xóa hóa đơn");
                    router.push(`/admin/invoices`);
                  } catch (err) {
                    console.error(err);
                    toast.error("Không thể xóa hóa đơn");
                  } finally {
                    setDeletingInvoice(false);
                  }
                }}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 inline-flex items-center"
                disabled={deletingInvoice}
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10" />
              </svg>
                {deletingInvoice ? "Đang xóa..." : "Xóa"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Thông tin khách hàng</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Tên</div>
                <div className="font-medium">{invoice.customerName || "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Số điện thoại</div>
                <div>{invoice.customerPhone || "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Địa chỉ</div>
                <div className="text-right max-w-xs break-words">{invoice.customerAddress || "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">MST</div>
                <div>{invoice.customerTaxCode || "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Số ngày làm việc</div>
                <div>{invoice.actualWorkingDays || "-"}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Tóm tắt hóa đơn</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Tháng/Năm</div>
                <div>{invoice.invoiceMonth}/{invoice.invoiceYear}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Loại hóa đơn</div>
                <div>{invoice.invoiceType}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Ngày tạo</div>
                <div>{formatDate(invoice.createdAt)}</div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">Tổng cơ bản</div>
                  <div className="font-medium">{formatCurrency(invoice.subtotal)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">VAT</div>
                  <div className="font-medium">{formatCurrency(invoice.vatAmount)}</div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm text-gray-500">Tổng cộng</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(invoice.totalAmount)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Trạng thái & Ghi chú</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Trạng thái</div>
                <div className="font-medium">{translateStatus(invoice.status)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Người tạo</div>
                <div>{invoice.createdByUsername || "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-gray-500">Ghi chú</div>
                <div className="text-right max-w-xs break-words">{invoice.notes || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {showStatusModal && invoice && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cập nhật trạng thái</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Trạng thái</label>
                  <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} className="w-full px-3 py-2 border rounded">
                    <option value="UNPAID">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="OVERDUE">Quá hạn</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={statusForm.notes} onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowStatusModal(false)} className="px-3 py-1 border rounded text-sm">Hủy</button>
                <button
                  onClick={async () => {
                    try {
                      setUpdatingStatus(true);
                      await invoiceService.update(invoice.id, { status: statusForm.status, notes: statusForm.notes });
                      toast.success("Đã cập nhật trạng thái hóa đơn");
                      setShowStatusModal(false);
                      const updated = await invoiceService.getById(Number(invoice.id));
                      setInvoice(updated);
                    } catch (err) {
                      console.error(err);
                      toast.error("Không thể cập nhật trạng thái");
                    } finally {
                      setUpdatingStatus(false);
                    }
                  }}
                  disabled={updatingStatus}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingStatus ? "Đang xử lý..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Chi tiết hóa đơn</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">#</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">Dịch vụ</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">Loại</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">Đơn giá</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">Số lượng</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">Cơ bản</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">VAT</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">Tiền VAT</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500">Tổng</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.invoiceLines?.map((line: any, idx: number) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{line.title}</td>
                    <td className="px-4 py-2">{line.serviceType === "ONE_TIME" ? "Một lần" : line.serviceType === "RECURRING" ? "Định kỳ" : line.serviceType}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(line.price)}</td>
                    <td className="px-4 py-2 text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(line.baseAmount)}</td>
                    <td className="px-4 py-2 text-right">{line.vat}%</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(line.vatAmount)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(line.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
