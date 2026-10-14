import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Ticket, Search, Clock3, CheckCircle2,
  AlertCircle, XCircle, Ban,
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Badge from '../../components/ui/Badge';
import { getMyTokens } from '../../api/tokens';
import { getErrorMessage } from '../../api/client';
import useInterval from '../../hooks/useInterval';

/* ---------------- helpers ---------------- */

const ACTIVE_STATUSES = ['WAITING', 'CALLED', 'IN_CONSULTATION'];
const DONE_STATUSES = ['COMPLETED', 'SKIPPED', 'CANCELLED', 'NO_SHOW'];

const isActive = (t) => ACTIVE_STATUSES.includes(t.status);
const isDone   = (t) => DONE_STATUSES.includes(t.status);

/** Is this token's session today? Compare in local time. */
const isToday = (t) => {
  const d = new Date(t.session.sessionDate);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth()    === n.getMonth() &&
    d.getDate()     === n.getDate()
  );
};

const statusIcon = (status) => {
  switch (status) {
    case 'WAITING':         return <Clock3 className="w-4 h-4" />;
    case 'CALLED':          return <AlertCircle className="w-4 h-4" />;
    case 'IN_CONSULTATION': return <Ticket className="w-4 h-4" />;
    case 'COMPLETED':       return <CheckCircle2 className="w-4 h-4" />;
    case 'CANCELLED':       return <XCircle className="w-4 h-4" />;
    case 'NO_SHOW':         return <Ban className="w-4 h-4" />;
    case 'SKIPPED':         return <AlertCircle className="w-4 h-4" />;
    default:                return <Ticket className="w-4 h-4" />;
  }
};

const pillClassFor = (status) => ({
  WAITING:         'pq-pill-waiting',
  CALLED:          'pq-pill-called',
  IN_CONSULTATION: 'pq-pill-inconsult',
  COMPLETED:       'pq-pill-done',
  SKIPPED:         'pq-pill-skipped',
  CANCELLED:       'pq-pill-cancelled',
  NO_SHOW:         'pq-pill-cancelled',
}[status] || 'pq-pill-waiting');

/* ---------------- subcomponents ---------------- */

function SkeletonCard() {
  return (
    <div className="pq-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="pq-skel h-6 w-24" />
          <div className="pq-skel h-4 w-40" />
          <div className="pq-skel h-3 w-32" />
        </div>
        <div className="pq-skel h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

function ActiveCard({ token }) {
  return (
    <Link
      to={`/patient/tokens/${token.id}`}
      className="block pq-card pq-card-tap p-5 pq-fade-in"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pq-token">
              <span className="pq-token-hash">#</span>
              <span className="text-3xl font-bold text-brand-600 tabular-nums">
                {token.tokenNumber}
              </span>
            </span>
            <span className={`pq-pill ${pillClassFor(token.status)}`}>
              <span className="pq-dot pq-dot-live" />
              {token.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-2 text-sm font-medium text-slate-800 truncate">
            {token.session.doctor?.user?.fullName}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {token.session.doctor?.department?.name} •{' '}
            {token.session.hospital?.name}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {token.session.startTime} – {token.session.endTime}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function HistoryRow({ token }) {
  return (
    <Link
      to={`/patient/tokens/${token.id}`}
      className="flex items-center justify-between rounded-2xl border
                 border-slate-100 px-4 py-3 hover:bg-slate-50 transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center
                         ${token.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600'
                           : token.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600'
                           : token.status === 'NO_SHOW'   ? 'bg-rose-50 text-rose-600'
                           : token.status === 'SKIPPED'   ? 'bg-amber-50 text-amber-600'
                           : 'bg-slate-100 text-slate-500'}`}>
          {statusIcon(token.status)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">#{token.tokenNumber}</span>
            <Badge status={token.status} />
          </div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {token.session.doctor?.user?.fullName} •{' '}
            {new Date(token.createdAt).toLocaleDateString(undefined, {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </Link>
  );
}

/* ---------------- page ---------------- */

export default function PatientTokens() {
  const [tokens, setTokens] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setErr('');
    try { setTokens(await getMyTokens()); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useInterval(load, 15000);

  const { active, today, past } = useMemo(() => {
    const activeList = [];
    const todayList = [];
    const pastList = [];

    for (const t of tokens) {
      if (isActive(t)) activeList.push(t);
      else if (isDone(t) && isToday(t)) todayList.push(t);
      else pastList.push(t);
    }

    // Active: show CALLED first, then IN_CONSULTATION, then by token number.
    const order = { CALLED: 0, IN_CONSULTATION: 1, WAITING: 2 };
    activeList.sort((a, b) =>
      (order[a.status] - order[b.status]) ||
      (a.tokenNumber - b.tokenNumber),
    );

    // Today (finished): most recent first
    todayList.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt));

    // Past: most recent first
    pastList.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt));

    return { active: activeList, today: todayList, past: pastList };
  }, [tokens]);

  const isEmpty = !busy && active.length === 0 && today.length === 0 && past.length === 0;

  return (
    <PatientLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My tokens</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track live queues and see your past visits.
          </p>
        </div>
        <Link
          to="/hospitals"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white
                     px-3 py-2 text-sm font-medium active:scale-[0.98] transition"
        >
          <Search className="w-4 h-4" /> Find
        </Link>
      </div>

      {err && (
        <div className="mt-4 alert alert-danger pq-fade-in">{err}</div>
      )}

      {/* Loading skeletons */}
      {busy && (
        <div className="mt-6 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="mt-8 pq-card p-8 text-center pq-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Ticket className="w-7 h-7 text-slate-400" />
          </div>
          <div className="mt-4 font-semibold text-slate-800">
            No tokens yet
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Browse hospitals to join an OPD queue. It only takes a few seconds.
          </p>
          <Link
            to="/hospitals"
            className="pq-cta mt-5 max-w-xs mx-auto"
          >
            <Search className="w-4 h-4" /> Find a hospital
          </Link>
        </div>
      )}

      {/* Active tokens */}
      {!busy && active.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Active</h2>
            <span className="pq-pill pq-pill-waiting">
              <span className="pq-dot pq-dot-live" />
              {active.length}
            </span>
          </div>
          <div className="space-y-3">
            {active.map((t) => (
              <ActiveCard key={t.id} token={t} />
            ))}
          </div>
        </section>
      )}

      {/* Finished today */}
      {!busy && today.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Today</h2>
          <div className="space-y-2">
            {today.map((t) => (
              <HistoryRow key={t.id} token={t} />
            ))}
          </div>
        </section>
      )}

      {/* Older */}
      {!busy && past.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Past</h2>
          <div className="space-y-2">
            {past.slice(0, 30).map((t) => (
              <HistoryRow key={t.id} token={t} />
            ))}
            {past.length > 30 && (
              <p className="text-xs text-slate-400 text-center pt-2">
                Showing the most recent 30 of {past.length} tokens.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Bottom padding to clear the fixed bottom nav */}
      <div className="h-6" />
    </PatientLayout>
  );
}