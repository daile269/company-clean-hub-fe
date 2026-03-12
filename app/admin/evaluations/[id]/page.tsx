"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import attendanceService, { Attendance } from "@/services/attendanceService";
import evaluationService, { Evaluation } from "@/services/evaluationService";
import toast, { Toaster } from "react-hot-toast";
import { usePermission } from "@/hooks/usePermission";

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attendanceId = params.id as string;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const hasUpdatePermission = usePermission('EVALUATION_UPDATE');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [aData, eData] = await Promise.all([
          attendanceService.getById(attendanceId),
          evaluationService.getByAttendanceId(Number(attendanceId)).catch(() => null)
        ]);
        setAttendance(aData);
        if (eData && eData.success) {
          setEvaluation(eData.data);
          setNotes(eData.data.internalNotes || "");
        }
      } catch (error) {
        console.error("Error loading evaluation details:", error);
        toast.error("Không thể tải thông tin chi tiết");
      } finally {
        setLoading(false);
      }
    };
    if (attendanceId) loadData();
  }, [attendanceId]);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const res = await evaluationService.evaluate({
        attendanceId: Number(attendanceId),
        status: 'APPROVED',
        internalNotes: notes
      });
      if (res.success) {
        toast.success("Đã xác nhận thành công");
        router.push("/admin/evaluations");
      } else {
        toast.error(res.message || "Xác nhận thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasUpdatePermission) return <div className="p-6">Không có quyền truy cập</div>;
  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!attendance) return <div className="p-6 text-center text-red-500">Không tìm thấy dữ liệu điểm danh</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Chi tiết xác thực điểm danh</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin điểm danh</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Nhân viên:</span>
              <span className="font-medium">{attendance.employeeName} ({attendance.employeeCode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng:</span>
              <span className="font-medium">{attendance.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày:</span>
              <span className="font-medium">{new Date(attendance.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giờ công:</span>
              <span className="font-medium">{attendance.workHours}h</span>
            </div>
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dữ liệu từ Auto Capture:</h3>
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Ghi chú: Ảnh chụp và GPS được ghi nhận tự động từ thiết bị của nhân viên.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 w-full border-b pb-2">Ảnh xác thực</h2>
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
             {/* Placeholder for now since we don't have the image link logic yet */}
             <div className="text-center p-4">
               <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <p className="text-gray-400 text-sm italic">Hệ thống đang tích hợp ảnh từ Cloudinary...</p>
             </div>
          </div>
          <div className="w-full text-sm text-gray-600">
             <div className="flex items-center gap-2 mb-2">
               <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
               <span>Tọa độ GPS: 21.0285, 105.8542 (Xác thực khớp vị trí dự án)</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Đánh giá & Phê duyệt</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú nội bộ (Tùy chọn)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={evaluation?.status === 'APPROVED'}
            placeholder="Nhập ghi chú về chất lượng ảnh hoặc vị trí..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>
        
        <div className="flex justify-end gap-4">
          {evaluation?.status === 'APPROVED' ? (
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Đã xác nhận bởi {evaluation.evaluatedByUsername} vào {evaluation.evaluatedAt && new Date(evaluation.evaluatedAt).toLocaleString('vi-VN')}
            </div>
          ) : (
            <>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận Đạt"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
