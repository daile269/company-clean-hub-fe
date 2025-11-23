"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Contract } from "@/types";
import contractService from "@/services/contractService";
import toast from "react-hot-toast";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contract>>({});

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  const formatDateInput = (date?: Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    if (!contract) return;
    setEditForm({ ...contract });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!contract || !editForm) return;
    
    try {
      // Calculate total and finalPrice before sending to API
      const basePrice = editForm.basePrice || 0;
      const vat = editForm.vat || 0;
      const extraCost = editForm.extraCost || 0;
      const discountCost = editForm.discountCost || 0;
      
      const total = basePrice + vat;
      const finalPrice = total + extraCost - discountCost;
      
      const updateData = {
        customerId: contract.customerId, // Keep original customerId
        serviceIds: contract.serviceIds, // Keep original serviceIds
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        basePrice: basePrice,
        vat: vat,
        total: total,
        extraCost: extraCost,
        discountCost: discountCost,
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
    }
  };

  const handleDelete = async () => {
    if (!contract) return;
    
    if (confirm("Xác nhận xóa hợp đồng này?")) {
      try {
        await contractService.delete(contract.id);
        toast.success("Đã xóa hợp đồng thành công");
        router.push("/admin/contracts");
      } catch (error) {
        console.error("Error deleting contract:", error);
        toast.error("Không thể xóa hợp đồng");
      }
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
              onClick={() => router.push("/admin/contracts")}
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
  const paymentStatusLabel = contract.paymentStatus === "PAID" ? "Đã thanh toán" :
                             contract.paymentStatus === "PARTIAL" ? "Thanh toán 1 phần" :
                             "Chưa thanh toán";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/admin/contracts")}
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
        <div className="bg-white rounded-lg shadow">
          {/* Header Section */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Hợp đồng #{contract.id}
                </h1>
                <p className="text-gray-600">
                  Khách hàng: {getCustomerName(contract.customerName)}
                </p>
              </div>
              <span
                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
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

          {/* Details Section */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin hợp đồng
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Mã hợp đồng
                </label>
                <p className="text-gray-900">#{contract.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Khách hàng
                </label>
                <p className="text-gray-900">
                  {getCustomerName(contract.customerName)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Giá cơ bản
                </label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(contract.basePrice)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  VAT
                </label>
                <p className="text-gray-900">{formatCurrency(contract.vat)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tổng (Base + VAT)
                </label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(contract.total)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Chi phí phát sinh
                </label>
                <p className="text-gray-900">
                  {formatCurrency(contract.extraCost)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Giảm giá
                </label>
                <p className="text-gray-900">
                  {formatCurrency(contract.discountCost)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Giá cuối cùng
                </label>
                <p className="text-blue-600 font-bold text-lg">
                  {formatCurrency(contract.finalPrice)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Trạng thái thanh toán
                </label>
                <p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : contract.paymentStatus === "PARTIAL"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {paymentStatusLabel}
                  </span>
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Dịch vụ
                </label>
                <div className="flex flex-wrap gap-2">
                  {contract.serviceNames && contract.serviceNames.length > 0 ? (
                    contract.serviceNames.map((serviceName, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {serviceName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Chưa có dịch vụ</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Trạng thái hợp đồng
                </label>
                <p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Ngày bắt đầu
                </label>
                <p className="text-gray-900">{formatDate(contract.startDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Ngày kết thúc
                </label>
                <p className="text-gray-900">{formatDate(contract.endDate)}</p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Mô tả
                </label>
                <p className="text-gray-900">
                  {contract.description || "Không có mô tả"}
                </p>
              </div>
            </div>
          </div>
        </div>
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
                  Giá cơ bản (VND) *
                </label>
                <input
                  type="number"
                  value={editForm.basePrice || 0}
                  onChange={(e) => {
                    const basePrice = Number(e.target.value);
                    const vat = editForm.vat || 0;
                    const extraCost = editForm.extraCost || 0;
                    const discountCost = editForm.discountCost || 0;
                    const total = basePrice + vat;
                    const finalPrice = total + extraCost - discountCost;
                    setEditForm({ 
                      ...editForm, 
                      basePrice, 
                      total,
                      finalPrice 
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT (VND) *
                </label>
                <input
                  type="number"
                  value={editForm.vat || 0}
                  onChange={(e) => {
                    const vat = Number(e.target.value);
                    const basePrice = editForm.basePrice || 0;
                    const extraCost = editForm.extraCost || 0;
                    const discountCost = editForm.discountCost || 0;
                    const total = basePrice + vat;
                    const finalPrice = total + extraCost - discountCost;
                    setEditForm({ 
                      ...editForm, 
                      vat, 
                      total,
                      finalPrice 
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi phí phát sinh (VND)
                </label>
                <input
                  type="number"
                  value={editForm.extraCost || 0}
                  onChange={(e) => {
                    const extraCost = Number(e.target.value);
                    const basePrice = editForm.basePrice || 0;
                    const vat = editForm.vat || 0;
                    const discountCost = editForm.discountCost || 0;
                    const total = basePrice + vat;
                    const finalPrice = total + extraCost - discountCost;
                    setEditForm({ 
                      ...editForm, 
                      extraCost,
                      finalPrice 
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm giá (VND)
                </label>
                <input
                  type="number"
                  value={editForm.discountCost || 0}
                  onChange={(e) => {
                    const discountCost = Number(e.target.value);
                    const basePrice = editForm.basePrice || 0;
                    const vat = editForm.vat || 0;
                    const extraCost = editForm.extraCost || 0;
                    const total = basePrice + vat;
                    const finalPrice = total + extraCost - discountCost;
                    setEditForm({ 
                      ...editForm, 
                      discountCost,
                      finalPrice 
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Tổng (Base + VAT)
                </label>
                <input
                  type="number"
                  value={editForm.total || 0}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá cuối cùng (VND)
                </label>
                <input
                  type="number"
                  value={editForm.finalPrice || 0}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-blue-600"
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
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
    </div>
  );
}
