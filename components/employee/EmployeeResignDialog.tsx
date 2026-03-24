'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { employeeLeaveService } from '@/services/employeeLeaveService';

interface EmployeeResignDialogProps {
  employeeId: string | number;
  onSuccess?: () => void;
  compact?: boolean;
}

export default function EmployeeResignDialog({ employeeId, onSuccess, compact = false }: EmployeeResignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const [resignDate, setResignDate] = useState(today);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resignDate) {
      toast.error('Vui lòng chọn ngày chốt nghỉ.');
      return;
    }

    setLoading(true);
    try {
      const res = await employeeLeaveService.resignOffice(employeeId, resignDate);
      if (res.success !== false) {
        toast.success('Chấm dứt công việc văn phòng thành công!');
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || 'Lỗi khi tác vụ nghỉ việc.');
      }
    } catch (error) {
      toast.error('Lỗi khi gọi hệ thống.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {compact ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Chấm dứt làm VP
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between mt-6">
          <div>
            <h4 className="text-red-800 font-semibold text-base">Quản trị sự nghiệp Văn phòng</h4>
            <p className="text-red-600/80 text-sm mt-1">Sử dụng tính năng này nếu nhân sự đã chốt nghỉ, ngừng nhận lương văn phòng.</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap ml-4 cursor-pointer"
          >
            Chốt Chấm dứt VP
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận Thôi việc Văn phòng</h3>
            <p className="text-sm text-slate-500 mb-5">Vui lòng cung cấp ngày bắt đầu tính nghỉ.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày chính thức nghỉ</label>
                <div 
                  className="relative cursor-pointer group" 
                  onClick={() => dateInputRef.current?.showPicker()}
                >
                  <input
                    type="text"
                    readOnly
                    value={resignDate ? resignDate.split('-').reverse().join('/') : ''}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                  />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={resignDate}
                    onChange={(e) => setResignDate(e.target.value)}
                    className="absolute bottom-0 left-0 w-full h-0 opacity-0 pointer-events-none"
                    required
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-6 flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Cảnh báo: Tác vụ này sẽ ngừng lịch làm việc văn phòng của nhân sự từ ngày đã chọn và gạt bỏ toàn bộ công tương lai. Không ảnh hưởng đến các hợp đồng chạy dự án ngoài.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-75 flex items-center shadow-lg shadow-red-500/30 cursor-pointer"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Xác nhận báo nghỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
