import { useEffect } from 'react';

export default function BottomSheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="pq-sheet-backdrop" onClick={onClose} />
      <div className="pq-sheet" role="dialog" aria-modal="true">
        <div className="pq-sheet-handle" />
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-base">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 px-5 pt-2 pb-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}