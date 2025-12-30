"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import customerAssignmentService from "@/services/customerAssignmentService";
import userService from "@/services/userService";
import { authService } from "@/services/authService";
import { CustomerAssignment } from "@/types";

interface ManagerWithAssignments {
    managerId: number;
    managerName: string;
    managerUsername: string;
    assignments: CustomerAssignment[];
}

export default function CustomerAssignmentsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [managersData, setManagersData] = useState<ManagerWithAssignments[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);

            // If user is QLV, redirect to their detail page
            if (user?.roleName === "QLV") {
                router.push(`/admin/customer-assignments/${user.id}`);
            }
        } catch (error) {
            console.error("Error loading current user:", error);
            toast.error("Không thể tải thông tin người dùng");
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);

            if (currentUser.roleName === "QLT1") {
                // QLT1 sees all QLT2 and QLV managers
                await loadAllManagers();
            } else if (currentUser.roleName === "QLT2") {
                // QLT2 sees only QLV managers assigned to customers they manage
                await loadQLVManagers();
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Không thể tải danh sách phân công");
        } finally {
            setLoading(false);
        }
    };

    const loadAllManagers = async () => {
        try {
            // Get all users with QLT2 and QLV roles
            const usersResponse = await userService.getAll({
                keyword: "",
                roleId: null,
                page: 0,
                pageSize: 1000,
            });

            const managers = usersResponse.content.filter(
                (user) => user.roleName === "QLT2" || user.roleName === "QLV"
            );

            // For each manager, get their assignments
            const managersWithAssignments = await Promise.all(
                managers.map(async (manager) => {
                    const assignments = await customerAssignmentService.getAssignmentsByManager(
                        manager.id
                    );
                    return {
                        managerId: manager.id,
                        managerName: manager.username,
                        managerUsername: manager.username,
                        assignments,
                    };
                })
            );

            setManagersData(managersWithAssignments);
        } catch (error) {
            console.error("Error loading all managers:", error);
            throw error;
        }
    };

    const loadQLVManagers = async () => {
        try {
            // Get all users with QLV role
            const usersResponse = await userService.getAll({
                keyword: "",
                roleId: null,
                page: 0,
                pageSize: 1000,
            });

            const qlvManagers = usersResponse.content.filter(
                (user) => user.roleName === "QLV"
            );

            // Get QLT2's assigned customers
            const qlt2Assignments = await customerAssignmentService.getAssignmentsByManager(
                currentUser.id
            );
            const qlt2CustomerIds = qlt2Assignments.map((a) => a.customerId);

            // For each QLV, get their assignments and filter by QLT2's customers
            const managersWithAssignments = await Promise.all(
                qlvManagers.map(async (manager) => {
                    const allAssignments = await customerAssignmentService.getAssignmentsByManager(
                        manager.id
                    );
                    // Only show assignments for customers that QLT2 manages
                    const filteredAssignments = allAssignments.filter((a) =>
                        qlt2CustomerIds.includes(a.customerId)
                    );
                    return {
                        managerId: manager.id,
                        managerName: manager.username,
                        managerUsername: manager.username,
                        assignments: filteredAssignments,
                    };
                })
            );

            setManagersData(managersWithAssignments);
        } catch (error) {
            console.error("Error loading QLV managers:", error);
            throw error;
        }
    };

    const filteredManagers = managersData.filter(
        (manager) =>
            manager.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.managerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.assignments.some((a) =>
                a.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
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
        <div>
            <Toaster position="top-right" />

            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Phân công khách hàng
                </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng số quản lý</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {managersData.length}
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng phân công</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {managersData.reduce((sum, m) => sum + m.assignments.length, 0)}
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm quản lý hoặc khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Manager List */}
            <div className="space-y-4">
                {filteredManagers.map((manager) => (
                    <div
                        key={manager.managerId}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                        <div
                            className="p-6 cursor-pointer"
                            onClick={() =>
                                router.push(`/admin/customer-assignments/${manager.managerId}`)
                            }
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {manager.managerName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        @{manager.managerUsername}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        {manager.assignments.length} khách hàng
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {manager.assignments.length > 0 && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Khách hàng được phân công:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {manager.assignments.slice(0, 5).map((assignment) => (
                                            <span
                                                key={assignment.id}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                            >
                                                {assignment.customerName}
                                            </span>
                                        ))}
                                        {manager.assignments.length > 5 && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                                +{manager.assignments.length - 5} khác
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {manager.assignments.length === 0 && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 italic">
                                        Chưa có khách hàng nào được phân công
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredManagers.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
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
                            Không tìm thấy quản lý
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Thử thay đổi từ khóa tìm kiếm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
