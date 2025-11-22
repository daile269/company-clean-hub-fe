"use client";
import { useState } from "react";
import { mockContracts, mockCustomers } from "@/lib/mockData";
import { Contract } from "@/types";

export default function ContractsPage() {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find((c) => c.id === customerId);
    return customer?.name || "N/A";
  };

  const filteredContracts = contracts.filter((contract) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = getCustomerName(contract.customerId).toLowerCase();
    return (
      contract.contractNumber.toLowerCase().includes(searchLower) ||
      customerName.includes(searchLower) ||
      contract.description?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const endDate = new Date(contract.endDate);
    const startDate = new Date(contract.startDate);

    if (now < startDate) return { status: "Chưa bắt đầu", color: "gray" };
    if (now > endDate) return { status: "Hết hạn", color: "red" };
    
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) return { status: "Sắp hết hạn", color: "yellow" };
    
    return { status: "Đang thực hiện", color: "green" };
  };

  const totalContractValue = contracts.reduce(
    (sum, contract) => sum + contract.value,
    0
  );

  const activeContracts = contracts.filter(
    (c) => getContractStatus(c).status === "Đang thực hiện"
  ).length;

  const expiringContracts = contracts.filter(
    (c) => getContractStatus(c).status === "Sắp hết hạn"
  ).length;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm hợp đồng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang thực hiện</p>
              <p className="text-2xl font-bold text-green-600">
                {activeContracts}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-yellow-600">
                {expiringContracts}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng giá trị</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(totalContractValue)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
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
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Số hợp đồng, tên khách hàng, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => {
                const status = getContractStatus(contract);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.contractNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCustomerName(contract.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(contract.value)}
                      </div>
                      <div className="text-sm text-gray-500">
                        VAT: {contract.vat}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(contract.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        đến {formatDate(contract.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Xem
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không tìm thấy hợp đồng
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết hợp đồng
              </h2>
              <button
                onClick={() => setSelectedContract(null)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Số hợp đồng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContract.contractNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Khách hàng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getCustomerName(selectedContract.customerId)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Giá trị hợp đồng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatCurrency(selectedContract.value)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    VAT
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContract.vat}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày bắt đầu
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedContract.startDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày kết thúc
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedContract.endDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getContractStatus(selectedContract).color === "green"
                          ? "bg-green-100 text-green-800"
                          : getContractStatus(selectedContract).color ===
                            "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : getContractStatus(selectedContract).color === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getContractStatus(selectedContract).status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tổng giá trị (bao gồm VAT)
                  </label>
                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {formatCurrency(
                      selectedContract.value * (1 + selectedContract.vat / 100)
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Mô tả
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContract.description || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Ghi chú
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContract.notes || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
