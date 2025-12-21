"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthUser } from "@/services/authService";
import { permissionService } from "@/services/permissionService";

interface AdminSidebarProps {
    user: AuthUser | null;
    sidebarOpen: boolean;
}

export default function AdminSidebar({ user, sidebarOpen }: AdminSidebarProps) {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        setUserId(user?.id ? user.id.toString() : null);
        if (typeof window === "undefined") return;
        if (!user) {
            window.location.reload();
        }
    }, [user]);



    return (
        <aside
            className={`${sidebarOpen ? "w-64" : "w-0"
                } bg-gray-800 text-white transition-all duration-300 fixed h-full overflow-hidden`}
        >
            <nav className="mt-5 px-2">
                <Link
                    href="/admin"
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700"
                >
                    <svg
                        className="mr-4 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    Tổng quan
                </Link>
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE') && (
                    <Link
                        href="/admin/company-staff"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        Quản lý Nhân viên văn phòng
                    </Link>
                )}
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE') && (
                    <Link
                        href="/admin/employees"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        Quản lý Nhân viên hợp đồng khách hàng
                    </Link>
                )}
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE' && user?.roleName !== 'ACCOUNTANT') && (
                    <Link
                        href="/admin/customers"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
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
                        Quản lý khách hàng
                    </Link>
                )}
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE'  && user?.roleName !== 'ACCOUNTANT') && (
                    <Link
                        href="/admin/assignments"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                        Quản lý phân công
                    </Link>
                )}
                {permissionService.hasPermission("REVIEW_VIEW_ALL") && (
                    <Link
                        href="/admin/reviews"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z"
                            />
                        </svg>
                        Quản lý đánh giá
                    </Link>
                )}
                
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE' && user?.roleName !== 'QLV') && (
                    <Link
                        href="/admin/payroll"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
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
                        Quản lý bảng lương
                    </Link>
                )}
                {(user && user?.roleName !== 'CUSTOMER' && user?.roleName !== 'EMPLOYEE' && user?.roleName !== 'QLV'  && user?.roleName !== 'ACCOUNTANT') && (
                    <Link
                        href="/admin/users"
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 mt-1"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
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
                        Quản lý người dùng
                    </Link>
                )}
                {(user && user?.roleName === 'CUSTOMER' || user?.roleName === 'EMPLOYEE') && (
                    <Link
                        href={
                            user?.roleName === 'CUSTOMER'
                                ? `/admin/customers/${userId}`
                                : `/admin/employees/${userId}`
                        }
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700"
                    >
                        <svg
                            className="mr-4 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Quản lý thông tin
                    </Link>
                )}
            </nav>
        </aside>
    );
}
