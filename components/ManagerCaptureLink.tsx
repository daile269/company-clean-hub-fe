"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import workScheduleService from "@/services/workScheduleService";

interface ManagerCaptureLinkProps {
  userId: number;
}

export default function ManagerCaptureLink({ userId }: ManagerCaptureLinkProps) {
  const [hasPending, setHasPending] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    workScheduleService.hasPendingSchedules(userId).then((result) => {
      if (!cancelled) {
        setHasPending(result);
        setChecked(true);
      }
    });
    return () => { cancelled = true; };
  }, [userId]);

  if (!checked || !hasPending) return null;

  return (
    <Link
      href="/admin/attendance/today-tasks"
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
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Chụp ảnh chấm công
    </Link>
  );
}
