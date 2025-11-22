"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mockContracts, mockCustomers } from "@/lib/mockData";
import { Contract } from "@/types";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const contract = useMemo(
    () => mockContracts.find((c) => c.id === contractId),
    [contractId]
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Contract | null>(null);

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

  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find((c) => c.id === customerId);
    return customer ? customer.name : "N/A";
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

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    setEditForm({ ...contract });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    alert("Đã cập nhật hợp đồng (mock)");
    setShowEditModal(false);
    setEditForm(null);
  };

  const handleDelete = () => {
    if (confirm("Xác nhận xóa hợp đồng này?")) {
      alert("Đã xóa hợp đồng (mock)");
      router.push("/admin/contracts");
    }
  };

  const status = getContractStatus(contract);
  const totalValue = contract.value * (1 + contract.vat / 100);

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
                  Hợp đồng {contract.contractNumber}
                </h1>
                <p className="text-gray-600">
                  Khách hàng: {getCustomerName(contract.customerId)}
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
                  Số hợp đồng
                </label>
                <p className="text-gray-900">{contract.contractNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Khách hàng
                </label>
                <p className="text-gray-900">
                  {getCustomerName(contract.customerId)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Giá trị hợp đồng
                </label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(contract.value)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  VAT
                </label>
                <p className="text-gray-900">{contract.vat}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tổng giá trị (bao gồm VAT)
                </label>
                <p className="text-blue-600 font-bold text-lg">
                  {formatCurrency(totalValue)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Trạng thái
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Ghi chú
                </label>
                <p className="text-gray-900">
                  {contract.notes || "Không có ghi chú"}
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
                  Số hợp đồng *
                </label>
                <input
                  type="text"
                  value={editForm.contractNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contractNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng *
                </label>
                <select
                  value={editForm.customerId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customerId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {mockCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị hợp đồng (VND) *
                </label>
                <input
                  type="number"
                  value={editForm.value}
                  onChange={(e) =>
                    setEditForm({ ...editForm, value: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT (%) *
                </label>
                <input
                  type="number"
                  value={editForm.vat}
                  onChange={(e) =>
                    setEditForm({ ...editForm, vat: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
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
