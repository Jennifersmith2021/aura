"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Toast, TOAST_EVENT_NAME } from "@/lib/toast";
import { clsx } from "clsx";

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<Toast>;
      const toast = customEvent.detail;
      
      setToasts((prev) => [...prev, toast]);

      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/30";
      case "error":
        return "bg-red-500/20 border-red-500/30";
      case "warning":
        return "bg-amber-500/20 border-amber-500/30";
      case "info":
        return "bg-blue-500/20 border-blue-500/30";
      default:
        return "bg-white/5 border-white/10";
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 pointer-events-none space-y-2 md:bottom-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 100 }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg border pointer-events-auto",
              getBackgroundColor(toast.type)
            )}
          >
            {getIcon(toast.type)}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
