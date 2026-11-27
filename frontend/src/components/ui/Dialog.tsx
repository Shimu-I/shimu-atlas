import { useEffect, useRef, type ReactNode } from "react";

/** Accessible modal built on native <dialog>: focus trap, Esc to close, restores focus. */
export function Dialog({
  open, onClose, title, children, className = "",
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={`m-auto w-[min(92vw,34rem)] rounded-panel border border-line bg-surface p-0 text-fg shadow-lg ${className}`}
    >
      {open && children}
    </dialog>
  );
}
