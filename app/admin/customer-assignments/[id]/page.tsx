"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import customerAssignmentService from "@/services/customerAssignmentService";
import { customerService } from "@/services/customerService";
import { authService } from "@/services/authService";
import userService from "@/services/userService";
import { Customer, CustomerAssignment } from "@/types";

export default function ManagerAssignmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const managerId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [managerInfo, setManagerInfo] = useState<any>(null);
    const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
    const [selectedToRemove, setSelectedToRemove] = useState<Set<number>>(new Set());

    const [showAddModal, setShowAddModal] = useState(false);
    const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
    const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());
    const [addLoading, setAddLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [managerId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load current user
            const user = await authService.getCurrentUser();
            setCurrentUser(user);

            // Load manager info
            const manager = await userService.getById(String(managerId));
            setManagerInfo(manager);

            // Load assigned customers
            const response = await customerAssignmentService.getAssignedCustomers(
                Number(managerId),
                undefined, // keyword
                0, // page
                1000 // pageSize - get all
            );
            setAssignedCustomers(response.content);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Không thể tải thông tin phân công");
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableCustomers = async () => {
        try {
            setAddLoading(true);

            // Get all customers
            const allCustomersResponse = await customerService.getAll({
                keyword: "",
                page: 0,
                pageSize: 1000,
            });
            const allCustomers = allCustomersResponse.content;
            // Get already assigned customer IDs
            let customersList = [];

            const customersArray = (assignedCustomers as any)?.content ||
                (Array.isArray(assignedCustomers) ? assignedCustomers : []);

            const assignedIds = customersArray.map((c: any) => Number(c.id));

            // If current user is QLT2, filter only customers they manage
            let filteredCustomers = allCustomers;
            if (currentUser.roleName === "QLT2") {
                const qlt2Response = await customerAssignmentService.getAssignedCustomers(
                    currentUser.id,
                    undefined, // keyword
                    0, // page
                    1000 // pageSize - get all
                );
                console.log("qlt2Assignments", qlt2Response);
                const qlt2CustomerIds = qlt2Response.content.map((c) => Number(c.id));
                filteredCustomers = allCustomers.filter((c) =>
                    qlt2CustomerIds.includes(Number(c.id))
                );
            }

            // Filter out already assigned customers
            const available = filteredCustomers.filter(
                (c) => !assignedIds.includes(Number(c.id))
            );

            setAvailableCustomers(available);
        } catch (error) {
            console.error("Error loading available customers:", error);
            toast.error("Không thể tải danh sách khách hàng");
        } finally {
            setAddLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
        setSelectedToAdd(new Set());
        loadAvailableCustomers();
    };

    const handleToggleAddCustomer = (customerId: number) => {
        const newSelected = new Set(selectedToAdd);
        if (newSelected.has(customerId)) {
            newSelected.delete(customerId);
        } else {
            newSelected.add(customerId);
        }
        setSelectedToAdd(newSelected);
    };

    const handleAddCustomers = async () => {
        if (selectedToAdd.size === 0) {
            toast.error("Vui lòng chọn ít nhất một khách hàng");
            return;
        }

        try {
            setAddLoading(true);

            // Add each selected customer
            const promises = Array.from(selectedToAdd).map((customerId) =>
                customerAssignmentService.assignCustomer({
                    managerId: Number(managerId),
                    customerId: customerId,
                })
            );

            await Promise.all(promises);
            toast.success(
                `Đã phân công ${selectedToAdd.size} khách hàng thành công`
            );

            setShowAddModal(false);
            setSelectedToAdd(new Set());
            loadData(); // Reload data
        } catch (error: any) {
            console.error("Error adding customers:", error);
            toast.error(error.message || "Có lỗi xảy ra khi phân công khách hàng");
        } finally {
            setAddLoading(false);
        }
    };

    const handleToggleRemoveCustomer = (customerId: number) => {
        const newSelected = new Set(selectedToRemove);
        if (newSelected.has(customerId)) {
            newSelected.delete(customerId);
        } else {
            newSelected.add(customerId);
        }
        setSelectedToRemove(newSelected);
    };

    const handleRemoveCustomers = async () => {
        if (selectedToRemove.size === 0) {
            toast.error("Vui lòng chọn ít nhất một khách hàng để xóa");
            return;
        }

        if (
            !confirm(
                `Bạn có chắc muốn hủy phân công ${selectedToRemove.size} khách hàng?`
            )
        ) {
            return;
        }

        try {
            setLoading(true);

            // Remove each selected customer
            const promises = Array.from(selectedToRemove).map((customerId) =>
                customerAssignmentService.revokeAssignment(
                    Number(managerId),
                    customerId
                )
            );

            await Promise.all(promises);
            toast.success(
                `Đã hủy phân công ${selectedToRemove.size} khách hàng thành công`
            );

            setSelectedToRemove(new Set());
            loadData(); // Reload data
        } catch (error: any) {
            console.error("Error removing customers:", error);
            toast.error(error.message || "Có lỗi xảy ra khi hủy phân công");
        } finally {
            setLoading(false);
        }
    };

    const filteredAvailableCustomers = availableCustomers.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
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

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="mb-6 md:mb-8">
                <button
                    onClick={() => router.back()}
                    className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-5 h-5 mr-2"
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

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Phân công khách hàng
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Quản lý: <span className="font-medium">{managerInfo?.username}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full md:w-auto"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Thêm khách hàng
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng khách hàng</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignedCustomers.length}
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã chọn</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {selectedToRemove.size}
                            </p>
                        </div>
                        {selectedToRemove.size > 0 && (
                            <button
                                onClick={handleRemoveCustomers}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                Xóa ({selectedToRemove.size})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 md:p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Khách hàng được phân công
                    </h2>
                </div>

                {assignedCustomers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedToRemove.size === assignedCustomers.length &&
                                                assignedCustomers.length > 0
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedToRemove(
                                                        new Set(assignedCustomers.map((c) => Number(c.id)))
                                                    );
                                                } else {
                                                    setSelectedToRemove(new Set());
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Mã KH
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên khách hàng
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Điện thoại
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Địa chỉ
                                    </th>
                                    {/* Mobile Only Header */}
                                    <th className="md:hidden px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thông tin khách hàng
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignedCustomers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className={`hover:bg-gray-50 ${selectedToRemove.has(Number(customer.id))
                                            ? "bg-blue-50"
                                            : ""
                                            }`}
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap align-top">
                                            <input
                                                type="checkbox"
                                                checked={selectedToRemove.has(Number(customer.id))}
                                                onChange={() =>
                                                    handleToggleRemoveCustomer(Number(customer.id))
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                                            {customer.code}
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-4 text-sm align-top">
                                            <div className="font-medium text-gray-900">
                                                {customer.name}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                {customer.company}
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                            {customer.phone}
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500 align-top break-words max-w-xs">
                                            {customer.address}
                                        </td>
                                        {/* Mobile Only Cell */}
                                        <td className="md:hidden px-4 py-4 text-sm align-top">
                                            <div className="font-medium text-gray-900 break-words">
                                                {customer.name}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-0.5 break-words">
                                                {customer.company}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">
                                                    {customer.code}
                                                </span>
                                                <span className="flex items-center text-gray-500">
                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {customer.phone}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-gray-500 text-xs flex items-start gap-1">
                                                <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="break-words line-clamp-3">
                                                    {customer.address}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 md:p-12 text-center">
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Chưa có khách hàng nào
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Bấm "Thêm khách hàng" để bắt đầu phân công
                        </p>
                    </div>
                )}
            </div>

            {/* Add Customers Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Thêm khách hàng
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
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

                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {addLoading ? (
                            <div className="flex justify-center py-12">
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
                        ) : (
                            <>
                                <div className="border rounded-lg overflow-hidden mb-6 max-h-96 overflow-y-auto">
                                    {filteredAvailableCustomers.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedToAdd.size ===
                                                                filteredAvailableCustomers.length &&
                                                                filteredAvailableCustomers.length > 0
                                                            }
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedToAdd(
                                                                        new Set(
                                                                            filteredAvailableCustomers.map((c) =>
                                                                                Number(c.id)
                                                                            )
                                                                        )
                                                                    );
                                                                } else {
                                                                    setSelectedToAdd(new Set());
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </th>
                                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                        Mã KH
                                                    </th>
                                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Tên khách hàng
                                                    </th>
                                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                        Điện thoại
                                                    </th>
                                                    <th className="md:hidden px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Thông tin
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredAvailableCustomers.map((customer) => (
                                                    <tr
                                                        key={customer.id}
                                                        className={`hover:bg-gray-50 cursor-pointer ${selectedToAdd.has(Number(customer.id))
                                                            ? "bg-blue-50"
                                                            : ""
                                                            }`}
                                                        onClick={() =>
                                                            handleToggleAddCustomer(Number(customer.id))
                                                        }
                                                    >
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedToAdd.has(Number(customer.id))}
                                                                onChange={() =>
                                                                    handleToggleAddCustomer(Number(customer.id))
                                                                }
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                                                            {customer.code}
                                                        </td>
                                                        <td className="hidden md:table-cell px-4 py-4 text-sm align-top">
                                                            <div className="font-medium text-gray-900">
                                                                {customer.name}
                                                            </div>
                                                            <div className="text-gray-500 mt-1">
                                                                {customer.company}
                                                            </div>
                                                        </td>
                                                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                                            {customer.phone}
                                                        </td>
                                                        {/* Mobile Only Cell */}
                                                        <td className="md:hidden px-4 py-4 text-sm align-top">
                                                            <div className="font-medium text-gray-900 break-words">
                                                                {customer.name}
                                                            </div>
                                                            <div className="text-gray-500 text-xs mt-0.5 break-words">
                                                                {customer.company}
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">
                                                                    {customer.code}
                                                                </span>
                                                                <span className="flex items-center text-gray-500">
                                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                    {customer.phone}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-6 md:p-12 text-center">
                                            <p className="text-gray-500">
                                                Không có khách hàng nào để thêm
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        Đã chọn: <span className="font-medium">{selectedToAdd.size}</span>{" "}
                                        khách hàng
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleAddCustomers}
                                            disabled={selectedToAdd.size === 0 || addLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {addLoading ? (
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
                                                    Đang thêm...
                                                </>
                                            ) : (
                                                <>
                                                    <svg
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
                                                    Thêm ({selectedToAdd.size})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
