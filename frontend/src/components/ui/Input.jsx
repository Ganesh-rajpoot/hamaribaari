export default function Input({ label, hint, error, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm text-slate-700 mb-1">{label}</span>}
      <input
        className={`w-full rounded-xl border px-4 py-3 text-lg outline-none
          ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500'}`}
        {...rest}
      />
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}