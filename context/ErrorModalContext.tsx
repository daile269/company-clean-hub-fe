"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ErrorModal from "@/components/ErrorModal";

interface ErrorModalContextType {
  showError: (message: string, title?: string) => void;
  closeError: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextType | undefined>(undefined);

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
  }>({
    isOpen: false,
    message: "",
    title: "Thông báo lỗi",
  });

  const showError = useCallback((message: string, title = "Thông báo lỗi") => {
    if (!message) return;
    setModalState({
      isOpen: true,
      message,
      title,
    });
  }, []);

  const closeError = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Globally intercept toast.error calls to route them to ErrorModal
  useEffect(() => {
    const originalToastError = toast.error;

    // Override toast.error
    (toast as any).error = (message: any, options?: any) => {
      let errorMsg = "";
      if (typeof message === "string") {
        errorMsg = message;
      } else if (message?.message && typeof message.message === "string") {
        errorMsg = message.message;
      } else if (React.isValidElement(message)) {
        // If JSX passed to toast.error, render original toast or extract text
        return originalToastError(message, options);
      } else {
        errorMsg = String(message || "Có lỗi xảy ra");
      }

      if (errorMsg) {
        showError(errorMsg);
        return "error-modal-id";
      }

      return originalToastError(message, options);
    };

    return () => {
      (toast as any).error = originalToastError;
    };
  }, [showError]);

  return (
    <ErrorModalContext.Provider value={{ showError, closeError }}>
      {children}
      <ErrorModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={closeError}
      />
    </ErrorModalContext.Provider>
  );
}

export function useErrorModal() {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error("useErrorModal must be used within an ErrorModalProvider");
  }
  return context;
}
