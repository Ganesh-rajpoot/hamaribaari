import Badge from './ui/Badge';

export default function TokenRow({ token, actions }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">#{token.tokenNumber}</span>
          <Badge status={token.status} />
          {token.source === 'WALK_IN' && (
            <span className="text-[10px] uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">walk-in</span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate">
          {token.patient.fullName} • {token.patient.mobile} • {token.arrivalStatus === 'ARRIVED' ? 'Arrived' : 'Not arrived'}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 justify-end">
        {actions}
      </div>
    </div>
  );
}