"use client";
import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import workScheduleService, {
  WorkScheduleContractSummary,
  EmployeeScheduleSummary,
  WorkScheduleResponse,
  VerificationImageData,
} from "@/services/workScheduleService";

// ─── helpers ────────────────────────────────────────────────────────────────
const now = new Date();
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const YEARS = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("vi-VN");
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: WorkScheduleResponse["status"] }) {
  const map = {
    VERIFIED: "bg-green-100 text-green-700",
    MISSED: "bg-red-100 text-red-700",
    SCHEDULED: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  const label = { VERIFIED: "Đã chụp", MISSED: "Quên chụp", SCHEDULED: "Chưa đến", CANCELLED: "Đã hủy" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

// ─── Image Modal ─────────────────────────────────────────────────────────────
function ImageModal({ image, employeeName, date, onClose }: {
  image: VerificationImageData; employeeName: string; date: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-gray-900">{employeeName}</p>
            <p className="text-sm text-gray-500">{fmtDate(date)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <img src={image.cloudinaryUrl} alt="Ảnh chấm công" className="w-full rounded-lg object-cover max-h-80" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Thời gian chụp</p>
              <p className="font-medium">{fmtDateTime(image.capturedAt)}</p>
            </div>
            {image.address && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Địa điểm</p>
                <p className="font-medium line-clamp-2">{image.address}</p>
              </div>
            )}
            {image.faceConfidence != null && (
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Độ chính xác khuôn mặt</p>
                <p className="font-medium text-green-700">{(image.faceConfidence * 100).toFixed(1)}%</p>
              </div>
            )}
            {image.imageQualityScore != null && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Chất lượng ảnh</p>
                <p className="font-medium text-blue-700">{(image.imageQualityScore * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => window.open(image.cloudinaryUrl, "_blank")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Tải xuống
            </button>
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Attendance Modal ──────────────────────────────────────────────────
function CreateAttendanceModal({ scheduleId, date, employeeName, onClose, onSuccess }: {
  scheduleId: number; date: string; employeeName: string; onClose: () => void; onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error("Vui lòng nhập lý do"); return; }
    setLoading(true);
    try {
      await workScheduleService.createAttendance(scheduleId, reason);
      toast.success("Đã tạo chấm công thành công");
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi tạo chấm công");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Tạo chấm công thủ công</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{employeeName}</span> — {fmtDate(date)}
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Nhân viên đi làm nhưng quên chụp ảnh chấm công.
        </div>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Lý do tạo chấm công thủ công..."
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Đang tạo..." : "Tạo chấm công"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkSchedulesPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [sort, setSort] = useState("name");

  // Level 1: contracts
  const [contracts, setContracts] = useState<WorkScheduleContractSummary[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Level 2: employees of selected contract
  const [selectedContract, setSelectedContract] = useState<WorkScheduleContractSummary | null>(null);
  const [employees, setEmployees] = useState<EmployeeScheduleSummary[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Level 3: schedules of selected employee
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeScheduleSummary | null>(null);
  const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Modals
  const [imageModal, setImageModal] = useState<{ schedule: WorkScheduleResponse; image: VerificationImageData } | null>(null);
  const [loadingImageId, setLoadingImageId] = useState<number | null>(null);
  const [createModal, setCreateModal] = useState<WorkScheduleResponse | null>(null);

  // ── Load contracts ──
  const loadContracts = useCallback(async () => {
    setLoadingContracts(true);
    try {
      const data = await workScheduleService.getContractsSummary(month, year, sort);
      setContracts(data);
    } catch { toast.error("Lỗi khi tải danh sách hợp đồng"); }
    finally { setLoadingContracts(false); }
  }, [month, year, sort]);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  // ── Select contract → load employees ──
  const handleSelectContract = async (contract: WorkScheduleContractSummary) => {
    setSelectedContract(contract);
    setSelectedEmployee(null);
    setSchedules([]);
    setLoadingEmployees(true);
    try {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      const [allSchedules, allEmployees] = await Promise.all([
        workScheduleService.getByDateRange(startDate, endDate),
        workScheduleService.getEmployeesWithSchedules(month, year),
      ]);
      // Filter employees có schedules thuộc contract này
      const contractEmployeeIds = new Set(
        allSchedules.filter(s => s.contractId === contract.contractId).map(s => s.employeeId)
      );
      setEmployees(allEmployees.filter(e => contractEmployeeIds.has(e.employeeId)));
    } catch { toast.error("Lỗi khi tải danh sách nhân viên"); }
    finally { setLoadingEmployees(false); }
  };

  // ── Select employee → load schedules ──
  const handleSelectEmployee = async (employee: EmployeeScheduleSummary) => {
    setSelectedEmployee(employee);
    setLoadingSchedules(true);
    try {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      const data = await workScheduleService.getByEmployee(employee.employeeId, startDate, endDate);
      setSchedules(data.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    } catch { toast.error("Lỗi khi tải lịch chấm công"); }
    finally { setLoadingSchedules(false); }
  };

  // ── View image ──
  const handleViewImage = async (schedule: WorkScheduleResponse) => {
    if (!schedule.verificationImageId) return;
    setLoadingImageId(schedule.id);
    try {
      const image = await workScheduleService.getImageByWorkScheduleId(schedule.id);
      if (image) setImageModal({ schedule, image });
      else toast.error("Không tìm thấy ảnh");
    } catch { toast.error("Lỗi khi tải ảnh"); }
    finally { setLoadingImageId(null); }
  };

  // ── After create attendance ──
  const handleAttendanceCreated = () => {
    setCreateModal(null);
    if (selectedEmployee) handleSelectEmployee(selectedEmployee);
  };

  // ── Breadcrumb back ──
  const goBackToContracts = () => { setSelectedContract(null); setSelectedEmployee(null); setSchedules([]); setEmployees([]); };
  const goBackToEmployees = () => { setSelectedEmployee(null); setSchedules([]); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý chấm công hình ảnh</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi ảnh chấm công của nhân viên theo hợp đồng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={month} onChange={e => { setMonth(+e.target.value); setSelectedContract(null); setSelectedEmployee(null); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={year} onChange={e => { setYear(+e.target.value); setSelectedContract(null); setSelectedEmployee(null); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {!selectedContract && (
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="name">Sắp xếp: Tên khách hàng</option>
            <option value="missed">Sắp xếp: Nhiều quên chụp nhất</option>
            <option value="verified">Sắp xếp: Tỷ lệ chụp cao nhất</option>
          </select>
        )}
      </div>

      {/* Breadcrumb */}
      {(selectedContract || selectedEmployee) && (
        <div className="flex items-center gap-2 text-sm mb-4 text-gray-500">
          <button onClick={goBackToContracts} className="hover:text-blue-600">Hợp đồng</button>
          {selectedContract && (
            <>
              <span>/</span>
              {selectedEmployee
                ? <button onClick={goBackToEmployees} className="hover:text-blue-600">{selectedContract.customerName}</button>
                : <span className="text-gray-900 font-medium">{selectedContract.customerName}</span>
              }
            </>
          )}
          {selectedEmployee && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium">{selectedEmployee.employeeName}</span>
            </>
          )}
        </div>
      )}

      {/* ── Level 1: Contracts ── */}
      {!selectedContract && (
        <div>
          {loadingContracts ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Không có dữ liệu chấm công hình ảnh trong tháng này</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map(c => (
                <button key={c.contractId} onClick={() => handleSelectContract(c)}
                  className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{c.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.contractCode}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{c.totalEmployees} NV</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Tỷ lệ chụp</span>
                      <span className="font-medium">{c.verifiedPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.verifiedPercentage}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs mt-3">
                    <span className="text-green-600">✓ {c.verifiedCount} đã chụp</span>
                    {c.missedCount > 0 && <span className="text-red-500">✗ {c.missedCount} quên</span>}
                    {c.scheduledCount > 0 && <span className="text-yellow-600">⏳ {c.scheduledCount} chưa đến</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Level 2: Employees ── */}
      {selectedContract && !selectedEmployee && (
        <div>
          {loadingEmployees ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Không có nhân viên nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(e => (
                <button key={e.employeeId} onClick={() => handleSelectEmployee(e)}
                  className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {e.employeeName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{e.employeeName}</p>
                      <p className="text-xs text-gray-400">{e.employeeCode}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600">✓ {e.verifiedCount}</span>
                    {e.missedCount > 0 && <span className="text-red-500">✗ {e.missedCount}</span>}
                    {e.scheduledCount > 0 && <span className="text-yellow-600">⏳ {e.scheduledCount}</span>}
                    <span className="text-gray-400 ml-auto">{e.totalSchedules} ngày</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Level 3: Schedules ── */}
      {selectedEmployee && (
        <div>
          {loadingSchedules ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Không có lịch chấm công</div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Ngày</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Loại</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Thời gian chụp</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {schedules.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{fmtDate(s.scheduledDate)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {s.reason === "NEW_EMPLOYEE_VERIFICATION" ? "Xác minh NV mới" : "Chấm công HĐ"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {s.photoCapturedAt ? fmtDateTime(s.photoCapturedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.status === "VERIFIED" && s.verificationImageId && (
                          <button
                            onClick={() => handleViewImage(s)}
                            disabled={loadingImageId === s.id}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 disabled:opacity-50">
                            {loadingImageId === s.id ? "Đang tải..." : "📷 Xem ảnh"}
                          </button>
                        )}
                        {s.status === "MISSED" && (
                          <button
                            onClick={() => setCreateModal(s)}
                            className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs hover:bg-orange-100">
                            + Tạo chấm công
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {imageModal && (
        <ImageModal
          image={imageModal.image}
          employeeName={selectedEmployee?.employeeName ?? ""}
          date={imageModal.schedule.scheduledDate}
          onClose={() => setImageModal(null)}
        />
      )}
      {createModal && (
        <CreateAttendanceModal
          scheduleId={createModal.id}
          date={createModal.scheduledDate}
          employeeName={selectedEmployee?.employeeName ?? ""}
          onClose={() => setCreateModal(null)}
          onSuccess={handleAttendanceCreated}
        />
      )}
    </div>
  );
}
