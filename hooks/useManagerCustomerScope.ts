"use client";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import customerAssignmentService from "@/services/customerAssignmentService";

/**
 * Hook trả về tập hợp customerId mà QLT2 hiện tại được quản lý (customer_assignments).
 *
 * - Role QLT2 → Set<number> các customerId được quản lý (load 1 lần lúc mount).
 * - Role khác (QLT1/QLV/ACCOUNTANT/...) → null (không giới hạn ở client, BE vẫn tự chặn).
 *
 * Dùng để ẩn nút "Xem HĐ"/"Xem khách hàng" với KH QLT2 không quản lý, tránh
 * user bấm vào rồi mới gặp 403 ở BE.
 */
export function useManagerCustomerScope(): Set<number> | null {
  const [scope, setScope] = useState<Set<number> | null>(
    () => (authService.getUserRole() === "QLT2" ? new Set<number>() : null),
  );

  useEffect(() => {
    if (authService.getUserRole() !== "QLT2") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await customerAssignmentService.getMyAssignedCustomer2({});
        const ids = (res?.content || []).map((c) => Number(c.id));
        if (!cancelled) setScope(new Set(ids));
      } catch {
        // Không lấy được scope → coi như không giới hạn (BE vẫn chặn).
        if (!cancelled) setScope(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return scope;
}
