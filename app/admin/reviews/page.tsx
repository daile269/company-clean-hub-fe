"use client";
import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { reviewService, Review } from "@/services/reviewService";
import { permissionService } from "@/services/permissionService";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import contractService from "@/services/contractService";
import { assignmentService } from "@/services/assignmentService";
import { customerService } from "@/services/customerService";
import { employeeService } from "@/services/employeeService";

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialPage = Number(searchParams.get("page") ?? "0");
  const initialPageSize = Number(searchParams.get("pageSize") ?? "20");
  const initialFilterContractId = searchParams.get("filterContractId") ?? "";
  const initialFilterAssignmentId =
    searchParams.get("filterAssignmentId") ?? "";
  const initialFilterCustomerId = searchParams.get("filterCustomerId") ?? "";
  const initialFilterEmployeeId = searchParams.get("filterEmployeeId") ?? "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filterContractId, setFilterContractId] = useState<string>(
    initialFilterContractId,
  );
  const [filterAssignmentId, setFilterAssignmentId] = useState<string>(
    initialFilterAssignmentId,
  );
  const [filterCustomerId, setFilterCustomerId] = useState<string>(
    initialFilterCustomerId,
  );
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>(
    initialFilterEmployeeId,
  );

  const [contractOptions, setContractOptions] = useState<any[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getAll({
        contractId: filterContractId ? Number(filterContractId) : undefined,
        assignmentId: filterAssignmentId
          ? Number(filterAssignmentId)
          : undefined,
        customerId: filterCustomerId ? Number(filterCustomerId) : undefined,
        employeeId: filterEmployeeId ? Number(filterEmployeeId) : undefined,
        page,
        pageSize,
      });
      setReviews(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
      // handle 403 from backend
      const status = error?.response?.status || error?.status;
      if (status === 403) {
        setForbidden(true);
        return;
      }
      toast.error(error?.message || "Không thể tải đánh giá");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync State to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterContractId) params.set("filterContractId", filterContractId);
    if (filterAssignmentId)
      params.set("filterAssignmentId", filterAssignmentId);
    if (filterCustomerId) params.set("filterCustomerId", filterCustomerId);
    if (filterEmployeeId) params.set("filterEmployeeId", filterEmployeeId);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [
    filterContractId,
    filterAssignmentId,
    filterCustomerId,
    filterEmployeeId,
    page,
    pageSize,
    pathname,
    router,
  ]);

  useEffect(() => {
    // If user lacks permission, mark forbidden and skip loading
    if (!permissionService.hasPermission("REVIEW_VIEW_ALL")) {
      setForbidden(true);
      return;
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    filterContractId,
    filterAssignmentId,
    filterCustomerId,
    filterEmployeeId,
  ]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        // don't load options if user is forbidden
        if (forbidden) return;
        const [cRes, aRes, cuRes, eRes] = await Promise.all([
          contractService.getAll({ keyword: "", page: 0, pageSize: 200 }),
          assignmentService.getAll({ page: 0, pageSize: 200 }),
          customerService.getAll({ page: 0, pageSize: 200 }),
          employeeService.getAll({ page: 0, pageSize: 200 }),
        ]);

        setContractOptions(cRes.content || []);
        setAssignmentOptions(aRes.content || []);
        setCustomerOptions(cuRes.content || []);
        setEmployeeOptions(eRes.content || []);
      } catch (err) {
        console.error("Error loading filter options:", err);
      }
    };

    loadOptions();
  }, []);

  const handleFilter = () => {
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      setDeletingId(id);
      const res = await reviewService.delete(id);
      if (res.success) {
        toast.success("Đã xóa đánh giá");
        // reload
        await load();
      } else {
        toast.error(res.message || "Xóa thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error?.message || "Có lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };
  const getReviewerRoleLabel = (role?: string) => {
    if (!role) return undefined;
    switch (role) {
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
        return role;
    }
  };
  // If forbidden, render an early no-access message to avoid calling APIs
  if (forbidden) {
    return (
      <div className="p-6">
        <div className="min-h-[240px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600">
              Bạn không có quyền xem trang này (403).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-8 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Chọn hợp đồng
          </label>
          <select
            value={filterContractId}
            onChange={(e) => setFilterContractId(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Tất cả</option>
            {contractOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractNumber ?? c.id}{" "}
                {c.customerName ? `- ${c.customerName}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Chọn khách hàng
          </label>
          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Tất cả</option>
            {customerOptions.map((cu: any) => (
              <option key={cu.id} value={cu.id}>
                {cu.name ?? cu.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Chọn nhân viên
          </label>
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Tất cả</option>
            {employeeOptions.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.name ?? emp.id}{" "}
                {emp.employeeCode ? `(${emp.employeeCode})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={handleFilter}
            className="px-3 py-2 bg-blue-600 text-white rounded inline-flex items-center gap-2"
          >
            🔎Lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Chưa có đánh giá</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">STT</th>
                  <th className="py-2">Nhân viên</th>
                  <th className="py-2">Khách hàng</th>
                  <th className="py-2">Điểm</th>
                  <th className="py-2">Bình luận</th>
                  <th className="py-2">Người đánh giá</th>
                  <th className="py-2">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <tr
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      r.id && router.push(`/admin/reviews/${r.id}`)
                    }
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter" && r.id)
                        router.push(`/admin/reviews/${r.id}`);
                    }}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2">{page * pageSize + idx + 1}</td>
                    <td className="py-2">
                      {r.employeeName ?? r.employeeId ?? "-"}
                    </td>
                    <td className="py-2">
                      {r.customerName ?? r.customerId ?? "-"}
                    </td>
                    <td className="py-2">{r.rating ?? "-"}</td>
                    <td className="py-2">{r.comment ?? "-"}</td>
                    <td className="py-2">
                      {r.reviewerName ?? "-"} -{" "}
                      {r.reviewerRole
                        ? getReviewerRoleLabel(r.reviewerRole)
                        : ""}
                    </td>
                    <td className="py-2">
                      {r.createdAt
                        ? new Intl.DateTimeFormat("vi-VN").format(
                            new Date(r.createdAt),
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages || 1} (Tổng {totalElements})
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min((totalPages || 1) - 1, page + 1))}
              disabled={page >= (totalPages || 1) - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
