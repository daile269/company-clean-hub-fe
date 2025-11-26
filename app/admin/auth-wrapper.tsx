"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      return;
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  // If on login page, render children without layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Otherwise, render the admin layout (will be handled by the existing layout)
  return <>{children}</>;
}
