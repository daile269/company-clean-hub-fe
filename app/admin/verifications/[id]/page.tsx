"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import verificationService, { AssignmentVerificationResponse } from "@/services/verificationService";
import contractService from "@/services/contractService";
import Image from "next/image";

export default function VerificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const verificationId = params.id as string;

  const [verification, setVerification] = useState<AssignmentVerificationResponse | null>(null);
  const [verificationImages, setVerificationImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadVerificationDetail();
  }, [verificationId]);

  const loadVerificationDetail = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getPendingVerifications();
      const verification = data.find((v) => v.id === parseInt(verificationId));
      
      if (!verification) {
        toast.error("Không tìm thấy yêu cầu xác minh");
        router.push("/admin/verifications");
        return;
      }

      setVerification(verification);
      const images = await verificationService.getVerificationImages(verification.id);
      setVerificationImages(images);
    } catch (error) {
      console.error("Error loading verification detail:", error);
      toast.error("Lỗi khi tải chi tiết xác minh");
      router.push("/admin/verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!verification) return;
    
    if (!confirm("Bạn có chắc chắn muốn duyệt yêu cầu xác minh này?")) {
      return;
    }

    try {
      setProcessing(true);
      // Business rule: after manager approves, always disable image verification
      await verificationService.approveVerification(verification.id, true);
      if (verification.contractId) {
        await contractService.update(String(verification.contractId), {
          requiresImageVerification: false,
        } as any);
      }
      toast.success("Đã duyệt xác minh thành công!");
      router.push("/admin/verifications");
    } catch (error: any) {
      console.error("Error approving verification:", error);
      toast.error(error.message || "Lỗi khi duyệt xác minh");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!verification) return;
    
    const reason = prompt("Nhập lý do từ chối (tùy chọn):");
    if (reason === null) return;

    try {
      setProcessing(true);
      await verificationService.rejectVerification(verification.id, reason);
      toast.success("Đã từ chối xác minh. Nhân viên có thể chụp lại.");
      router.push("/admin/verifications");
    } catch (error: any) {
      console.error("Error rejecting verification:", error);
      toast.error(error.message || "Lỗi khi từ chối xác minh");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ chụp" },
      IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-800", label: "Đang xử lý" },
      APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Đã duyệt" },
      REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Từ chối" },
      AUTO_APPROVED: { bg: "bg-purple-100", text: "text-purple-800", label: "Tự động duyệt" },
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      NEW_EMPLOYEE: "Nhân viên mới",
      CONTRACT_SETTING: "Yêu cầu hợp đồng",
    };
    return reasonMap[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Không tìm thấy yêu cầu xác minh</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/verifications")}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">Chi tiết xác minh hình ảnh</h1>
        </div>

        <div className="p-6">
          {/* Thông tin nhân viên */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Thông tin nhân viên</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên nhân viên</p>
                <p className="font-medium">{verification.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã nhân viên</p>
                <p className="font-medium">{verification.employeeCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lý do xác minh</p>
                <p className="font-medium">{getReasonLabel(verification.reason)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(verification.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lần chụp</p>
                <p className="font-medium">
                  {verification.currentAttempts}/{verification.maxAttempts}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(verification.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Ảnh xác minh */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ảnh xác minh ({verificationImages.length})</h3>
            {verificationImages.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chưa có ảnh xác minh</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verificationImages.map((image, index) => (
                  <div key={image.id} className="border rounded-lg p-4">
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg mb-3">
                      <Image
                        src={image.cloudinaryUrl}
                        alt={`Verification ${index + 1}`}
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Thời gian:</span>{" "}
                        {new Date(image.capturedAt).toLocaleString("vi-VN")}
                      </p>
                      {image.latitude && image.longitude && (
                        <p className="text-gray-600">
                          <span className="font-medium">GPS:</span> {image.latitude.toFixed(6)},{" "}
                          {image.longitude.toFixed(6)}
                        </p>
                      )}
                      {image.address && (
                        <p className="text-gray-600">
                          <span className="font-medium">Địa chỉ:</span> {image.address}
                        </p>
                      )}
                      {image.faceConfidence && (
                        <p className="text-gray-600">
                          <span className="font-medium">Độ tin cậy khuôn mặt:</span>{" "}
                          {(image.faceConfidence * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {verification.status !== "APPROVED" && verification.status !== "AUTO_APPROVED" && (
            <div className="border-t pt-4">
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing || verificationImages.length === 0}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {processing ? "Đang xử lý..." : "Duyệt xác minh"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
