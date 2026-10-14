// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { MapPin, Phone, Stethoscope } from 'lucide-react';
// import { getHospital } from '../../api/hospitals';
// import Card from '../../components/ui/Card';

// export default function HospitalDetail() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState('');

//   useEffect(() => {
//     getHospital(id).then(setData).catch((e) =>
//       setErr(e?.response?.data?.error?.message || 'Failed to load'));
//   }, [id]);

//   if (err) return <p className="max-w-4xl mx-auto px-4 py-8 text-red-600">{err}</p>;
//   if (!data) return <p className="max-w-4xl mx-auto px-4 py-8">Loading…</p>;

//   return (
//     <section className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold">{data.name}</h1>
//       <div className="mt-2 text-slate-600 flex flex-wrap items-center gap-4 text-sm">
//         <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{data.city}</span>
//         {data.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" />{data.phone}</span>}
//       </div>
//       {data.address && <p className="mt-2 text-slate-700">{data.address}</p>}

//       <h2 className="mt-8 font-semibold text-lg">Departments</h2>
//       <div className="mt-3 grid gap-3 sm:grid-cols-2">
//         {data.departments.length === 0 && <p className="text-slate-500">No departments listed.</p>}
//         {data.departments.map((d) => (
//           <Card key={d.id}>
//             <div className="p-4 flex items-center justify-between">
//               <div>
//                 <div className="font-medium">{d.name}</div>
//                 <div className="text-xs text-slate-500">Code: {d.code}</div>
//               </div>
//               <Link to={`/hospitals/${id}/departments/${d.id}`}
//                     className="text-sm text-brand-600 inline-flex items-center gap-1">
//                 <Stethoscope className="w-4 h-4" />Doctors
//               </Link>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </section>
//   );
// }


import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin, Phone, Stethoscope, ChevronRight, ArrowLeft,
  Building2, Share2, Navigation, RefreshCw, Copy, Check,
  HeartPulse, Bone, Baby, Eye, Brain, Smile, Activity,
  Pill, Syringe, Scissors, Heart,
} from 'lucide-react';
import { getHospital, getDoctors } from '../../api/hospitals';

/* ---------- deterministic color + icon per department ---------- */

const PALETTE = [
  { grad: 'from-teal-500 to-emerald-500',   soft: 'bg-teal-50 text-teal-600' },
  { grad: 'from-sky-500 to-indigo-500',     soft: 'bg-sky-50 text-sky-600' },
  { grad: 'from-orange-500 to-rose-500',    soft: 'bg-orange-50 text-orange-600' },
  { grad: 'from-violet-500 to-fuchsia-500', soft: 'bg-violet-50 text-violet-600' },
  { grad: 'from-emerald-500 to-cyan-500',   soft: 'bg-emerald-50 text-emerald-600' },
  { grad: 'from-rose-500 to-pink-500',      soft: 'bg-rose-50 text-rose-600' },
];

const hashOf = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const paletteFor = (id) => PALETTE[hashOf(id) % PALETTE.length];

/* pick an icon based on the department code / name keywords */
const iconForDept = (dept = {}) => {
  const text = `${dept.name || ''} ${dept.code || ''}`.toLowerCase();
  if (/cardio|heart|card/.test(text))   return HeartPulse;
  if (/ortho|bone|joint/.test(text))    return Bone;
  if (/ped|child|baby|paed/.test(text)) return Baby;
  if (/eye|ophthal|oph/.test(text))     return Eye;
  if (/neuro|brain|nerv/.test(text))    return Brain;
  if (/dent|teeth/.test(text))          return Smile;
  if (/derm|skin/.test(text))           return Activity;
  if (/ent|ear|nose|throat/.test(text)) return Syringe;
  if (/physio|physio/.test(text))       return Activity;
  if (/pharma|med/.test(text))          return Pill;
  if (/surg|operation/.test(text))      return Scissors;
  if (/gyn|obstet|women/.test(text))    return Heart;
  if (/gen|med/.test(text))             return Stethoscope;
  return Building2;
};

const initialsOf = (name = '') =>
  name.replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'H';

/* ---------- page ---------- */

export default function HospitalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [doctorCounts, setDoctorCounts] = useState({}); // { deptId: count }
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  /* ---------- load hospital + per-department doctor counts ---------- */
  const load = useCallback(async () => {
    setBusy(true); setErr('');
    try {
      const [hospital, doctors] = await Promise.all([
        getHospital(id),
        getDoctors(id).catch(() => []),
      ]);
      setData(hospital);

      // count doctors per department
      const counts = {};
      for (const doc of doctors) {
        const dId = doc.department?.id;
        if (dId) counts[dId] = (counts[dId] || 0) + 1;
      }
      setDoctorCounts(counts);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load hospital');
    } finally {
      setBusy(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ---------- share ---------- */
  const share = async () => {
    const url = window.location.href;
    const shareData = {
      title: data?.name || 'Hospital',
      text: `Check out ${data?.name} on SehatToken`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch { /* user cancelled */ }
  };

  const openDirections = () => {
    if (!data) return;
    const q = encodeURIComponent(`${data.name}, ${data.address || data.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  /* ---------- loading skeleton ---------- */
  if (busy && !data) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-4">
        <div className="pq-skel h-40 rounded-3xl" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pq-skel h-20 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  /* ---------- error ---------- */
  if (err && !data) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/hospitals" className="inline-flex items-center gap-1 text-sm text-brand-600">
          <ArrowLeft className="w-4 h-4" /> Back to hospitals
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

  if (!data) return null;

  const initials = initialsOf(data.name);
  const palette = paletteFor(data.id);
  const departments = data.departments || [];

  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 animate-screen-in">
      {/* ---------- Back link ---------- */}
      <Link
        to="/hospitals"
        className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="w-4 h-4" /> All hospitals
      </Link>

      {/* ---------- Hero ---------- */}
      <div className="mt-3 pq-hero overflow-hidden">
        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${palette.grad}
                        text-white flex items-center justify-center text-xl font-bold
                        flex-shrink-0 shadow-lg`}
          >
            {initials}
          </div>

          {/* Title block */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-white">
              {data.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-white/90">
              {data.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.city}
                </span>
              )}
              {data.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {data.phone}
                </span>
              )}
            </div>
            {data.address && (
              <p className="mt-2 text-xs sm:text-sm text-white/80 line-clamp-2">
                {data.address}
              </p>
            )}
          </div>
        </div>

        {/* Quick actions inside hero */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {data.phone && (
            <a
              href={`tel:${data.phone}`}
              className="pq-tap inline-flex items-center gap-1.5 rounded-xl
                         bg-white/15 backdrop-blur px-3 py-2 text-xs font-semibold text-white
                         hover:bg-white/25"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          <button
            onClick={openDirections}
            className="pq-tap inline-flex items-center gap-1.5 rounded-xl
                       bg-white/15 backdrop-blur px-3 py-2 text-xs font-semibold text-white
                       hover:bg-white/25"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </button>
          <button
            onClick={share}
            className="pq-tap inline-flex items-center gap-1.5 rounded-xl
                       bg-white/15 backdrop-blur px-3 py-2 text-xs font-semibold text-white
                       hover:bg-white/25"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* ---------- Stats strip ---------- */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="pq-stat">
          <div className="pq-stat-label">Departments</div>
          <div className="pq-stat-value">{departments.length}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-label">Doctors</div>
          <div className="pq-stat-value">
            {Object.values(doctorCounts).reduce((a, b) => a + b, 0)}
          </div>
        </div>
      </div>

      {/* ---------- Departments ---------- */}
      <div className="mt-8">
        <div className="pq-section-title">
          <h2>Departments</h2>
          <span className="text-xs text-slate-500">
            {departments.length} total
          </span>
        </div>

        {departments.length === 0 && (
          <div className="pq-card p-8 text-center pq-fade-in">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <div className="mt-3 font-semibold text-slate-800">
              No departments yet
            </div>
            <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
              This hospital hasn&apos;t published any departments. Please check back later.
            </p>
          </div>
        )}

        {departments.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {departments.map((d, i) => (
              <DepartmentTile
                key={d.id}
                dept={d}
                hospitalId={id}
                doctorCount={doctorCounts[d.id] || 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- Footer note ---------- */}
      <p className="mt-10 text-center text-[11px] text-slate-400">
        Register and pay at the hospital reception. SehatToken does not process payments.
      </p>
    </section>
  );
}

/* =================== Department tile =================== */

function DepartmentTile({ dept, hospitalId, doctorCount, index }) {
  const Icon = iconForDept(dept);
  const palette = paletteFor(dept.id);

  return (
    <Link
      to={`/hospitals/${hospitalId}/departments/${dept.id}`}
      className="pq-card pq-card-tap pq-fade-in block"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${palette.soft} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {dept.name}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              {doctorCount} doctor{doctorCount === 1 ? '' : 's'}
            </span>
            {dept.code && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {dept.code}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
      </div>
    </Link>
  );
}