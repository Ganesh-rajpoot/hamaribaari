// import { useCallback, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Search, Bell } from 'lucide-react';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';
// import { useAuth } from '../../context/AuthContext';
// import { getMyTokens } from '../../api/tokens';
// import { getErrorMessage } from '../../api/client';
// import useInterval from '../../hooks/useInterval';

// const isActive = (t) => ['WAITING', 'CALLED', 'IN_CONSULTATION'].includes(t.status);
// const isCalled = (t) => t.status === 'CALLED';

// export default function PatientDashboard() {
//   const { user } = useAuth();
//   const [tokens, setTokens] = useState([]);
//   const [err, setErr] = useState('');
//   const [busy, setBusy] = useState(true);

//   const load = useCallback(async () => {
//     try { setTokens(await getMyTokens()); }
//     catch (e) { setErr(getErrorMessage(e)); }
//     finally { setBusy(false); }
//   }, []);

//   useEffect(() => { load(); }, [load]);
//   useInterval(load, 15000);

//   const active = tokens.filter(isActive);
//   const called = tokens.find(isCalled);
//   const history = tokens.filter((t) => !isActive(t));

//   return (
//     <section className="max-w-3xl mx-auto px-4 py-8">
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Hi, {user?.fullName}</h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Join the queue from home. Reach closer to your turn.
//           </p>
//         </div>
//         {called && (
//           <Link to={`/patient/tokens/${called.id}`}
//                 className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">
//             <Bell className="w-4 h-4" /> Called
//           </Link>
//         )}
//       </div>

//       <div className="mt-6 flex gap-2">
//         <Link to="/hospitals" className="flex-1">
//           <Button className="w-full"><Search className="w-4 h-4 mr-1" /> Find a hospital</Button>
//         </Link>
//       </div>

//       {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
//       {busy && <p className="mt-4 text-slate-500">Loading…</p>}

//       <h2 className="mt-8 font-semibold text-lg">Active tokens</h2>
//       {!busy && active.length === 0 && (
//         <p className="text-slate-500 text-sm mt-2">No active tokens. Browse hospitals to join a queue.</p>
//       )}
//       <div className="mt-3 space-y-3">
//         {active.map((t) => (
//           <Card key={t.id}>
//             <Link to={`/patient/tokens/${t.id}`}>
//               <div className="p-5 flex items-center justify-between">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-xl font-bold">#{t.tokenNumber}</span>
//                     <Badge status={t.status} />
//                   </div>
//                   <div className="text-sm text-slate-600 mt-1">
//                     {t.session.doctor?.user?.fullName} • {t.session.doctor?.department?.name}
//                   </div>
//                   <div className="text-xs text-slate-500">
//                     {t.session.hospital.name} • {t.session.startTime}–{t.session.endTime}
//                   </div>
//                 </div>
//                 <span className="text-brand-600 text-sm">Track →</span>
//               </div>
//             </Link>
//           </Card>
//         ))}
//       </div>

//       {history.length > 0 && (
//         <>
//           <h2 className="mt-8 font-semibold text-lg">History</h2>
//           <div className="mt-3 space-y-2">
//             {history.slice(0, 20).map((t) => (
//               <Card key={t.id}>
//                 <Link to={`/patient/tokens/${t.id}`}>
//                   <div className="p-4 flex items-center justify-between">
//                     <div>
//                       <span className="font-semibold">#{t.tokenNumber}</span>{' '}
//                       <Badge status={t.status} />
//                       <div className="text-xs text-slate-500 mt-1">
//                         {t.session.doctor?.user?.fullName} • {new Date(t.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>
//                     <span className="text-xs text-slate-400">View</span>
//                   </div>
//                 </Link>
//               </Card>
//             ))}
//           </div>
//         </>
//       )}
//     </section>
//   );
// }



import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Search, Clock3, ChevronRight, Stethoscope, Building2,
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getMyTokens } from '../../api/tokens';
import { getErrorMessage } from '../../api/client';
import useInterval from '../../hooks/useInterval';

const isActive = (t) => ['WAITING', 'CALLED', 'IN_CONSULTATION'].includes(t.status);

export default function PatientDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    try { setTokens(await getMyTokens()); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useInterval(load, 12000);

  const active = tokens.filter(isActive);
  const history = tokens.filter((t) => !isActive(t));
  const called = active.find((t) => t.status === 'CALLED');

  const firstName = (user?.fullName || '').split(' ')[0];

  return (
    <PullToRefresh onRefresh={load}>
    <PatientLayout>
      {/* Hero greeting */}
      <section className="pq-hero pq-fade-in">
        <div className="relative z-10">
          <div className="text-xs text-white/80">Good to see you,</div>
          <div className="text-2xl font-bold mt-0.5">{firstName}</div>
          <p className="mt-1 text-sm text-white/85">
            {active.length === 0
              ? 'Ready to join a queue today?'
              : `You have ${active.length} active token${active.length > 1 ? 's' : ''}.`}
          </p>

          {called && (
            <Link to={`/patient/tokens/${called.id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/95
                             text-indigo-700 px-4 py-2.5 text-sm font-semibold
                             pq-ribbon-called">
              <Bell className="w-4 h-4" />
              You&apos;re being called — token #{called.tokenNumber}
            </Link>
          )}

          <div className="mt-5">
            <Link to="/hospitals" className="
              inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900
              px-5 py-3 text-sm font-semibold shadow-lg active:scale-[0.98] transition">
              <Search className="w-4 h-4" /> Find a hospital
            </Link>
          </div>
        </div>
      </section>

      {err && (
        <div className="mt-4 alert alert-danger pq-fade-in">{err}</div>
      )}

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/hospitals" className="pq-cat">
          <div className="pq-cat-icon bg-sky-50 text-sky-600">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-700">Hospitals</span>
        </Link>
        <Link to="/patient/tokens" className="pq-cat">
          <div className="pq-cat-icon bg-teal-50 text-teal-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-700">My tokens</span>
        </Link>
      </section>

      {/* Active tokens */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active queue</h2>
          {active.length > 0 && (
            <span className="pq-pill pq-pill-waiting">
              <span className="pq-dot pq-dot-live" /> Live
            </span>
          )}
        </div>

        {busy && (
          <div className="mt-3 space-y-3">
            <div className="pq-skel h-24" />
          </div>
        )}

        {!busy && active.length === 0 && (
          <div className="mt-3 pq-card p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-slate-400" />
            </div>
            <div className="mt-3 font-medium text-slate-800">No active tokens</div>
            <p className="text-sm text-slate-500 mt-1">
              Browse hospitals to join a queue. It takes 10 seconds.
            </p>
            <Link to="/hospitals" className="pq-cta mt-4 max-w-xs mx-auto">
              Find a hospital
            </Link>
          </div>
        )}

        <div className="mt-3 space-y-3">
          {active.map((t) => (
            <Link key={t.id} to={`/patient/tokens/${t.id}`}
                  className="block pq-card pq-card-tap p-5 pq-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="pq-token">
                      <span className="pq-token-hash">#</span>
                      <span className="text-3xl font-bold text-brand-600 tabular-nums">
                        {t.tokenNumber}
                      </span>
                    </span>
                    <Badge status={t.status} />
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800 truncate">
                    {t.session.doctor?.user?.fullName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {t.session.doctor?.department?.name} •{' '}
                    {t.session.hospital?.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {t.session.startTime} – {t.session.endTime}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-2">
            {history.slice(0, 8).map((t) => (
              <Link key={t.id} to={`/patient/tokens/${t.id}`}
                    className="flex items-center justify-between rounded-2xl border
                               border-slate-100 px-4 py-3 hover:bg-slate-50 transition">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">#{t.tokenNumber}</span>
                    <Badge status={t.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {t.session.doctor?.user?.fullName} •{' '}
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </PatientLayout>
    </PullToRefresh>
  );
}