"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthUser } from "@/services/authService";

interface AdminTopNavProps {
  user: AuthUser | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Horizontal top navigation for roles with few menu items (e.g. QLV - Quản lý vùng).
 * Renders the menu always visible on top instead of a collapsible sidebar.
 */
export default function AdminTopNav({ user }: AdminTopNavProps) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(
    user?.id ? user.id.toString() : null
  );

  useEffect(() => {
    setUserId(user?.id ? user.id.toString() : null);
  }, [user?.id]);

  const items: NavItem[] = [
    {
      href: "/admin/employees",
      label: "Nhân viên hợp đồng",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/customers",
      label: "Khách hàng",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/attendance/today-tasks",
      label: "Chụp ảnh chấm công",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      href: `/admin/company-staff/${userId}`,
      label: "Quản lý thông tin",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href.includes("/null") || href.includes("/undefined")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 z-20 sticky top-16">
      <div className="px-2 sm:px-4">
        <div className="flex items-center overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive(item.href)
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
