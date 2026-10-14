import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 px-0 sm:px-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="pq-modal-sheet w-full sm:max-w-md bg-white
                   rounded-t-3xl sm:rounded-2xl shadow-xl
                   animate-[pqSlideUp_240ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between
                        border-b border-slate-100 px-5 py-4 rounded-t-3xl sm:rounded-t-2xl">
          <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="sticky bottom-0 bg-white flex flex-col-reverse sm:flex-row
                          justify-end gap-2 border-t border-slate-100 px-5 py-4
                          rounded-b-3xl sm:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}