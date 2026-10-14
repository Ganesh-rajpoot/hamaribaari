// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { MapPin, Search } from 'lucide-react';
// import { searchHospitals } from '../../api/hospitals';
// import Card from '../../components/ui/Card';
// import Input from '../../components/ui/Input';

// export default function Hospitals() {
//   const [q, setQ] = useState('');
//   const [list, setList] = useState([]);
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState('');

//   const load = async () => {
//     setBusy(true); setErr('');
//     try { setList(await searchHospitals(q)); }
//     catch (e) { setErr(e?.response?.data?.error?.message || 'Failed to load'); }
//     finally { setBusy(false); }
//   };

//   useEffect(() => { load(); /* initial */ }, []);
//   useEffect(() => {
//     const t = setTimeout(load, 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   return (
//     <section className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold">Find a hospital</h1>
//       <p className="text-slate-500 text-sm mt-1">Search by name or city.</p>

//       <div className="mt-4 relative">
//         <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//         <Input className="pl-10" placeholder="e.g. Bengaluru" value={q} onChange={(e) => setQ(e.target.value)} />
//       </div>

//       {busy && <p className="mt-4 text-slate-500">Loading…</p>}
//       {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}

//       <div className="mt-6 grid gap-4 sm:grid-cols-2">
//         {list.map((h) => (
//           <Card key={h.id}>
//             <div className="p-5">
//               <Link to={`/hospitals/${h.id}`} className="font-semibold text-lg hover:text-brand-600">
//                 {h.name}
//               </Link>
//               <div className="mt-1 text-sm text-slate-500 flex items-center gap-1">
//                 <MapPin className="w-4 h-4" />{h.city}
//               </div>
//               {h.address && <p className="mt-2 text-sm text-slate-600">{h.address}</p>}
//             </div>
//           </Card>
//         ))}
//         {!busy && list.length === 0 && (
//           <p className="text-slate-500">No hospitals found.</p>
//         )}
//       </div>
//     </section>
//   );
// }


import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Phone, ChevronRight, X, Loader2,
  Building2, Sparkles, Clock, RefreshCw,
} from 'lucide-react';
import { searchHospitals } from '../../api/hospitals';
import useInterval from '../../hooks/useInterval';

const RECENT_KEY = 'hq_recent_searches';
const MAX_RECENT = 5;

/* ---------- small helpers ---------- */

const initialsOf = (name = '') =>
  name.replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'H';

/* deterministic gradient per hospital */
const gradientFor = (id = '') => {
  const gradients = [
    'from-teal-500 to-emerald-500',
    'from-sky-500 to-indigo-500',
    'from-orange-500 to-rose-500',
    'from-violet-500 to-fuchsia-500',
    'from-emerald-500 to-cyan-500',
    'from-rose-500 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return gradients[hash % gradients.length];
};

/* ---------- localStorage helpers ---------- */

const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};
const writeRecent = (list) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT))); }
  catch { /* ignore */ }
};

/* ---------- page ---------- */

export default function Hospitals() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const [recent, setRecent] = useState(readRecent);

  const inputRef = useRef(null);
  const initialLoaded = useRef(false);

  /* --- debounce query --- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  /* --- load --- */
  const load = useCallback(async (query = '') => {
    setErr('');
    try {
      const data = await searchHospitals(query);
      setList(data);
      if (query) {
        // save recent query
        const next = [query, ...readRecent().filter((x) => x !== query)];
        writeRecent(next);
        setRecent(next);
      }
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load hospitals');
    } finally {
      setBusy(false);
    }
  }, []);

  /* initial load (all hospitals) */
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    load('');
  }, [load]);

  /* refetch on debounced query change */
  useEffect(() => {
    if (!initialLoaded.current) return;
    setBusy(true);
    load(debouncedQ);
  }, [debouncedQ, load]);

  /* periodic background refresh so results stay fresh */
  useInterval(() => load(debouncedQ), 60000);

  /* --- derived: city chips from current list --- */
  const cityChips = useMemo(() => {
    const seen = new Map();
    for (const h of list) {
      const c = (h.city || '').trim();
      if (!c) continue;
      seen.set(c, (seen.get(c) || 0) + 1);
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city]) => city);
  }, [list]);

  /* --- actions --- */
  const applySearch = (value) => {
    setQ(value);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQ('');
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    writeRecent([]);
    setRecent([]);
  };

  const refresh = () => {
    setBusy(true);
    load(debouncedQ);
  };

  const showRecents = q.length === 0 && recent.length > 0;
  const showChips = cityChips.length > 1;
  const isEmpty = !busy && list.length === 0;

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 animate-screen-in">
      {/* ============ Gradient hero ============ */}
      <div className="pq-hero mt-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Live OPD queues across hospitals
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white leading-tight">
            Find a hospital near you
          </h1>
          <p className="mt-1 text-white/85 text-sm">
            Search by name or city, and join the queue in seconds.
          </p>
        </div>
      </div>

      {/* ============ Sticky search ============ */}
      <div className="sticky top-14 z-20 -mx-4 px-4 pt-3 pb-3 bg-white/95 backdrop-blur
                      border-b border-slate-100 sm:-mx-0 sm:px-0 sm:border-0 sm:bg-transparent">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200
                       bg-white shadow-sm text-base
                       focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                       focus:outline-none transition"
            placeholder="Search hospital or city"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
          {q && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                         bg-slate-100 text-slate-500 flex items-center justify-center
                         hover:bg-slate-200 pq-tap"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {busy && !q && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8
                            flex items-center justify-center text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Recent searches */}
        {showRecents && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Recent
            </span>
            {recent.map((r) => (
              <Chip key={r} onClick={() => applySearch(r)} icon={Clock}>
                {r}
              </Chip>
            ))}
            <button
              onClick={clearRecent}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* City chips */}
        {!showRecents && showChips && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold whitespace-nowrap">
              Cities
            </span>
            {cityChips.map((c) => (
              <Chip key={c} onClick={() => applySearch(c)} active={q === c}>
                <MapPin className="w-3.5 h-3.5" />
                {c}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* ============ Error banner ============ */}
      {err && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 text-red-800
                        px-4 py-3 text-sm flex items-start gap-3">
          <div className="flex-1">{err}</div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-red-200
                       px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ============ Loading skeletons ============ */}
      {busy && list.length === 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      )}

      {/* ============ Results ============ */}
      {!busy && list.length > 0 && (
        <>
          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {list.length} hospital{list.length !== 1 ? 's' : ''}
              {debouncedQ && (
                <> for &ldquo;<span className="font-medium text-slate-700">{debouncedQ}</span>&rdquo;</>
              )}
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {list.map((h, i) => (
              <HospitalCard key={h.id} hospital={h} index={i} />
            ))}
          </div>
        </>
      )}

      {/* ============ Empty state ============ */}
      {isEmpty && !err && (
        <div className="mt-8 pq-card p-8 text-center pq-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-slate-400" />
          </div>
          <div className="mt-4 font-semibold text-slate-800">
            {q ? `No hospitals match “${q}”` : 'No hospitals listed yet'}
          </div>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
            {q
              ? 'Try a different name or city, or clear the search to see all hospitals.'
              : 'Hospitals will appear here once they are onboarded.'}
          </p>
          {q && (
            <button
              onClick={clearSearch}
              className="pq-cta mt-5 max-w-xs mx-auto"
            >
              Show all hospitals
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ============ Small components ============ */

function Chip({ children, onClick, active, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                  whitespace-nowrap border transition pq-tap
                  ${active
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50'}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}

function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="pq-card p-5 pq-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="pq-skel w-12 h-12 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="pq-skel h-4 w-3/4" />
          <div className="pq-skel h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function HospitalCard({ hospital, index }) {
  const { id, name, city, address, phone } = hospital;
  const initials = initialsOf(name);
  const gradient = gradientFor(id);

  return (
    <Link
      to={`/hospitals/${id}`}
      className="pq-card pq-card-tap pq-fade-in block overflow-hidden"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Avatar tile */}
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient}
                        text-white flex items-center justify-center font-bold
                        flex-shrink-0 shadow-sm`}
          >
            {initials}
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-900 truncate">{name}</div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {city}
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {phone}
                </span>
              )}
            </div>

            {address && (
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                {address}
              </p>
            )}

            {/* CTA row */}
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
              View departments
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}