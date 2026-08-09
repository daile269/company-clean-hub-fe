"use client";
import { useState } from "react";
import { assignmentService } from "@/services/assignmentService";
import toast from "react-hot-toast";

interface AdvanceNoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  currentAdvanceNote: number;
  employeeName?: string;
  onSuccess: () => void;
}

export default function AdvanceNoteEditModal({
  isOpen,
  onClose,
  assignmentId,
  currentAdvanceNote,
  employeeName,
  onSuccess,
}: AdvanceNoteEditModalProps) {
  const [advanceNote, setAdvanceNote] = useState<number>(currentAdvanceNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await assignmentService.updateAdvanceNote(assignmentId, advanceNote);
      toast.success("Đã cập nhật tiền xin ứng lương");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating advance note:", error);
      toast.error(error?.message || "Không thể cập nhật tiền xin ứng lương");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sửa tiền xin ứng lương
            </h3>
            {employeeName && (
              <p className="text-sm text-gray-500 mt-1">
                Nhân viên: <span className="font-semibold">{employeeName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
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

        <div className="mb-2">
          <p className="text-xs text-gray-500">
            Phân công #{assignmentId}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiền xin ứng (VNĐ)
          </label>
          <input
            type="number"
            value={advanceNote || ""}
            onChange={(e) => setAdvanceNote(Number(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
            placeholder="0"
            min="0"
            step="any"
            autoFocus
          />
          {advanceNote > 0 && (
            <p className="text-sm text-yellow-700 mt-2 font-medium">
              {formatCurrency(advanceNote)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                Đang lưu...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Lưu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
