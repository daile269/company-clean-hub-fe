'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { employeeLeaveService } from '@/services/employeeLeaveService';
import EmployeeResignDialog from './EmployeeResignDialog';

interface EmployeeLeaveManagerProps {
  employeeId: string | number;
  leaveDates?: string[]; // Danh sách các ngày đã nghỉ (Format YYYY-MM-DD) dùng để init (nếu có từ API)
  onLeaveUpdated?: () => void;
  onResignSuccess?: () => void;
}

export default function EmployeeLeaveCalendar({ employeeId, leaveDates = [], onLeaveUpdated, onResignSuccess }: EmployeeLeaveManagerProps) {
  // Selectors cho tháng/năm
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Danh sách hiển thị từ API
  const [localLeaveDates, setLocalLeaveDates] = useState<string[]>(leaveDates);
  const [loading, setLoading] = useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch dữ liệu từ API khi thay đổi tháng/năm
  const fetchLeaves = React.useCallback(async () => {
    setLoading(true);

    try {
      const res = await employeeLeaveService.getCompanyLeaves(employeeId, selectedMonth, selectedYear);
      if (res.success !== false) {
        setLocalLeaveDates((res.data as string[]) || []);
      } else {
        toast.error(res.message || 'Lỗi khi lấy danh sách ngày nghỉ.');
      }
    } catch {
      toast.error('Lỗi kết nối khi lấy ngày nghỉ.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedMonth, selectedYear]);

  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  
  // State thêm ngày nghỉ
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [newLeaveDate, setNewLeaveDate] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Handle Add Leave Day
  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveDate) {
      toast.error('Vui lòng chọn ngày nghỉ');
      return;
    }

    if (localLeaveDates.includes(newLeaveDate)) {
      toast.error('Ngày này đã được đăng ký nghỉ.');
      return;
    }

    setLoadingAction(true);
    try {
      const res = await employeeLeaveService.takeCompanyLeave(employeeId, newLeaveDate);
      if (res.success !== false) {
        toast.success(`Đã thêm ngày nghỉ: ${newLeaveDate}`);
        setLocalLeaveDates(prev => [...prev, newLeaveDate].sort());
        
        // Cập nhật lại dropdown Tháng/Năm để hiển thị ngay lập tức tháng vừa thêm
        const [y, m] = newLeaveDate.split('-');
        setSelectedYear(parseInt(y));
        setSelectedMonth(parseInt(m));

        setShowAddDateModal(false);
        setNewLeaveDate('');
        
        // Cập nhật lại danh sách sau khi thêm
        fetchLeaves();
        if (onLeaveUpdated) onLeaveUpdated();
      } else {
        toast.error(res.message || 'Lỗi khi báo nghỉ.');
      }
    } catch {
      toast.error('Lỗi khi gọi hệ thống.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Rollback Leave Day
  const handleRollback = async (dateStr: string) => {
    if (!window.confirm(`Xóa ngày nghỉ ${dateStr} và ghi nhận nhân viên đi làm lại?`)) return;

    setLoadingAction(true);
    try {
      const res = await employeeLeaveService.cancelCompanyLeave(employeeId, dateStr);
      if (res.success !== false) {
        toast.success(`Đã hủy báo nghỉ ngày ${dateStr}. Đi làm lại bình thường.`);
        // Reload part
        fetchLeaves();
        if (onLeaveUpdated) onLeaveUpdated();
      } else {
        toast.error(res.message || 'Lỗi khi hủy báo nghỉ.');
      }
    } catch {
      toast.error('Lỗi khi gọi hệ thống.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Cancel Resign (Rollback entire termination)
  const handleCancelResign = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn HOÀN TÁC việc chốt nghỉ văn phòng cho nhân sự này không? Toàn bộ lịch làm việc và ngày công bị xóa sẽ được khôi phục.')) return;

    setLoadingAction(true);
    try {
      const res = await employeeLeaveService.cancelResignOffice(employeeId);
      if (res.success !== false) {
        toast.success('Đã hoàn tác chốt nghỉ thành công. Nhân sự đã quay lại trạng thái đang làm việc.');
        fetchLeaves(); 
        if (onResignSuccess) onResignSuccess(); 
      } else {
        toast.error(res.message || 'Lỗi khi hoàn tác chốt nghỉ.');
      }
    } catch {
      toast.error('Lỗi kết nối khi gọi hệ thống.');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredLeaveDates = localLeaveDates;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý Nghỉ Phép Văn Phòng</h3>
          <p className="text-sm text-slate-500 mt-1">Ghi nhận các ngày nghỉ công ty để không tính lương.</p>
        </div>
        
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setShowAddDateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            + Thêm Ngày Nghỉ
          </button>

          <button
            onClick={handleCancelResign}
            disabled={loadingAction}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Hoàn tác việc chốt thôi việc văn phòng"
          >
            Hoàn tác Chốt nghỉ
          </button>
          
          <EmployeeResignDialog 
            employeeId={employeeId} 
            onSuccess={onResignSuccess}
            compact={true}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="px-5 py-3 font-semibold w-24 text-center">STT</th>
                <th className="px-5 py-3 font-semibold">Ngày đăng ký nghỉ</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-500 text-sm">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : filteredLeaveDates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-500 text-sm italic">
                    Không có ngày nghỉ nào trong Tháng {selectedMonth}/{selectedYear}.
                  </td>
                </tr>
              ) : (
                filteredLeaveDates.map((dateStr, index) => (
                  <tr key={dateStr} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-600 text-center">{index + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">
                      {new Date(dateStr).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRollback(dateStr)}
                        disabled={loadingAction}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                        title="Xóa nghỉ phép - Đi làm lại"
                      >
                        Hoàn tác
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Chọn ngày báo nghỉ</h3>
            <form onSubmit={handleAddLeave}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày nghỉ phép</label>
                <div className="relative group overflow-hidden">
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={newLeaveDate ? newLeaveDate.split('-').reverse().join('/') : ''}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={newLeaveDate}
                    onChange={(e) => setNewLeaveDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full block"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDateModal(false)}
                  disabled={loadingAction}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-md cursor-pointer disabled:opacity-75"
                >
                  {loadingAction && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Lưu ngày nghỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
