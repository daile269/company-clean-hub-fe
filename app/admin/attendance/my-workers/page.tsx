"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import verificationService, {
  AssignmentVerificationResponse,
  VerificationImageResponse,
} from "@/services/verificationService";
import GpsMap from "@/components/GpsMap";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Cho chup" },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-800", label: "Dang xu ly" },
  APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Da duyet" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Tu choi" },
  AUTO_APPROVED: { bg: "bg-purple-100", text: "text-purple-800", label: "Tu dong duyet" },
  BYPASS_APPROVED: { bg: "bg-orange-100", text: "text-orange-800", label: "Duyet bo qua" },
};

export default function MyWorkersPage() {
  const [verifications, setVerifications] = useState<AssignmentVerificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<AssignmentVerificationResponse | null>(null);
  const [images, setImages] = useState<VerificationImageResponse[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getMyAssignmentVerifications();
      setVerifications(data);
    } catch (error) {
      console.error("Error loading verifications:", error);
      toast.error("Loi khi tai danh sach anh cham cong");
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = async (verification: AssignmentVerificationResponse) => {
    setSelectedVerification(verification);
    setSelectedImageIdx(0);
    setImages([]);
    try {
      setLoadingImages(true);
      const imgs = await verificationService.getVerificationImages(verification.id);
      setImages(imgs);
    } catch {
      toast.error("Khong the tai anh xac minh");
    } finally {
      setLoadingImages(false);
    }
  };

  const closeModal = () => {
    setSelectedVerification(null);
    setImages([]);
    setSelectedImageIdx(0);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] ?? { bg: "bg-gray-100", text: "text-gray-800", label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          <p className="text-sm text-gray-500">Dang tai danh sach nhan vien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Anh cham cong nhan vien</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem anh xac minh cham cong cua nhan vien lam viec theo hop dong cua ban
          </p>
        </div>
        <button
          onClick={loadVerifications}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Lam moi
        </button>
      </div>

      {verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">Chua co anh cham cong</h3>
          <p className="text-sm text-gray-500">Nhan vien chua thuc hien chup anh xac minh cho hop dong cua ban</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">
              Tong cong: <span className="font-semibold text-gray-800">{verifications.length}</span> lan xac minh
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {verifications.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{v.employeeName}</p>
                    <p className="text-xs text-gray-500">{v.employeeCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-xs text-gray-500 mb-1">So lan chup</p>
                    <p className="text-sm font-semibold text-gray-700">{v.currentAttempts}/{v.maxAttempts}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-xs text-gray-500 mb-1">Ngay tao</p>
                    <p className="text-sm text-gray-700">{new Date(v.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  {getStatusBadge(v.status)}
                  <button
                    onClick={() => handleViewImages(v)}
                    disabled={v.currentAttempts === 0}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem anh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Anh xac minh cham cong</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedVerification.employeeName} &middot; {selectedVerification.employeeCode}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingImages ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-3" />
                  <p className="text-sm text-gray-500">Dang tai anh...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">Chua co anh xac minh</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIdx ? "border-green-500 scale-105" : "border-transparent hover:border-gray-300"}`}
                        >
                          <img src={img.cloudinaryUrl} alt={`Anh ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {(() => {
                    const img = images[selectedImageIdx];
                    return (
                      <div>
                        <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden mb-4">
                          <Image src={img.cloudinaryUrl} alt={`Anh xac minh ${selectedImageIdx + 1}`} fill className="object-contain" />
                          {images.length > 1 && (
                            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {selectedImageIdx + 1}/{images.length}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-0.5">Thoi gian chup</p>
                            <p className="text-sm font-medium text-gray-800">{new Date(img.capturedAt).toLocaleString("vi-VN")}</p>
                          </div>
                          {img.address && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-0.5">Dia chi</p>
                              <p className="text-sm font-medium text-gray-800">{img.address}</p>
                            </div>
                          )}
                          {img.faceConfidence != null && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-0.5">Do tin cay khuon mat</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${img.faceConfidence >= 0.8 ? "bg-green-500" : img.faceConfidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
                                    style={{ width: `${Math.min(img.faceConfidence * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{(img.faceConfidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {img.latitude && img.longitude && (
                          <div className="mt-3">
                            <GpsMap latitude={img.latitude} longitude={img.longitude} address={img.address} />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {images.length > 1 && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <button onClick={() => setSelectedImageIdx((i) => Math.max(0, i - 1))} disabled={selectedImageIdx === 0} className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
                        Anh truoc
                      </button>
                      <button onClick={() => setSelectedImageIdx((i) => Math.min(images.length - 1, i + 1))} disabled={selectedImageIdx === images.length - 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
                        Anh tiep
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedVerification.status)}
                <span className="text-sm text-gray-500">{selectedVerification.currentAttempts}/{selectedVerification.maxAttempts} anh da chup</span>
              </div>
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                Dong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
