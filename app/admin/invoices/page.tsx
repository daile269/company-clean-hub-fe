"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { apiService } from "@/services/api";
import invoiceService, { Invoice } from "@/services/invoiceService";
import { usePermission } from "@/hooks/usePermission";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialSearch = searchParams.get("keyword") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "0");
  const initialPageSize = Number(searchParams.get("pageSize") ?? "20");
  const initialMonth = searchParams.get("month")
    ? Number(searchParams.get("month"))
    : new Date().getMonth() + 1;
  const initialYear = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : new Date().getFullYear();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const canExport = usePermission("INVOICE_EXPORT");
  const canView = usePermission("INVOICE_VIEW");

  const [customerCode, setCustomerCode] = useState(initialSearch);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [month, setMonth] = useState<number>(initialMonth);
  const [year, setYear] = useState<number>(initialYear);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Sync State to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("keyword", searchKeyword);
    params.set("month", month.toString());
    params.set("year", year.toString());
    params.set("page", currentPage.toString());
    params.set("pageSize", pageSize.toString());

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [searchKeyword, month, year, currentPage, pageSize, pathname, router]);

  const searchEffectFirstRunRef = useRef(true);
  useEffect(() => {
    if (searchEffectFirstRunRef.current) {
      searchEffectFirstRunRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setSearchKeyword(customerCode);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [customerCode]);

  useEffect(() => {
    if (canView === true) {
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchKeyword, month, year, canView]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const pageParam = currentPage + 1; // API expects 1-based page
      const endpoint = `/invoices/filter?customerCode=${encodeURIComponent(
        searchKeyword || "",
      )}&month=${month}&year=${year}&page=${pageParam}&pageSize=${pageSize}`;

      const response = await apiService.get<any>(endpoint);

      if (!response.success) {
        throw new Error(response.message || "Lỗi khi tải hóa đơn");
      }

      const data = response.data;
      // Expecting { content, totalPages, totalElements }
      setInvoices((data && data.content) || []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (error: any) {
      console.error("Error loading invoices:", error);
      toast.error(error.message || "Không thể tải danh sách hóa đơn");
      setInvoices([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const [exportingAll, setExportingAll] = useState(false);

  if (canView === false) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
            <p className="text-sm text-gray-600 mt-2">
              Bạn không có quyền xem trang này.
            </p>
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

  const handleExportAll = async () => {
    if (
      !confirm(`Xuất ZIP cho tất cả khách hàng — Tháng ${month} / Năm ${year}?`)
    )
      return;
    try {
      setExportingAll(true);
      const toastId = toast.loading("Đang xuất file ZIP...");
      const blob = await invoiceService.exportAllExcel(month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hoa_don_Tat_ca_${month}-${year}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success("Đã xuất file ZIP");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xuất file ZIP");
    } finally {
      setExportingAll(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (date: Date | string | undefined) =>
    date ? new Intl.DateTimeFormat("vi-VN").format(new Date(date)) : "N/A";

  //   if (!canView) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="text-center">
  //           <p className="text-lg text-gray-600">Bạn không có quyền xem danh sách hóa đơn</p>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã khách hàng
            </label>
            <input
              type="text"
              placeholder="Ví dụ: KH001"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from(
                { length: 15 },
                (_, i) => new Date().getFullYear() - 2 + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:justify-end space-x-2">
            <button
              onClick={() => {
                setCurrentPage(0);
                loadInvoices();
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {" "}
              🔎 Lọc
            </button>
            {canExport && (
              <button
                onClick={handleExportAll}
                disabled={exportingAll}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {exportingAll ? "Đang xuất..." : " 📄Xuất ZIP (Tất cả)"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số HĐ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tháng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày cập nhật
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center">
                    Không tìm thấy hóa đơn
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.invoiceNumber || `#${inv.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.customerName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.invoiceMonth}/{inv.invoiceYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(inv.totalAmount ?? 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        switch (inv.status) {
                          case "UNPAID":
                            return (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Chưa thanh toán
                              </span>
                            );
                          case "PAID":
                            return (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Đã thanh toán
                              </span>
                            );
                          case "OVERDUE":
                            return (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Quá hạn
                              </span>
                            );
                          case "CANCELLED":
                            return (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Đã hủy
                              </span>
                            );
                          default:
                            return (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {inv.status || "N/A"}
                              </span>
                            );
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inv.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  <span className="font-medium">{totalElements}</span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i;
                    else if (currentPage < 3) pageNum = i;
                    else if (currentPage > totalPages - 4)
                      pageNum = totalPages - 5 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
