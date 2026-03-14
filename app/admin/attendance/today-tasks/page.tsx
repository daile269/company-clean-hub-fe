"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { assignmentService, Assignment } from "@/services/assignmentService";
import { useAuth } from "@/contexts/AuthContext";

export default function TodayTasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.roleName === "EMPLOYEE") {
      loadTodayTasks();
    } else if (user) {
      setLoading(false);
    }
  }, [user?.id, user?.roleName]);

  const loadTodayTasks = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const data = await assignmentService.getTodayAssignmentsForCapture(user.id);
      setAssignments(data);
    } catch (error) {
      console.error("Error loading today tasks:", error);
      toast.error("Không thể tải danh sách công việc hôm nay");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  if (!user || user.roleName !== "EMPLOYEE") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Trang này dành cho Nhân viên</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điểm danh hôm nay</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Intl.DateTimeFormat("vi-VN", { dateStyle: 'full' }).format(new Date())}
          </p>
        </div>
        <button
          onClick={loadTodayTasks}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Tải lại"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tuyệt vời!</h3>
              <p className="text-gray-500 mt-2">Bạn đã hoàn thành tất cả việc chụp ảnh chấm công cho hôm nay.</p>
            </div>
          ) : (
            assignments.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                onClick={() => router.push(`/admin/attendance/capture/${task.id}`)}
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {task.assignmentType === 'FIXED_BY_CONTRACT' ? 'Hợp đồng' : 'Đột xuất'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{task.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {task.customerName || "Địa điểm chưa xác định"}
                  </h3>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{task.contractDescription || "Dịch vụ vệ sinh"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Bắt đầu: {formatDate(task.startDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 mt-auto">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Chụp ảnh ngay</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
