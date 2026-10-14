// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { Stethoscope } from 'lucide-react';
// import { getDoctors } from '../../api/hospitals';
// import Card from '../../components/ui/Card';

// export default function DepartmentDoctors() {
//   const { id, deptId } = useParams();
//   const [doctors, setDoctors] = useState([]);
//   const [err, setErr] = useState('');
//   const [busy, setBusy] = useState(true);

//   useEffect(() => {
//     getDoctors(id)
//       .then((list) => setDoctors(list.filter((d) => d.department?.id === deptId)))
//       .catch((e) => setErr(e?.response?.data?.error?.message || 'Failed to load'))
//       .finally(() => setBusy(false));
//   }, [id, deptId]);

//   return (
//     <section className="max-w-4xl mx-auto px-4 py-8">
//       <Link to={`/hospitals/${id}`} className="text-sm text-brand-600">← Back to hospital</Link>
//       <h1 className="mt-2 text-2xl font-bold">Doctors</h1>
//       <p className="text-slate-500 text-sm">Tap a doctor to see today&apos;s OPD sessions.</p>

//       {busy && <p className="mt-6">Loading…</p>}
//       {err && <p className="mt-6 text-red-600">{err}</p>}

//       <div className="mt-6 grid gap-3 sm:grid-cols-2">
//         {doctors.map((d) => (
//           <Card key={d.id}>
//             <div className="p-5">
//               <div className="flex items-center gap-2">
//                 <Stethoscope className="w-5 h-5 text-brand-600" />
//                 <span className="font-semibold">{d.user.fullName}</span>
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 {d.department?.name} {d.roomNo ? `• Room ${d.roomNo}` : ''}
//               </div>
//               <div className="text-xs text-slate-400 mt-1">
//                 Avg consult: {d.avgConsultMinutes} min
//               </div>
//               <Link to={`/doctors/${d.id}/sessions`}
//                     className="mt-3 inline-block text-sm text-brand-600">View today&apos;s sessions →</Link>
//             </div>
//           </Card>
//         ))}
//         {!busy && doctors.length === 0 && <p className="text-slate-500">No doctors in this department.</p>}
//       </div>
//     </section>
//   );
// }


import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Stethoscope, ChevronRight, ArrowLeft, DoorOpen, Clock3,
  Search, RefreshCw, X, CalendarDays, Users, BadgeCheck,
} from 'lucide-react';
import { getDoctors, getDoctorSessions } from '../../api/hospitals';

/* ---------- helpers ---------- */

const initialsOf = (name = '') =>
  name
    .replace(/^(Dr\.?\s+)/i, '')
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'DR';

const PALETTE = [
  'from-teal-500 to-emerald-500',
  'from-sky-500 to-indigo-500',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-cyan-500',
  'from-rose-500 to-pink-500',
];

const hashOf = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const gradientFor = (id = '') => PALETTE[hashOf(id) % PALETTE.length];

const todayStr = () => new Date().toISOString().slice(0, 10);

/* summarize sessions for today → { status, hasOpen, start, end, sessionId } */
const summarize = (sessions = []) => {
  if (!sessions.length) return { status: 'none' };
  const open = sessions.find((s) => s.status === 'OPEN');
  if (open) return { status: 'open', session: open };
  const paused = sessions.find((s) => s.status === 'PAUSED');
  if (paused) return { status: 'paused', session: paused };
  const scheduled = sessions.find((s) => s.status === 'SCHEDULED');
  if (scheduled) return { status: 'scheduled', session: scheduled };
  const closed = sessions.find((s) => s.status === 'CLOSED');
  if (closed) return { status: 'closed', session: closed };
  const cancelled = sessions.find((s) => s.status === 'CANCELLED');
  if (cancelled) return { status: 'cancelled', session: cancelled };
  return { status: 'none' };
};

const STATUS_META = {
  open:      { label: 'Open now',     cls: 'pq-pill pq-pill-inconsult' },
  paused:    { label: 'Paused',       cls: 'pq-pill pq-pill-skipped' },
  scheduled: { label: 'Opens soon',   cls: 'pq-pill pq-pill-waiting' },
  closed:    { label: 'Closed',       cls: 'pq-pill pq-pill-cancelled' },
  cancelled: { label: 'Cancelled',    cls: 'pq-pill pq-pill-cancelled' },
  none:      { label: 'No session',   cls: 'pq-pill badge-slate' },
};

/* ---------- page ---------- */

export default function DepartmentDoctors() {
  const { id, deptId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState({}); // { doctorId: { status, session } }
  const [hospitalName, setHospitalName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    setErr('');
    try {
      const all = await getDoctors(id);
      const filtered = all.filter((d) => d.department?.id === deptId);
      setDoctors(filtered);

      if (filtered.length) {
        setHospitalName(filtered[0].department?.name ? '' : '');
        setDeptName(filtered[0].department?.name || '');
      }

      // Fetch availability in parallel
      const date = todayStr();
      const results = await Promise.all(
        filtered.map((d) =>
          getDoctorSessions(d.id, date).catch(() => ({ sessions: [] })),
        ),
      );
      const availMap = {};
      filtered.forEach((d, i) => {
        availMap[d.id] = summarize(results[i]?.sessions || []);
      });
      setAvailability(availMap);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load doctors');
    } finally {
      setBusy(false);
    }
  }, [id, deptId]);

  useEffect(() => { load(); }, [load]);

  /* ---------- filtered list ---------- */
  const list = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    if (!q2) return doctors;
    return doctors.filter((d) =>
      d.user.fullName.toLowerCase().includes(q2) ||
      (d.roomNo || '').toLowerCase().includes(q2),
    );
  }, [doctors, q]);

  /* ---------- sort: open first, then paused, then scheduled, then others ---------- */
  const sorted = useMemo(() => {
    const order = { open: 0, paused: 1, scheduled: 2, closed: 3, cancelled: 4, none: 5 };
    return [...list].sort((a, b) => {
      const sa = availability[a.id]?.status ?? 'none';
      const sb = availability[b.id]?.status ?? 'none';
      return (order[sa] - order[sb]) ||
             a.user.fullName.localeCompare(b.user.fullName);
    });
  }, [list, availability]);

  const openCount = doctors.filter((d) => availability[d.id]?.status === 'open').length;

  /* ---------- skeletons ---------- */
  if (busy && doctors.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6">
        <div className="pq-skel h-6 w-24" />
        <div className="pq-skel h-32 mt-3 rounded-3xl" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pq-skel h-32 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  /* ---------- error ---------- */
  if (err && doctors.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6">
        <Link to={`/hospitals/${id}`} className="inline-flex items-center gap-1 text-sm text-brand-600">
          <ArrowLeft className="w-4 h-4" /> Back to hospital
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

  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 animate-screen-in">
      {/* ---------- Breadcrumb ---------- */}
      <Link
        to={`/hospitals/${id}`}
        className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="w-4 h-4" /> All departments
      </Link>

      {/* ---------- Hero ---------- */}
      <div className="mt-3 pq-hero">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
            <Stethoscope className="w-3.5 h-3.5" />
            {deptName || 'Department'}
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white leading-tight">
            Choose a doctor
          </h1>
          <p className="mt-1 text-white/85 text-sm">
            {doctors.length} doctor{doctors.length === 1 ? '' : 's'} in this department
            {openCount > 0 ? ` • ${openCount} open now` : ''}
          </p>
        </div>
      </div>

      {/* ---------- Search + refresh ---------- */}
      <div className="mt-5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="w-full pl-9 pr-9 py-3 rounded-2xl border border-slate-200 text-base
                       focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                       focus:outline-none"
            placeholder="Search doctor or room"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                         bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              aria-label="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={load}
          className="pq-icon-btn"
          aria-label="Refresh"
          title="Refresh availability"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* ---------- Empty state ---------- */}
      {!busy && doctors.length === 0 && (
        <div className="mt-6 pq-card p-8 text-center pq-fade-in">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <div className="mt-3 font-semibold text-slate-800">
            No doctors in this department yet
          </div>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
            Doctors will appear here once the hospital admin adds them.
          </p>
          <Link to={`/hospitals/${id}`} className="pq-cta mt-5 max-w-xs mx-auto">
            Browse other departments
          </Link>
        </div>
      )}

      {/* ---------- No search matches ---------- */}
      {!busy && doctors.length > 0 && sorted.length === 0 && (
        <div className="mt-6 pq-card p-8 text-center pq-fade-in">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <div className="mt-3 font-semibold text-slate-800">
            No doctors match &ldquo;{q}&rdquo;
          </div>
          <button onClick={() => setQ('')} className="pq-cta mt-5 max-w-xs mx-auto">
            Show all doctors
          </button>
        </div>
      )}

      {/* ---------- List ---------- */}
      {sorted.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sorted.map((d, i) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              availability={availability[d.id]}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ---------- Footer note ---------- */}
      <p className="mt-10 text-center text-[11px] text-slate-400">
        Availability updates live. Only "Open now" sessions accept bookings.
      </p>
    </section>
  );
}

/* =================== Doctor card =================== */

function DoctorCard({ doctor, availability, index }) {
  const name = doctor.user?.fullName || 'Doctor';
  const initials = initialsOf(name);
  const gradient = gradientFor(doctor.id);
  const room = doctor.roomNo || '—';
  const avg = doctor.avgConsultMinutes ?? 8;
  const status = availability?.status || 'none';
  const meta = STATUS_META[status];
  const session = availability?.session;
  const canBook = status === 'open';

  return (
    <div
      className="pq-card pq-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="p-4">
        {/* ---------- Top row: avatar + name + status ---------- */}
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient}
                        text-white flex items-center justify-center text-sm font-bold
                        flex-shrink-0 shadow-sm`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-900 truncate">
                {name}
              </div>
              <span className={meta.cls} title={status}>
                {status === 'open' && <span className="pq-dot pq-dot-live" />}
                {meta.label}
              </span>
            </div>

            {/* ---------- Meta chips ---------- */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5" /> Room {room}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="w-3.5 h-3.5" /> {avg} min / patient
              </span>
            </div>

            {/* ---------- Session times ---------- */}
            {session && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-700">
                <CalendarDays className="w-3.5 h-3.5 text-brand-600" />
                {session.startTime}–{session.endTime}
                {typeof session.bookedCount === 'number' && (
                  <span className="text-slate-400">
                    • {session.bookedCount}/{session.maxCapacity} booked
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---------- CTAs ---------- */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/doctors/${doctor.id}/sessions`}
            className="flex-1 inline-flex items-center justify-center gap-1.5
                       rounded-xl border border-slate-200 text-slate-700
                       py-2.5 text-sm font-medium hover:bg-slate-50 pq-tap"
          >
            View sessions
          </Link>
          {canBook ? (
            <Link
              to={`/doctors/${doctor.id}/sessions`}
              className="flex-1 inline-flex items-center justify-center gap-1.5
                         rounded-xl text-white py-2.5 text-sm font-semibold pq-tap
                         bg-gradient-to-r from-teal-500 to-orange-500 shadow-sm"
            >
              <BadgeCheck className="w-4 h-4" /> Join queue
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5
                         rounded-xl bg-slate-100 text-slate-400 py-2.5 text-sm font-medium
                         cursor-not-allowed"
              title="No open session right now"
            >
              Not available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}