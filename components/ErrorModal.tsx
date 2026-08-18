"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({
  isOpen,
  title = "Thông báo lỗi",
  message,
  onClose,
}: ErrorModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-100 p-6 text-center transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon cảnh báo tròn màu đỏ */}
        <div className="w-12 h-12 bg-red-100/80 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-red-200 shadow-2xs">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
        </div>

        {/* Tiêu đề */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

        {/* Nội dung báo lỗi */}
        <div className="text-sm text-gray-600 leading-relaxed mb-6 font-medium whitespace-pre-line px-1">
          {message}
        </div>

        {/* Nút OK */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full py-2.5 px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}
