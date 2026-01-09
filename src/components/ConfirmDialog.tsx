"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { clsx } from "clsx";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean; // Red styling for destructive actions
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-background border border-white/10 rounded-xl shadow-lg p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {isDangerous && (
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    isDangerous
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                      : "bg-primary hover:bg-primary/90 text-white"
                  )}
                >
                  {isLoading ? "Loading..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
