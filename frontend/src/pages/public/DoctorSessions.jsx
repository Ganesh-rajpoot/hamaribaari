// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { CalendarDays, Clock } from 'lucide-react';
// import { getDoctorSessions } from '../../api/hospitals';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';

// const todayISO = () => new Date().toISOString().slice(0, 10);

// export default function DoctorSessions() {
//   const { id } = useParams();
//   const [date, setDate] = useState(todayISO());
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState('');

//   useEffect(() => {
//     setErr('');
//     getDoctorSessions(id, date).then(setData).catch((e) =>
//       setErr(e?.response?.data?.error?.message || 'Failed to load'));
//   }, [id, date]);

//   return (
//     <section className="max-w-3xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold">{data?.doctor?.user?.fullName || 'Doctor'}</h1>
//       <p className="text-slate-500 text-sm">
//         {data?.doctor?.department?.name} • {data?.doctor?.hospital?.name}
//       </p>

//       <div className="mt-4 flex items-center gap-2">
//         <label className="text-sm text-slate-700">Date</label>
//         <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                className="rounded-xl border border-slate-200 px-3 py-2" />
//       </div>

//       {err && <p className="mt-4 text-red-600">{err}</p>}

//       <div className="mt-6 space-y-3">
//         {(data?.sessions || []).map((s) => (
//           <Card key={s.id}>
//             <div className="p-5 flex items-center justify-between">
//               <div>
//                 <div className="font-medium flex items-center gap-2">
//                   <Clock className="w-4 h-4 text-brand-600" />
//                   {s.startTime} – {s.endTime}
//                 </div>
//                 <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
//                   <CalendarDays className="w-3.5 h-3.5" />
//                   {new Date(s.sessionDate).toDateString()}
//                 </div>
//                 <div className="mt-1 text-xs text-slate-500">
//                   Booked {s.bookedCount} / {s.maxCapacity}
//                 </div>
//               </div>
//               <div className="text-right">
//                 <Badge status={s.status} />
//                 {s.status === 'OPEN' && (
//                   <div className="mt-2">
//                     <Link to={`/patient/join/${s.id}?doctor=${id}`}
//                             className="text-sm text-brand-600 font-medium">Join queue →</Link>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Card>
//         ))}
//         {data && data.sessions.length === 0 && (
//           <p className="text-slate-500">No OPD sessions on this date.</p>
//         )}
//       </div>
//     </section>
//   );
// }


import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Clock, ArrowLeft, Users, DoorOpen, Timer,
  ChevronLeft, ChevronRight, RefreshCw, Ticket, Lock, AlertTriangle,
  Sparkles, CheckCircle2,
} from 'lucide-react';
import { getDoctorSessions } from '../../api/hospitals';
import { useAuth } from '../../context/AuthContext';
import useInterval from '../../hooks/useInterval';

/* ---------------- helpers ---------------- */

const ymd = (d) => {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    .toISOString()
    .slice(0, 10);
};

const todayStr = () => ymd(new Date());
const tomorrowStr = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return ymd(t);
};

const formatLong = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
  });
};

const initialsOf = (name = '') =>
  name
    .replace(/^(Dr\.?\s+)/i, '')
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'DR';

const hashOf = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const PALETTE = [
  'from-teal-500 to-emerald-500',
  'from-sky-500 to-indigo-500',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-cyan-500',
  'from-rose-500 to-pink-500',
];
const gradientFor = (id = '') => PALETTE[hashOf(id) % PALETTE.length];

/* session-specific UI meta */
const SESSION_META = {
  OPEN:        { label: 'Open now',    cls: 'pq-pill pq-pill-inconsult' },
  PAUSED:      { label: 'Paused',      cls: 'pq-pill pq-pill-skipped' },
  SCHEDULED:   { label: 'Opens soon',  cls: 'pq-pill pq-pill-waiting' },
  CLOSED:      { label: 'Closed',      cls: 'pq-pill pq-pill-cancelled' },
  CANCELLED:   { label: 'Cancelled',   cls: 'pq-pill pq-pill-cancelled' },
  UNAVAILABLE: { label: 'Unavailable', cls: 'pq-pill pq-pill-cancelled' },
};

/* ---------------- page ---------------- */

export default function DoctorSessions() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const res = await getDoctorSessions(id, date);
      setData(res);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load sessions');
    } finally {
      setBusy(false);
    }
  }, [id, date]);

  useEffect(() => { setBusy(true); load(); }, [load]);

  // Auto-refresh when viewing today (for live availability)
  useInterval(() => {
    if (date === todayStr()) load();
  }, 20000);

  /* ------- derive stats ------- */
  const sessions = data?.sessions || [];
  const openCount = sessions.filter((s) => s.status === 'OPEN').length;

  const segments = useMemo(() => ([
    { key: 'today',    label: 'Today',    value: todayStr() },
    { key: 'tomorrow', label: 'Tomorrow', value: tomorrowStr() },
  ]), []);

  const currentSegment = segments.find((s) => s.value === date)?.key || 'custom';

  const shiftDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(ymd(d));
  };

  /* ---------------- render ---------------- */

  /* Loading skeleton */
  if (busy && !data) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="pq-skel h-6 w-24" />
        <div className="pq-skel h-32 mt-3 rounded-3xl" />
        <div className="pq-skel h-14 mt-4 rounded-2xl" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="pq-skel h-32 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  /* Error */
  if (err && !data) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/hospitals" className="inline-flex items-center gap-1 text-sm text-brand-600">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 text-red-800
                        px-4 py-3 text-sm flex items-start gap-3">
          <div className="flex-1">{err}</div>
          <button
            onClick={load}
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-red-200
                       px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </section>
    );
  }

  const doctor = data?.doctor;
  const doctorName = doctor?.user?.fullName || 'Doctor';
  const initials = initialsOf(doctorName);
  const gradient = gradientFor(doctor?.id || id);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-10 animate-screen-in">
      {/* ---------------- Breadcrumb ---------------- */}
      <button
        onClick={() => nav(-1)}
        className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ---------------- Doctor hero ---------------- */}
      <div className="mt-3 pq-card overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient}
                        text-white text-xl font-bold flex items-center justify-center
                        flex-shrink-0 shadow-md`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 truncate">
                {doctorName}
              </h1>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500">
              {doctor?.department?.name && (
                <span className="inline-flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" />
                  {doctor.department.name}
                </span>
              )}
              {doctor?.roomNo && (
                <span className="inline-flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5" />
                  Room {doctor.roomNo}
                </span>
              )}
              {doctor?.avgConsultMinutes && (
                <span className="inline-flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  ~{doctor.avgConsultMinutes} min
                </span>
              )}
            </div>
            {doctor?.hospital?.name && (
              <div className="mt-2 text-xs text-slate-500 truncate">
                {doctor.hospital.name}
                {doctor.hospital.city ? ` • ${doctor.hospital.city}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Date selector ---------------- */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          {/* Prev day */}
          <button
            onClick={() => shiftDay(-1)}
            className="pq-icon-btn"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Segmented control */}
          <div className="pq-segmented flex-1 justify-center">
            {segments.map((s) => (
              <button
                key={s.key}
                aria-pressed={currentSegment === s.key}
                onClick={() => setDate(s.value)}
              >
                {s.label}
              </button>
            ))}
            <label
              className="inline-flex items-center gap-1 px-3 py-1 text-[13px] font-medium
                         text-slate-600 cursor-pointer rounded-lg hover:bg-white/60"
              aria-pressed={currentSegment === 'custom'}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Pick date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
              />
            </label>
          </div>

          {/* Next day */}
          <button
            onClick={() => shiftDay(1)}
            className="pq-icon-btn"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Selected date chip */}
        <div className="mt-2 text-center text-xs text-slate-500">
          {formatLong(date)}
          {openCount > 0 && (
            <span className="ml-2 text-teal-700 font-medium">
              • {openCount} open
            </span>
          )}
        </div>
      </div>

      {/* ---------------- Empty ---------------- */}
      {sessions.length === 0 && (
        <div className="mt-6 pq-card p-8 text-center pq-fade-in">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-slate-400" />
          </div>
          <div className="mt-3 font-semibold text-slate-800">
            No OPD sessions
          </div>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
            This doctor has no sessions on {formatLong(date)}. Try another date.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setDate(todayStr())}
              className="pq-tap rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium
                         text-slate-700 hover:bg-slate-50"
            >
              Go to today
            </button>
            <button
              onClick={() => setDate(tomorrowStr())}
              className="pq-tap rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-medium
                         hover:bg-brand-700"
            >
              Check tomorrow
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Sessions list ---------------- */}
      {sessions.length > 0 && (
        <div className="mt-5 space-y-3">
          {sessions.map((s, i) => (
            <SessionCard
              key={s.id}
              session={s}
              doctorId={id}
              index={i}
              user={user}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-[11px] text-slate-400">
        Register and pay at the hospital reception when you arrive.
      </p>
    </section>
  );
}

/* =================== Session card =================== */

function SessionCard({ session: s, doctorId, index, user }) {
  const meta = SESSION_META[s.status] || SESSION_META.SCHEDULED;
  const isOpen = s.status === 'OPEN';
  const isCancelled = s.status === 'CANCELLED';
  const remaining = Math.max(0, (s.maxCapacity ?? 0) - (s.bookedCount ?? 0));
  const pct = s.maxCapacity
    ? Math.min(100, Math.round(((s.bookedCount || 0) / s.maxCapacity) * 100))
    : 0;
  const isFull = remaining === 0;

  const disabled = !isOpen || isFull;
  const joinHref = user
    ? `/patient/join/${s.id}?doctor=${doctorId}`
    : `/login?next=${encodeURIComponent(`/patient/join/${s.id}?doctor=${doctorId}`)}`;

  return (
    <div
      className="pq-card pq-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="p-5">
        {/* ---------- Top: time + status ---------- */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600
                            flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {s.startTime} – {s.endTime}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(s.sessionDate).toLocaleDateString(undefined, {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </div>
            </div>
          </div>
          <span className={meta.cls}>
            {isOpen && <span className="pq-dot pq-dot-live" />}
            {meta.label}
          </span>
        </div>

        {/* ---------- Meta row ---------- */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {s.bookedCount ?? 0} / {s.maxCapacity ?? 0} booked
          </span>
          {!isFull && !isCancelled && isOpen && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {remaining} slot{remaining === 1 ? '' : 's'} left
            </span>
          )}
          {isFull && (
            <span className="inline-flex items-center gap-1 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              Full
            </span>
          )}
        </div>

        {/* ---------- Capacity bar ---------- */}
        {!isCancelled && s.maxCapacity > 0 && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all
                ${isFull ? 'bg-rose-500'
                  : pct > 70 ? 'bg-orange-500'
                  : 'bg-teal-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {/* ---------- Contextual note ---------- */}
        {s.status === 'SCHEDULED' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-sky-800">
            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Queue opens at <strong>{s.startTime}</strong>. The receptionist will
              activate bookings then.
            </span>
          </div>
        )}
        {s.status === 'PAUSED' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Bookings are temporarily paused. Existing tokens remain valid.</span>
          </div>
        )}
        {s.status === 'CLOSED' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>This session is closed for the day.</span>
          </div>
        )}
        {isCancelled && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Session cancelled
              {s.cancelReason ? ` — ${s.cancelReason}` : ''}
            </span>
          </div>
        )}

        {/* ---------- CTA ---------- */}
        <div className="mt-4">
          {disabled ? (
            <button
              disabled
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                         bg-slate-100 text-slate-400 py-3 text-sm font-semibold
                         cursor-not-allowed"
            >
              {isFull ? 'Queue full' : `Cannot join — ${meta.label.toLowerCase()}`}
            </button>
          ) : (
            <Link
              to={joinHref}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                         text-white py-3 text-sm font-semibold pq-tap
                         bg-gradient-to-r from-teal-500 to-orange-500
                         shadow-lg shadow-teal-500/20 hover:brightness-110"
            >
              <Ticket className="w-4 h-4" /> Join queue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}