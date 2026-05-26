"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";

export type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
  confirmText: string;
  cancelText: string;
  resolve?: (value: boolean) => void;
}

interface ModalContextType {
  showAlert: (message: string, title?: string, type?: "success" | "error" | "warning" | "info") => Promise<void>;
  showConfirm: (message: string, title?: string, type?: "warning" | "error") => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancelar",
  });

  const showAlert = (message: string, title = "Aviso", type: "success" | "error" | "warning" | "info" = "info") => {
    return new Promise<void>((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
        confirmText: "OK",
        cancelText: "",
        resolve: () => {
          resolve();
        },
      });
    });
  };

  const showConfirm = (message: string, title = "Confirmar", type: "warning" | "error" = "warning") => {
    return new Promise<boolean>((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: "confirm", // Forced to confirm type for buttons layout
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        resolve: (val) => {
          resolve(val);
        },
      });
    });
  };

  const handleConfirm = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (modal.resolve) {
      modal.resolve(true);
    }
  };

  const handleCancel = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (modal.resolve) {
      modal.resolve(false);
    }
  };

  // Select icon and colors based on type
  let IconComponent = <Info className="w-8 h-8" />;
  let iconBgClass = "bg-blue-50 text-blue-600";
  let confirmBtnClass = "bg-blue-600 hover:bg-blue-700 shadow-blue-100";

  if (modal.type === "success") {
    IconComponent = <CheckCircle2 className="w-8 h-8" />;
    iconBgClass = "bg-emerald-50 text-emerald-600";
    confirmBtnClass = "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100";
  } else if (modal.type === "error") {
    IconComponent = <XCircle className="w-8 h-8" />;
    iconBgClass = "bg-rose-50 text-rose-600";
    confirmBtnClass = "bg-rose-600 hover:bg-rose-700 shadow-rose-100";
  } else if (modal.type === "warning") {
    IconComponent = <AlertTriangle className="w-8 h-8" />;
    iconBgClass = "bg-amber-50 text-amber-600";
    confirmBtnClass = "bg-amber-500 hover:bg-amber-600 shadow-amber-100";
  } else if (modal.type === "confirm") {
    IconComponent = <HelpCircle className="w-8 h-8" />;
    iconBgClass = "bg-blue-50 text-blue-600";
    confirmBtnClass = "bg-blue-600 hover:bg-blue-700 shadow-blue-100";
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop/Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={modal.type === "confirm" ? undefined : handleCancel}
          />

          {/* Modal Content Box */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon Circle */}
              <div className={`p-4 rounded-full ${iconBgClass} transition-colors duration-200`}>
                {IconComponent}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {modal.title}
              </h3>

              {/* Message */}
              <p className="text-sm font-medium text-slate-500 whitespace-pre-wrap leading-relaxed">
                {modal.message}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors active:scale-[0.98]"
                  >
                    {modal.cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 px-5 py-3 rounded-2xl text-white font-bold transition-all shadow-lg hover:brightness-110 active:scale-[0.98] ${confirmBtnClass}`}
                  >
                    {modal.confirmText}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConfirm}
                  className={`w-full px-5 py-3 rounded-2xl text-white font-bold transition-all shadow-lg hover:brightness-110 active:scale-[0.98] ${confirmBtnClass}`}
                >
                  {modal.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
