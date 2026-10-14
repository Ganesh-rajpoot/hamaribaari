// // import { useCallback, useEffect, useState } from 'react';
// // import { useParams, Link } from 'react-router-dom';
// // import { ArrowLeft, Clock, MapPin, XCircle } from 'lucide-react';
// // import Card from '../../components/ui/Card';
// // import Badge from '../../components/ui/Badge';
// // import Button from '../../components/ui/Button';
// // import Modal from '../../components/ui/Modal';
// // import { getToken, cancelMyToken } from '../../api/tokens';
// // import { getErrorMessage } from '../../api/client';

// // export default function TokenDetail() {
// //   const { id } = useParams();
// //   const [data, setData] = useState(null);
// //   const [err, setErr] = useState('');
// //   const [busy, setBusy] = useState(false);
// //   const [cancelOpen, setCancelOpen] = useState(false);

// //   const load = useCallback(async () => {
// //     try { setData(await getToken(id)); }
// //     catch (e) { setErr(getErrorMessage(e)); }
// //   }, [id]);

// //   useEffect(() => {
// //     load();
// //     const t = setInterval(load, 12000); // poll every 12s
// //     return () => clearInterval(t);
// //   }, [load]);

// //   const cancel = async () => {
// //     setBusy(true); setErr('');
// //     try { await cancelMyToken(id); await load(); setCancelOpen(false); }
// //     catch (e) { setErr(getErrorMessage(e)); }
// //     finally { setBusy(false); }
// //   };

// //   if (!data && !err) return <p className="max-w-md mx-auto px-4 py-8">Loading…</p>;
// //   if (err && !data) return <p className="max-w-md mx-auto px-4 py-8 text-red-600">{err}</p>;

// //   const t = data;
// //   const canCancel = t.status === 'WAITING';

// //   return (
// //     <section className="max-w-md mx-auto px-4 py-8">
// //       <Link to="/patient" className="text-sm text-brand-600 inline-flex items-center gap-1">
// //         <ArrowLeft className="w-4 h-4" /> My tokens
// //       </Link>

// //       <Card className="mt-3">
// //         <div className="p-6 text-center">
// //           <div className="text-xs text-slate-500">Your token</div>
// //           <div className="text-5xl font-bold text-brand-600 mt-1">#{t.tokenNumber}</div>
// //           <div className="mt-2"><Badge status={t.status} /></div>
// //           <div className="text-xs text-slate-500 mt-1">
// //             {t.source === 'WALK_IN' ? 'Walk-in' : 'Online'} • {t.arrivalStatus === 'ARRIVED' ? 'Marked arrived' : 'Not arrived'}
// //           </div>
// //         </div>
// //       </Card>

// //       <Card className="mt-4">
// //         <div className="p-5 space-y-2">
// //           <div className="font-semibold">{t.session.doctor?.user?.fullName}</div>
// //           <div className="text-sm text-slate-500">
// //             {t.session.doctor?.department?.name} • Room {t.session.doctor?.roomNo || '—'}
// //           </div>
// //           <div className="text-sm text-slate-700 flex items-center gap-1">
// //             <MapPin className="w-4 h-4 text-brand-600" />
// //             {t.session.hospital.name}, {t.session.hospital.city}
// //           </div>
// //           <div className="text-sm text-slate-700 flex items-center gap-1">
// //             <Clock className="w-4 h-4 text-brand-600" />
// //             {t.session.startTime} – {t.session.endTime}
// //           </div>
// //         </div>
// //       </Card>

// //       <div className="mt-4 grid grid-cols-3 gap-3">
// //         <Card><div className="p-4 text-center">
// //           <div className="text-xs text-slate-500">Now serving</div>
// //           <div className="text-2xl font-semibold">{t.currentServingToken ?? '—'}</div>
// //         </div></Card>
// //         <Card><div className="p-4 text-center">
// //           <div className="text-xs text-slate-500">Ahead of you</div>
// //           <div className="text-2xl font-semibold">{t.aheadCount}</div>
// //         </div></Card>
// //         <Card><div className="p-4 text-center">
// //           <div className="text-xs text-slate-500">Est. wait</div>
// //           <div className="text-2xl font-semibold">{t.status === 'WAITING' ? `~${t.etaMinutes}m` : '—'}</div>
// //         </div></Card>
// //       </div>

// //       <p className="mt-2 text-xs text-slate-400 text-center">
// //         Waiting time is an <em>estimate</em>, not a guarantee.
// //       </p>

// //       {t.status === 'WAITING' && (
// //         <div className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
// //           <strong>Arrival tip:</strong> When your “ahead” count reaches 1–2, please
// //           proceed to the hospital reception with this screen.
// //         </div>
// //       )}

// //       {canCancel && (
// //         <Button variant="outline" className="w-full mt-6" onClick={() => setCancelOpen(true)}>
// //           <XCircle className="w-4 h-4 mr-1" /> Cancel my token
// //         </Button>
// //       )}

// //       <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel token?"
// //         footer={<>
// //           <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep it</Button>
// //           <Button variant="danger" onClick={cancel} disabled={busy}>Yes, cancel</Button>
// //         </>}>
// //         <p className="text-sm text-slate-600">
// //           Your token #{t.tokenNumber} will be cancelled. You can join again if the queue is still open.
// //         </p>
// //       </Modal>

// //       {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
// //     </section>
// //   );
// // }


// import { useCallback, useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { ArrowLeft, Clock, MapPin, XCircle, Bell } from 'lucide-react';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';
// import Modal from '../../components/ui/Modal';
// import { getToken, cancelMyToken } from '../../api/tokens';
// import { getErrorMessage } from '../../api/client';
// import useInterval from '../../hooks/useInterval';
// import useDocumentTitle from '../../hooks/useDocumentTitle';

// export default function TokenDetail() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [cancelOpen, setCancelOpen] = useState(false);

//   const load = useCallback(async () => {
//     try { setData(await getToken(id)); }
//     catch (e) { setErr(getErrorMessage(e)); }
//   }, [id]);

//   useEffect(() => { load(); }, [load]);
//   useInterval(load, 12000);

//   // Update browser tab title dynamically based on status.
//   let tabTitle = 'HamariBaari';
//   if (data) {
//     if (data.status === 'CALLED')          tabTitle = `🔔 Called — Token #${data.tokenNumber}`;
//     else if (data.status === 'IN_CONSULTATION') tabTitle = `▶ In consultation — #${data.tokenNumber}`;
//     else if (data.status === 'WAITING' && data.aheadCount <= 2)
//                                             tabTitle = `⏳ Almost your turn — #${data.tokenNumber}`;
//     else                                    tabTitle = `#${data.tokenNumber} · HamariBaari`;
//   }
//   useDocumentTitle(tabTitle);

//   const cancel = async () => {
//     setBusy(true); setErr('');
//     try { await cancelMyToken(id); await load(); setCancelOpen(false); }
//     catch (e) { setErr(getErrorMessage(e)); }
//     finally { setBusy(false); }
//   };

//   if (!data && !err) return <p className="max-w-md mx-auto px-4 py-8">Loading…</p>;
//   if (err && !data) return <p className="max-w-md mx-auto px-4 py-8 text-red-600">{err}</p>;

//   const t = data;
//   const canCancel = t.status === 'WAITING';

//   return (
//     <section className="max-w-md mx-auto px-4 py-8">
//       <Link to="/patient" className="text-sm text-brand-600 inline-flex items-center gap-1">
//         <ArrowLeft className="w-4 h-4" /> My tokens
//       </Link>

//       {/* Live alert banners */}
//       {t.status === 'CALLED' && (
//         <div className="mt-3 rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-indigo-900 flex items-start gap-3">
//           <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
//           <div>
//             <div className="font-semibold">You&apos;re being called!</div>
//             <div className="text-sm">Please proceed to Room {t.session.doctor?.roomNo || '—'} now.</div>
//           </div>
//         </div>
//       )}
//       {t.status === 'WAITING' && t.aheadCount > 0 && t.aheadCount <= 2 && (
//         <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
//           <div className="font-semibold">Your turn is approaching</div>
//           <div className="text-sm">{t.aheadCount} patient{t.aheadCount > 1 ? 's' : ''} ahead. Start heading to the hospital.</div>
//         </div>
//       )}
//       {t.status === 'IN_CONSULTATION' && (
//         <div className="mt-3 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-teal-900">
//           <div className="font-semibold">Consultation in progress</div>
//         </div>
//       )}

//       <Card className="mt-3">
//         <div className="p-6 text-center">
//           <div className="text-xs text-slate-500">Your token</div>
//           <div className="text-5xl font-bold text-brand-600 mt-1">#{t.tokenNumber}</div>
//           <div className="mt-2"><Badge status={t.status} /></div>
//           <div className="text-xs text-slate-500 mt-1">
//             {t.source === 'WALK_IN' ? 'Walk-in' : 'Online'} •{' '}
//             {t.arrivalStatus === 'ARRIVED' ? 'Marked arrived' : 'Not arrived'}
//           </div>
//         </div>
//       </Card>

//       <Card className="mt-4">
//         <div className="p-5 space-y-2">
//           <div className="font-semibold">{t.session.doctor?.user?.fullName}</div>
//           <div className="text-sm text-slate-500">
//             {t.session.doctor?.department?.name} • Room {t.session.doctor?.roomNo || '—'}
//           </div>
//           <div className="text-sm text-slate-700 flex items-center gap-1">
//             <MapPin className="w-4 h-4 text-brand-600" />
//             {t.session.hospital.name}, {t.session.hospital.city}
//           </div>
//           <div className="text-sm text-slate-700 flex items-center gap-1">
//             <Clock className="w-4 h-4 text-brand-600" />
//             {t.session.startTime} – {t.session.endTime}
//           </div>
//         </div>
//       </Card>

//       <div className="mt-4 grid grid-cols-3 gap-3">
//         <Card><div className="p-4 text-center">
//           <div className="text-xs text-slate-500">Now serving</div>
//           <div className="text-2xl font-semibold">{t.currentServingToken ?? '—'}</div>
//         </div></Card>
//         <Card><div className="p-4 text-center">
//           <div className="text-xs text-slate-500">Ahead of you</div>
//           <div className="text-2xl font-semibold">{t.aheadCount}</div>
//         </div></Card>
//         <Card><div className="p-4 text-center">
//           <div className="text-xs text-slate-500">Est. wait</div>
//           <div className="text-2xl font-semibold">
//             {t.status === 'WAITING' ? `~${t.etaMinutes}m` : '—'}
//           </div>
//         </div></Card>
//       </div>

//       <p className="mt-2 text-xs text-slate-400 text-center">
//         Waiting time is an <em>estimate</em>, not a guarantee.
//       </p>

//       {canCancel && (
//         <Button variant="outline" className="w-full mt-6" onClick={() => setCancelOpen(true)}>
//           <XCircle className="w-4 h-4 mr-1" /> Cancel my token
//         </Button>
//       )}

//       <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel token?"
//         footer={<>
//           <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep it</Button>
//           <Button variant="danger" onClick={cancel} disabled={busy}>Yes, cancel</Button>
//         </>}>
//         <p className="text-sm text-slate-600">
//           Your token #{t.tokenNumber} will be cancelled. You can join again if the queue is still open.
//         </p>
//       </Modal>

//       {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
//     </section>
//   );
// }


import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock3, MapPin, XCircle, Bell, Timer, Users, Navigation,
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { getToken, cancelMyToken } from '../../api/tokens';
import { getErrorMessage } from '../../api/client';
import useInterval from '../../hooks/useInterval';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function TokenDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    try { setData(await getToken(id)); }
    catch (e) { setErr(getErrorMessage(e)); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useInterval(load, 10000);

  let tabTitle = 'HamariBaari';
  if (data) {
    if (data.status === 'CALLED')
      tabTitle = `🔔 Called — Token #${data.tokenNumber}`;
    else if (data.status === 'IN_CONSULTATION')
      tabTitle = `▶ In consultation — #${data.tokenNumber}`;
    else if (data.status === 'WAITING' && data.aheadCount <= 2)
      tabTitle = `⏳ Almost your turn — #${data.tokenNumber}`;
    else tabTitle = `#${data.tokenNumber} · HamariBaari`;
  }
  useDocumentTitle(tabTitle);

  const cancel = async () => {
    setBusy(true); setErr('');
    try { await cancelMyToken(id); await load(); setCancelOpen(false); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  if (!data && !err) {
    return (
      <PatientLayout>
        <div className="space-y-3">
          <div className="pq-skel h-40" />
          <div className="pq-skel h-24" />
        </div>
      </PatientLayout>
    );
  }
  if (err && !data) {
    return (
      <PatientLayout>
        <div className="alert alert-danger">{err}</div>
      </PatientLayout>
    );
  }

  const t = data;
  const canCancel = t.status === 'WAITING';
  const pillClass = {
    WAITING: 'pq-pill-waiting',
    CALLED: 'pq-pill-called',
    IN_CONSULTATION: 'pq-pill-inconsult',
    COMPLETED: 'pq-pill-done',
    SKIPPED: 'pq-pill-skipped',
    CANCELLED: 'pq-pill-cancelled',
    NO_SHOW: 'pq-pill-cancelled',
  }[t.status] || 'pq-pill-waiting';

  return (
    <PatientLayout>
      <Link to="/patient" className="inline-flex items-center gap-1 text-sm text-brand-600">
        <ArrowLeft className="w-4 h-4" /> My tokens
      </Link>

      {/* Live ribbons */}
      {t.status === 'CALLED' && (
        <div className="pq-ribbon pq-ribbon-called mt-3 pq-fade-in">
          <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">You&apos;re being called!</div>
            <div className="text-sm">
              Go to Room {t.session.doctor?.roomNo || '—'} now.
            </div>
          </div>
        </div>
      )}
      {t.status === 'WAITING' && t.aheadCount > 0 && t.aheadCount <= 2 && (
        <div className="pq-ribbon pq-ribbon-soon mt-3 pq-fade-in">
          <Timer className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Almost your turn</div>
            <div className="text-sm">
              {t.aheadCount} patient{t.aheadCount > 1 ? 's' : ''} ahead. Start heading to the hospital.
            </div>
          </div>
        </div>
      )}
      {t.status === 'IN_CONSULTATION' && (
        <div className="pq-ribbon alert-success mt-3 pq-fade-in">
          <div>
            <div className="font-semibold">Consultation in progress</div>
          </div>
        </div>
      )}

      {/* Hero card */}
      <section className="pq-card mt-4 p-6 pq-fade-in">
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Your token
          </div>
          <div className="pq-token mt-2 justify-center">
            <span className="pq-token-hash">#</span>
            <span className="pq-token-num tabular-nums">{t.tokenNumber}</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`pq-pill ${pillClass}`}>
              {t.status.replace('_', ' ')}
            </span>
            {t.source === 'WALK_IN' && (
              <span className="pq-pill badge-slate">Walk-in</span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {t.arrivalStatus === 'ARRIVED'
              ? '✓ Marked arrived at reception'
              : 'Not yet marked arrived'}
          </div>
        </div>
      </section>

      {/* Live status grid */}
      <section className="mt-4 grid grid-cols-3 gap-3">
        <div className="pq-stat">
          <div className="pq-stat-label">Now serving</div>
          <div className="pq-stat-value">{t.currentServingToken ?? '—'}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-label">Ahead</div>
          <div className="pq-stat-value">{t.aheadCount}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-label">Est. wait</div>
          <div className="pq-stat-value">
            {t.status === 'WAITING' ? `${t.etaMinutes}m` : '—'}
          </div>
        </div>
      </section>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Waiting time is an estimate, not a guarantee.
      </p>

      {/* Doctor + hospital */}
      <section className="pq-card mt-6 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="pq-cat-icon bg-sky-50 text-sky-600 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {t.session.doctor?.user?.fullName}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {t.session.doctor?.department?.name}
              {t.session.doctor?.roomNo ? ` • Room ${t.session.doctor.roomNo}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="pq-cat-icon bg-teal-50 text-teal-600 flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {t.session.hospital?.name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {t.session.hospital?.city}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="pq-cat-icon bg-indigo-50 text-indigo-600 flex-shrink-0">
            <Clock3 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">
              {t.session.startTime} – {t.session.endTime}
            </div>
            <div className="text-xs text-slate-500">
              {new Date(t.session.sessionDate).toDateString()}
            </div>
          </div>
        </div>
      </section>

      {/* Arrival tip */}
      {t.status === 'WAITING' && (
        <section className="pq-card mt-4 p-4 flex items-start gap-3">
          <Navigation className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-700">
            <span className="font-semibold">When to leave:</span>{' '}
            when <em>Ahead</em> reaches 1–2. Bring this screen to the reception.
          </div>
        </section>
      )}

      {/* Cancel */}
      {canCancel && (
        <button
          onClick={() => setCancelOpen(true)}
          className="mt-6 w-full inline-flex items-center justify-center gap-2
                     rounded-2xl border border-rose-200 text-rose-600
                     px-5 py-3.5 text-sm font-semibold hover:bg-rose-50 transition">
          <XCircle className="w-4 h-4" /> Cancel my token
        </button>
      )}

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel token?"
        footer={<>
          <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep it</Button>
          <Button variant="danger" onClick={cancel} disabled={busy}>
            Yes, cancel
          </Button>
        </>}>
        <p className="text-sm text-slate-600">
          Your token #{t.tokenNumber} will be cancelled. You can join again if the queue is still open.
        </p>
      </Modal>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
    </PatientLayout>
  );
}