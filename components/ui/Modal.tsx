// ABOUTME: Shared modal dialog with backdrop, close on escape, focus trap
// ABOUTME: Used for confirmations and future dialogs

"use client";

import { useEffect, useRef, useCallback } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-none max-h-none bg-transparent backdrop:bg-black/40 p-4 flex items-center justify-center"
    >
      <div className="bg-surface-card rounded-2xl shadow-modal w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-base font-semibold text-text-primary font-heading">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border-subtle flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
