"use client";
import { ContractDocument } from "@/types";
import contractDocumentService from "@/services/contractDocumentService";
import { useState } from "react";
import toast from "react-hot-toast";
import { ImageUploader } from "./shared/ImageUploader";
import { usePermission } from "@/hooks/usePermission";

interface ContractDocumentsProps {
  contractId: string | number;
  documents: ContractDocument[];
  onRefresh: () => void;
}

export default function ContractDocuments({
  contractId,
  documents,
  onRefresh,
}: ContractDocumentsProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<ContractDocument | null>(null);
  const canCreate = usePermission("CONTRACT_CREATE");
  const handleUploadDocuments = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      await contractDocumentService.uploadDocuments(contractId, formData);
      toast.success("Tải tài liệu thành công");
      setShowUploadModal(false);
      onRefresh();
      e.currentTarget.value = "";
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Không thể tải tài liệu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeletingId(documentToDelete.id);
      await contractDocumentService.deleteDocument(contractId, documentToDelete.id);
      toast.success("Xóa tài liệu thành công");
      setDocumentToDelete(null);
      onRefresh();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Không thể xóa tài liệu");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Tài liệu hợp đồng
        </h3>
        {canCreate && (
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm tài liệu
        </button>
        )}
      </div>

      {/* Documents Grid */}
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
            >
              <div className="mb-3 relative">
                {doc.documentType === "IMAGE" ? (
                  <img
                    src={contractDocumentService.buildCloudinaryUrl(doc.cloudinaryPublicId)}
                    alt={doc.fileName}
                    className="w-full h-48 object-cover rounded bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-red-50 rounded flex items-center justify-center border-2 border-red-200 overflow-hidden">
                    <iframe
                      src={`${contractDocumentService.buildCloudinaryUrl(doc.cloudinaryPublicId)}#toolbar=0&navpanes=0`}
                      className="w-full h-full"
                      title={doc.fileName}
                    />
                  </div>
                )}
              </div>

              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                {doc.fileName}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {doc.documentType === "IMAGE" ? "Hình ảnh" : "PDF"}
              </p>

              <div className="flex gap-2">
                {doc.documentType === "PDF" ? (
                  <a
                    href={contractDocumentService.buildCloudinaryUrl(doc.cloudinaryPublicId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm text-center inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Mở
                  </a>
                ) : (
                  <a
                    href={contractDocumentService.buildCloudinaryUrl(doc.cloudinaryPublicId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm text-center"
                  >
                    Xem
                  </a>
                )}
                <button
                  onClick={() => setDocumentToDelete(doc)}
                  disabled={isDeletingId === doc.id}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm disabled:opacity-50"
                >
                  {isDeletingId === doc.id ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    "Xóa"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Chưa có tài liệu nào</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tải tài liệu hợp đồng
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ImageUploader
              onChange={handleUploadDocuments}
              isLoading={isUploading}
              loadingText="Đang tải..."
              emptyText="Chưa có tài liệu"
              helpText="Click để chọn hoặc kéo thả ảnh/PDF"
              width="w-full"
              aspectRatio="video"
              multiple
              disabled={isUploading}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xác nhận xóa tài liệu
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa tài liệu "{documentToDelete.fileName}"? Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                disabled={isDeletingId !== null}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={isDeletingId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeletingId !== null ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10"
                      />
                    </svg>
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
