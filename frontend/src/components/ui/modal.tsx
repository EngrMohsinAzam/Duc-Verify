"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreenMobile?: boolean;
  compact?: boolean;
  wide?: boolean;
  hideHeader?: boolean;
  /** Fixed card — no internal scroll (success modals) */
  fitContent?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  fullScreenMobile = false,
  compact = false,
  wide = false,
  hideHeader = false,
  fitContent = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = fitContent
    ? "max-w-[680px]"
    : wide
      ? "sm:max-w-3xl lg:max-w-4xl"
      : fullScreenMobile
        ? "sm:max-w-lg"
        : "max-w-lg";

  const overflowClass = fitContent
    ? "overflow-hidden"
    : fullScreenMobile
      ? "max-h-[100dvh] overflow-y-auto"
      : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full bg-white shadow-2xl rounded-2xl ${widthClass} ${overflowClass} border border-slate-200/80`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div
            className={`flex items-center justify-between border-b border-border ${compact ? "px-4 py-2.5" : "px-6 py-4"}`}
          >
            {title && (
              <h2
                className={`font-semibold text-text-primary ${compact ? "text-sm" : "text-lg"}`}
              >
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1.5 text-text-secondary hover:bg-slate-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className={hideHeader ? "" : compact ? "p-4" : "p-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}
