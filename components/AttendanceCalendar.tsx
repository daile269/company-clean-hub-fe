"use client";
import { useMemo, useState, useEffect } from "react";
import { Attendance } from "@/services/attendanceService";
import { assignmentService, Assignment } from "@/services/assignmentService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-hot-toast";
interface AttendanceCalendarProps {
    attendances: Attendance[];
    month: number;
    year: number;
    payrollCalculatedDate?: string; // Ngày tính lương (từ payroll.createdAt)
    loading?: boolean;
    onEditAttendance?: (attendance: Attendance) => void;
    onAsyncStart?: (message?: string) => void;
    onAsyncEnd?: () => void;
    onSuccess?: () => void;
}

const updateAssignment = async (assignment: Assignment, allowance: number) => {
    if (!assignment || !assignment.id) {
        throw new Error("Assignment không hợp lệ");
    }

    // Only send the fields needed for update to avoid null issues
    const payload = {
        id: assignment.id,
        employeeId: assignment.employeeId,
        customerId: assignment.customerId,
        projectCompanyId: assignment.contract,
        contractId: assignment.contractId,
        salaryAtTime: assignment.salaryAtTime,
        plannedDays: assignment.plannedDays,
        status: assignment.status,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        additionalAllowance: allowance,
        // Include other fields from assignment if they exist
        ...Object.keys(assignment).reduce((acc, key) => {
            if (!acc.hasOwnProperty(key) && assignment[key as keyof Assignment] !== undefined) {
                acc[key] = assignment[key as keyof Assignment];
            }
            return acc;
        }, {} as Record<string, any>)
    };

    return assignmentService.update(assignment.id, payload);
};
const INDICATOR_TYPES = {
    bonus: { dot: "bg-green-500", label: "Thưởng" },
    penalty: { dot: "bg-red-500", label: "Phạt" },
    supportCost: { dot: "bg-blue-500", label: "Hỗ trợ" },
    overtimeAmount: { dot: "bg-purple-500", label: "Tăng ca" },
};

// Phân loại attendance theo assignmentId (mỗi lịch tương ứng 1 assignment) và sort theo date
const groupAttendanceByAssignment = (
    attendances: Attendance[]
): Map<number, Attendance[]> => {
    const grouped = new Map<number, Attendance[]>();

    attendances.forEach((att) => {
        if (!grouped.has(att.assignmentId)) {
            grouped.set(att.assignmentId, []);
        }
        grouped.get(att.assignmentId)!.push(att);
    });

    // Sort mỗi group theo date
    grouped.forEach((attendances) => {
        attendances.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    });

    return grouped;
};
const getStatusAssignment = (status: string | undefined) => {
    if (status === undefined) return "Chưa cập nhật";
    if (status === "COMPLETED") return "Hoàn thành";
    if (status === "IN_PROGRESS") return "Đang thực hiện";
}
const getAttendancesForDate = (
    attendances: Attendance[],
    day: number
): Attendance[] => {
    return attendances.filter((att) => {
        const attDate = new Date(att.date);
        return attDate.getDate() === day;
    });
};

// Kiểm tra ngày là đã làm, chưa làm, hay không có lịch
const getAttendanceStatus = (
    dayAttendances: Attendance[],
    day: number,
    month: number,
    year: number
): 'done' | 'notdone' | 'norecord' => {
    if (dayAttendances.length === 0) {
        return 'norecord';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Tạo date object của ngày này
    const dayDate = new Date(year, month - 1, day);
    dayDate.setHours(0, 0, 0, 0);

    // So sánh: nếu dayDate <= payrollDateOnly thì đã làm, ngược lại là chưa làm
    if (dayDate <= today) {
        return 'done';
    } else {
        return 'notdone';
    }
};

// Hàm tính số ngày công thực tế từ attendance (count attendance với date ≤ hôm nay)
const calculateRealWorkDays = (attendances: Attendance[]): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return attendances.filter((att) => {
        const attDate = new Date(att.date);
        attDate.setHours(0, 0, 0, 0);
        return attDate <= today;
    }).length;
};

export default function AttendanceCalendar({
    attendances,
    month,
    year,
    payrollCalculatedDate,
    loading = false,
    onEditAttendance,
    onAsyncStart,
    onAsyncEnd,
    onSuccess,
}: AttendanceCalendarProps) {
    const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
    // Mỗi lịch tương ứng 1 assignment
    const [assignmentsById, setAssignmentsById] = useState<Map<number, Assignment | null>>(new Map());
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [assignmentAllowanceInputs, setAssignmentAllowanceInputs] = useState<Record<number, number>>({});
    const [savingAssignmentMap, setSavingAssignmentMap] = useState<Record<number, boolean>>({});

    // Parse payroll calculated date to get the date for comparison
    const payrollDate = payrollCalculatedDate ? new Date(payrollCalculatedDate) : null;
    const payrollDateOnly = payrollDate ? new Date(payrollDate.getFullYear(), payrollDate.getMonth(), payrollDate.getDate()) : null;

    // Phân loại attendance theo assignment (mỗi assignment 1 lịch)
    const assignmentGroups = useMemo(
        () => groupAttendanceByAssignment(attendances),
        [attendances]
    );

    // Lấy thông tin assignment cho mỗi lịch (assignment)
    useEffect(() => {
        const loadAssignments = async () => {
            setAssignmentsLoading(true);
            const newAssignmentsById = new Map<number, Assignment | null>();

            for (const assignmentId of assignmentGroups.keys()) {
                try {
                    const assignment = await assignmentService.getById(assignmentId);
                    newAssignmentsById.set(assignmentId, assignment);
                } catch (error) {
                    console.error(`Error loading assignment ${assignmentId}:`, error);
                    newAssignmentsById.set(assignmentId, null);
                }
            }

            setAssignmentsById(newAssignmentsById);
            setAssignmentsLoading(false);
        };

        if (assignmentGroups.size > 0) {
            loadAssignments();
        }
    }, [assignmentGroups]);

    // Tính toán ngày đầu tiên và số ngày trong tháng
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Tạo mảng ngày tháng
    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];

        // Thêm các ngày trống từ tháng trước
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Thêm ngày của tháng hiện tại
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    }, [daysInMonth, startingDayOfWeek]);

    if (loading) {
        return (
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
        );
    }

    if (attendances.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Chưa có bản ghi chấm công trong tháng này
            </div>
        );
    }

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    return (
        <div className="space-y-6">


            {/* Tạo bảng lịch cho mỗi assignment (mỗi lịch 1 assignment) */}
            {Array.from(assignmentGroups.entries()).map(
                ([assignmentId, assignmentAttendances]) => {
                    const firstAttendance = assignmentAttendances[0];
                    const customerName = firstAttendance?.customerName || `Văn phòng`;
                    const employeeName = firstAttendance?.employeeName;
                    const assignment = assignmentsById.get(assignmentId) || null;
                    const allowanceValue =
                        assignmentAllowanceInputs[assignmentId] ??
                        (assignment?.additionalAllowance ?? 0);

                    // Kiểm tra status - nếu đang thực hiện thì hiển thị thông báo
                    const isInProgress = assignment?.status === "IN_PROGRESS";

                    // Tính số ngày công thực tế từ attendance (count attendance với date <= hôm nay)
                    const realWorkDays = calculateRealWorkDays(assignmentAttendances);

                    return (
                        <div key={assignmentId} className="flex gap-4 bg-white rounded-lg shadow p-4">
                            {/* Sidebar - Customer Info + Assignment allowance */}
                            <div className="w-32 flex-shrink-0">
                                <h3 className="text-sm font-semibold text-gray-900 break-words">
                                    {customerName}
                                </h3>

                                {/* Thông tin Assignment (mỗi lịch 1 assignment) */}
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                                    {assignmentsLoading && !assignment ? (
                                        <p className="text-gray-500">Đang tải...</p>
                                    ) : !assignment ? (
                                        <p className="text-gray-500">Không tìm thấy assignment</p>
                                    ) : (
                                        <div className="text-gray-700 space-y-0.5">
                                            <p className="font-medium">
                                                {assignment.employeeName || employeeName}
                                            </p>
                                            <p className="text-gray-600">Lương: {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                                maximumFractionDigits: 0,
                                            }).format(assignment.salaryAtTime || 0)}</p>
                                            <p className="text-gray-600">Ngày DK: {assignment.plannedDays || 0}</p>
                                            <p className="text-gray-600">Ngày TT: {realWorkDays}</p>
                                            <p className="text-gray-600">Trạng thái: <span className="font-semibold">{getStatusAssignment(assignment.status)}</span></p>
                                        </div>
                                    )}
                                </div>

                                {/* Phụ cấp assignment chỉnh sửa được */}
                                {assignment && (
                                    <div className="mt-3 p-2 bg-purple-50 rounded text-xs space-y-1">
                                        <p className="font-semibold text-purple-700">
                                            Phụ cấp phân công
                                        </p>
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 border border-purple-200 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            value={allowanceValue}
                                            min={0}
                                            step={1000}
                                            onChange={(e) => {
                                                const val = Number(e.target.value) || 0;
                                                setAssignmentAllowanceInputs((prev) => ({
                                                    ...prev,
                                                    [assignmentId]: val,
                                                }));
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="mt-1 w-full bg-purple-600 text-white rounded px-2 py-1 text-xs hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                            disabled={!!savingAssignmentMap[assignmentId]}
                                            onClick={async () => {
                                                try {
                                                    onAsyncStart?.("Đang cập nhật phụ cấp assignment...");
                                                    setSavingAssignmentMap((prev) => ({
                                                        ...prev,
                                                        [assignmentId]: true,
                                                    }));

                                                    const valueToSave =
                                                        assignmentAllowanceInputs[assignmentId] ??
                                                        (assignment.additionalAllowance ?? 0);

                                                    const response = await updateAssignment(assignment, valueToSave);
                                                    const updatedAssignment =
                                                        response?.data ?? {
                                                            ...assignment,
                                                            additionalAllowance: valueToSave,
                                                        };

                                                    // Clear local input cache to sync with backend value
                                                    setAssignmentAllowanceInputs((prev) => {
                                                        const next = { ...prev };
                                                        delete next[assignmentId];
                                                        return next;
                                                    });

                                                    // Cập nhật lại cache assignment local
                                                    setAssignmentsById((prev) => {
                                                        const clone = new Map(prev);
                                                        clone.set(assignmentId, updatedAssignment);
                                                        return clone;
                                                    });
                                                    onSuccess?.();
                                                    onAsyncEnd?.();
                                                    toast.success("Cập nhật phụ cấp assignment thành công");
                                                } catch (error) {
                                                    console.error("Failed to update assignment allowance", error);
                                                    onAsyncEnd?.();
                                                    toast.error("Cập nhật phụ cấp assignment thất bại");
                                                } finally {
                                                    setSavingAssignmentMap((prev) => {
                                                        const next = { ...prev };
                                                        delete next[assignmentId];
                                                        return next;
                                                    });
                                                }
                                            }}
                                        >
                                            {savingAssignmentMap[assignmentId] ? (
                                                <>
                                                    <span className="h-3 w-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                "Lưu phụ cấp"
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Legend */}
                                {!isInProgress && (
                                    <div className="mt-4 space-y-2 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${INDICATOR_TYPES.bonus.dot}`}></div>
                                            <span className="text-gray-600">{INDICATOR_TYPES.bonus.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${INDICATOR_TYPES.penalty.dot}`}></div>
                                            <span className="text-gray-600">{INDICATOR_TYPES.penalty.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${INDICATOR_TYPES.supportCost.dot}`}></div>
                                            <span className="text-gray-600">{INDICATOR_TYPES.supportCost.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${INDICATOR_TYPES.overtimeAmount.dot}`}></div>
                                            <span className="text-gray-600">{INDICATOR_TYPES.overtimeAmount.label}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 overflow-x-auto">
                                <div className="bg-white rounded overflow-hidden border border-gray-200">
                                    {/* Calendar Header */}
                                    <div className="grid grid-cols-7 gap-0">
                                        {dayNames.map((day) => (
                                            <div
                                                key={day}
                                                className="bg-gray-100 border-r border-b border-gray-200 py-2 text-center font-semibold text-xs text-gray-700 min-w-16"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-0">
                                        {calendarDays.map((day, index) => {
                                            const dayAttendances = day ? getAttendancesForDate(assignmentAttendances, day) : [];
                                            const attendanceStatus = day ? getAttendanceStatus(dayAttendances, day, month, year) : 'norecord';

                                            return (
                                                <div key={index} className={`border-r border-b border-gray-200 p-1 min-w-16 min-h-16 flex flex-col items-center justify-center 
                                                        ${day ? "bg-white " : "bg-gray-50"} relative group cursor-pointer`}>
                                                    {day && (
                                                        <div className="w-full h-20 flex flex-col">
                                                            {/* Ngày */}
                                                            <div className="text-xs font-semibold text-gray-900 bg-gray-100 rounded px-1 py-0.5 text-center">
                                                                {day}
                                                            </div>

                                                            {/* Icon và Details */}
                                                            <div className="flex-1 flex items-center justify-center gap-3">
                                                                {attendanceStatus === 'norecord' ? (
                                                                    // Không có lịch → icon clipboard xám
                                                                    <div className="text-gray-300 text-xl text-center">
                                                                        <span className="group-hover:hidden inline-block opacity-50">
                                                                            <FontAwesomeIcon icon={SolidIcons.faClipboardCheck} />
                                                                        </span>
                                                                        <button
                                                                            onClick={() => {
                                                                                onEditAttendance?.(dayAttendances[0] || { date: new Date(year, month - 1, day).toISOString() } as Attendance);
                                                                                setEditingAttendance(null);
                                                                            }}
                                                                            className="group-hover:block hidden mt-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs hover:bg-blue-600 w-full"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                    </div>
                                                                ) : attendanceStatus === 'done' ? (
                                                                    // Đã làm → icon check xanh
                                                                    <>
                                                                        <div className="text-green-600 text-xl text-center">
                                                                            <span className="group-hover:hidden inline-block">
                                                                                <FontAwesomeIcon icon={SolidIcons.faClipboardCheck} />
                                                                            </span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    onEditAttendance?.(dayAttendances[0]);
                                                                                    setEditingAttendance(null);
                                                                                }}
                                                                                className="group-hover:block hidden mt-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs hover:bg-blue-600 w-full"
                                                                            >
                                                                                Sửa
                                                                            </button>
                                                                        </div>
                                                                        {/* Display dots for bonus/penalty/etc */}
                                                                        {dayAttendances.map((att, idx) => (
                                                                            <div key={idx} className="flex flex-col gap-0.5">
                                                                                {att.supportCost && att.supportCost > 0 ? (
                                                                                    <div className="flex items-center gap-1 text-xs">
                                                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INDICATOR_TYPES.supportCost.dot}`}></div>
                                                                                        <span className="group-hover:block hidden text-blue-600 font-semibold truncate">
                                                                                            {new Intl.NumberFormat("vi-VN", {
                                                                                                style: "currency",
                                                                                                currency: "VND",
                                                                                                maximumFractionDigits: 0,
                                                                                            }).format(att.supportCost)}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : null}
                                                                                {att.bonus && att.bonus > 0 ? (
                                                                                    <div className="flex items-center gap-1 text-xs">
                                                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INDICATOR_TYPES.bonus.dot}`}></div>
                                                                                        <span className="group-hover:block hidden text-green-600 font-semibold truncate">
                                                                                            {new Intl.NumberFormat("vi-VN", {
                                                                                                style: "currency",
                                                                                                currency: "VND",
                                                                                                maximumFractionDigits: 0,
                                                                                            }).format(att.bonus)}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : null}
                                                                                {att.penalty && att.penalty > 0 ? (
                                                                                    <div className="flex items-center gap-1 text-xs">
                                                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INDICATOR_TYPES.penalty.dot}`}></div>
                                                                                        <span className="group-hover:block hidden text-red-600 font-semibold truncate">
                                                                                            {new Intl.NumberFormat("vi-VN", {
                                                                                                style: "currency",
                                                                                                currency: "VND",
                                                                                                maximumFractionDigits: 0,
                                                                                            }).format(att.penalty)}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : null}
                                                                                {att.overtimeAmount && att.overtimeAmount > 0 ? (
                                                                                    <div className="flex items-center gap-1 text-xs">
                                                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INDICATOR_TYPES.overtimeAmount.dot}`}></div>
                                                                                        <span className="group-hover:block hidden text-purple-600 font-semibold truncate">
                                                                                            {new Intl.NumberFormat("vi-VN", {
                                                                                                style: "currency",
                                                                                                currency: "VND",
                                                                                                maximumFractionDigits: 0,
                                                                                            }).format(att.overtimeAmount)}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    // Chưa làm → icon xám nhưng vẫn có thể edit
                                                                    <div className="text-gray-400 text-xl text-center">
                                                                        <span className="group-hover:hidden inline-block">
                                                                            <FontAwesomeIcon icon={SolidIcons.faClipboardCheck} />
                                                                        </span>
                                                                        <button
                                                                            onClick={() => {
                                                                                onEditAttendance?.(dayAttendances[0]);
                                                                                setEditingAttendance(null);
                                                                            }}
                                                                            className="group-hover:block hidden mt-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs hover:bg-blue-600 w-full"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                }
            )}
        </div>
    );
}
