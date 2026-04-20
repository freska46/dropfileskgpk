"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Авто-удаление через 4 секунды
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  const colors: Record<ToastType, string> = {
    success: "border-green-500/40 bg-green-500/10",
    error: "border-red-500/40 bg-red-500/10",
    info: "border-blue-500/40 bg-blue-500/10",
  };

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (m) => addToast(m, "success"),
        error: (m) => addToast(m, "error"),
        info: (m) => addToast(m, "info"),
      }}
    >
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-slideInRight shadow-lg ${colors[t.type]}`}
          >
            <span className="text-lg">{icons[t.type]}</span>
            <span className="text-sm flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
