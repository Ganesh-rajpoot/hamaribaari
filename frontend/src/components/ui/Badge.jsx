const colorMap = {
  SCHEDULED:   'bg-slate-100 text-slate-700',
  OPEN:        'bg-teal-100 text-teal-800',
  PAUSED:      'bg-amber-100 text-amber-800',
  CLOSED:      'bg-slate-200 text-slate-700',
  CANCELLED:   'bg-red-100 text-red-700',
  UNAVAILABLE: 'bg-rose-100 text-rose-700',
  WAITING:     'bg-blue-100 text-blue-800',
  CALLED:      'bg-indigo-100 text-indigo-800',
  IN_CONSULTATION: 'bg-teal-100 text-teal-800',
  COMPLETED:   'bg-emerald-100 text-emerald-800',
  SKIPPED:     'bg-amber-100 text-amber-800',
  NO_SHOW:     'bg-rose-100 text-rose-700',
};

export default function Badge({ status, children }) {
  const cls = colorMap[status] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${cls}`}>{children ?? status}</span>;
}