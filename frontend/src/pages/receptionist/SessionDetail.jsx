


// import { useCallback, useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import {
//   ArrowLeft, PauseCircle, PlayCircle, XCircle, AlertOctagon, Lock,
//   PhoneCall, Play, CheckCircle2, SkipForward, RotateCcw, ArrowDownToLine,
//   UserCheck, UserPlus, RefreshCw, Search,
// } from 'lucide-react';
// import StaffLayout from '../../layouts/StaffLayout';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';
// import Modal from '../../components/ui/Modal';
// import TokenRow from '../../components/TokenRow';
// import {
//   getSession, openSession, pauseSession, resumeSession, closeSession,
//   unavailableSession, cancelSession,
// } from '../../api/sessions';
// import {
//   getSessionQueue, createWalkIn, arriveToken, callToken, startToken,
//   completeToken, skipToken, recallToken, putAtEnd, noShowToken,
// } from '../../api/tokens';
// import { getErrorMessage } from '../../api/client';

// export default function ReceptionistSessionDetail() {
//   const { id } = useParams();

//   const [session, setSession] = useState(null);
//   const [tokens, setTokens] = useState([]);
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState('');
//   const [info, setInfo] = useState('');

//   const [cancelOpen, setCancelOpen] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');

//   const [walkInOpen, setWalkInOpen] = useState(false);
//   const [walkIn, setWalkIn] = useState({ patientName: '', patientMobile: '' });

//   const [reasonPrompt, setReasonPrompt] = useState(null); // { token, action }
//   const [reasonText, setReasonText] = useState('');

//   const [filter, setFilter] = useState('');

//   const load = useCallback(async () => {
//     try {
//       const [s, q] = await Promise.all([getSession(id), getSessionQueue(id)]);
//       setSession(s.session);
//       setTokens(q.tokens);
//     } catch (e) { setErr(getErrorMessage(e)); }
//   }, [id]);

//   useEffect(() => {
//     load();
//     const t = setInterval(load, 10000);
//     return () => clearInterval(t);
//   }, [load]);

//   const run = async (fn, okMsg = '') => {
//     setBusy(true); setErr(''); setInfo('');
//     try { await fn(); await load(); if (okMsg) setInfo(okMsg); }
//     catch (e) { setErr(getErrorMessage(e)); }
//     finally { setBusy(false); }
//   };

//   /* Session-level actions */
//   const confirmClose = async () => {
//     const waiting = tokens.filter((t) => t.status === 'WAITING').length;
//     if (waiting > 0 && !window.confirm(`There are ${waiting} patients waiting. Close anyway?`)) return;
//     await run(() => closeSession(id), 'Session closed.');
//   };
//   const confirmCancelSession = async () => {
//     if (!cancelReason.trim()) return;
//     if (!window.confirm('Cancel this session? Historical tokens remain accessible.')) return;
//     await run(() => cancelSession(id, cancelReason.trim()), 'Session cancelled.');
//     setCancelOpen(false); setCancelReason('');
//   };

//   /* Walk-in */
//   const submitWalkIn = async () => {
//     await run(() => createWalkIn(id, walkIn), 'Walk-in token created.');
//     setWalkIn({ patientName: '', patientMobile: '' });
//     setWalkInOpen(false);
//   };

//   /* Token actions */
//   const askReasonThen = (token, action, label) => {
//     setReasonPrompt({ token, action, label });
//     setReasonText('');
//   };
//   const doReasonAction = async () => {
//     if (!reasonPrompt) return;
//     const { token, action, label } = reasonPrompt;
//     if (!reasonText.trim()) return;
//     await run(() => action(token.id, reasonText.trim()), `${label} done.`);
//     setReasonPrompt(null);
//   };

//   if (!session) return <StaffLayout><p className="text-slate-500">Loading…</p></StaffLayout>;

//   const status = session.status;

//   const filtered = filter.trim()
//     ? tokens.filter((t) =>
//         String(t.tokenNumber).includes(filter.trim()) ||
//         t.patient.fullName.toLowerCase().includes(filter.trim().toLowerCase()) ||
//         t.patient.mobile.includes(filter.trim()))
//     : tokens;

//   const isReopenable = ['SCHEDULED', 'OPEN', 'PAUSED'].includes(status);

//   return (
//     <StaffLayout>
//       <Link to="/receptionist" className="text-sm text-brand-600 inline-flex items-center gap-1">
//         <ArrowLeft className="w-4 h-4" /> Back to today
//       </Link>

//       <div className="mt-3 flex flex-wrap items-center gap-3">
//         <h1 className="text-2xl font-bold">{session.doctor.user.fullName}</h1>
//         <Badge status={status} />
//         <Button size="sm" variant="outline" onClick={load}>
//           <RefreshCw className="w-4 h-4 mr-1" /> Refresh
//         </Button>
//       </div>
//       <p className="text-slate-500 text-sm">
//         {session.doctor.department?.name} • {session.startTime}–{session.endTime} • Room {session.doctor.roomNo || '—'}
//       </p>

//       {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
//       {info && <p className="mt-3 text-teal-700 text-sm">{info}</p>}

//       <div className="mt-6 grid gap-4 sm:grid-cols-3">
//         <Card><div className="p-4">
//           <div className="text-xs text-slate-500">Now serving</div>
//           <div className="text-2xl font-semibold">
//             {tokens.find((t) => ['CALLED','IN_CONSULTATION'].includes(t.status))?.tokenNumber ?? '—'}
//           </div>
//         </div></Card>
//         <Card><div className="p-4">
//           <div className="text-xs text-slate-500">Waiting</div>
//           <div className="text-2xl font-semibold">{tokens.filter((t) => t.status === 'WAITING').length}</div>
//         </div></Card>
//         <Card><div className="p-4">
//           <div className="text-xs text-slate-500">Booked</div>
//           <div className="text-2xl font-semibold">{session.bookedCount}/{session.maxCapacity}</div>
//         </div></Card>
//       </div>

//       {/* Session actions */}
//       <Card className="mt-6">
//         <div className="p-5">
//           <h2 className="font-semibold">Session actions</h2>
//           <div className="mt-3 flex flex-wrap gap-2">
//             {status === 'SCHEDULED' && (
//               <Button disabled={busy} onClick={() => run(() => openSession(id), 'Queue opened.')}>
//                 <PlayCircle className="w-4 h-4 mr-1" /> Open queue
//               </Button>
//             )}
//             {status === 'OPEN' && (
//               <Button variant="outline" disabled={busy} onClick={() => run(() => pauseSession(id), 'Queue paused.')}>
//                 <PauseCircle className="w-4 h-4 mr-1" /> Pause
//               </Button>
//             )}
//             {status === 'PAUSED' && (
//               <Button variant="secondary" disabled={busy} onClick={() => run(() => resumeSession(id), 'Queue resumed.')}>
//                 <PlayCircle className="w-4 h-4 mr-1" /> Resume
//               </Button>
//             )}
//             {['OPEN', 'PAUSED'].includes(status) && (
//               <Button variant="outline" disabled={busy} onClick={confirmClose}>
//                 <Lock className="w-4 h-4 mr-1" /> Close
//               </Button>
//             )}
//             {['SCHEDULED', 'OPEN', 'PAUSED'].includes(status) && (
//               <Button variant="outline" disabled={busy}
//                       onClick={() => run(() => unavailableSession(id), 'Marked unavailable.')}>
//                 <AlertOctagon className="w-4 h-4 mr-1" /> Mark unavailable
//               </Button>
//             )}
//             {['SCHEDULED', 'OPEN', 'PAUSED', 'UNAVAILABLE'].includes(status) && (
//               <Button variant="danger" disabled={busy} onClick={() => setCancelOpen(true)}>
//                 <XCircle className="w-4 h-4 mr-1" /> Cancel session
//               </Button>
//             )}
//             {status === 'UNAVAILABLE' && (
//               <Button variant="outline" disabled={busy}
//                       onClick={() => run(() => resumeSession(id), 'Queue resumed.')}>
//                 <PlayCircle className="w-4 h-4 mr-1" /> Resume as open
//               </Button>
//             )}
//           </div>
//         </div>
//       </Card>

//       {/* Walk-in + search */}
//       <Card className="mt-6">
//         <div className="p-5">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <h2 className="font-semibold">Walk-in token</h2>
//             <Button size="sm" disabled={status !== 'OPEN' || busy} onClick={() => setWalkInOpen(true)}>
//               <UserPlus className="w-4 h-4 mr-1" /> Add walk-in
//             </Button>
//           </div>
//           <p className="text-xs text-slate-500 mt-1">
//             Walk-in tokens share the same counter as online tokens.
//           </p>
//         </div>
//       </Card>

//       {/* Queue */}
//         <Card className="mt-6">
//         <div className="p-5">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <h2 className="font-semibold">Queue ({tokens.length})</h2>
//             <div className="relative w-full sm:w-64">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                 className="pl-9 pr-3 w-full"
//                 placeholder="Token # or name / mobile"
//                 value={filter}
//                 onChange={(e) => setFilter(e.target.value)}
//                 />
//             </div>
//             </div>

//             {/* Mobile: card list */}
//             <div className="mt-4 md:hidden">
//             {filtered.length === 0 && (
//                 <p className="text-slate-500 text-sm">No tokens to show.</p>
//             )}
//             <div className="space-y-3">
//                 {filtered.map((t) => {
//                 // ... compute `actions` array exactly as before
//                 return (
//                     <div key={t.id} className="rounded-2xl border border-slate-100 p-4">
//                     <div className="flex items-start justify-between gap-3">
//                         <div className="min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                             <span className="text-lg font-semibold tabular-nums">#{t.tokenNumber}</span>
//                             <Badge status={t.status} />
//                             {t.source === 'WALK_IN' && (
//                             <span className="text-[10px] uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
//                                 walk-in
//                             </span>
//                             )}
//                         </div>
//                         <div className="text-xs text-slate-500 mt-1 truncate">
//                             {t.patient.fullName} • {t.patient.mobile}
//                         </div>
//                         <div className="text-[11px] text-slate-400 mt-0.5">
//                             {t.arrivalStatus === 'ARRIVED' ? 'Arrived' : 'Not arrived'}
//                         </div>
//                         </div>
//                     </div>
//                     {actions.length > 0 && (
//                         <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
//                     )}
//                     </div>
//                 );
//                 })}
//             </div>
//             </div>

//             {/* Desktop: table-like rows */}
//             <div className="mt-4 hidden md:block">
//             {filtered.length === 0 && (
//                 <p className="text-slate-500 text-sm">No tokens to show.</p>
//             )}
//             <div className="divide-y divide-slate-100">
//                 {filtered.map((t) => {
//                 // ... compute `actions` array exactly as before
//                 return (
//                     <div
//                     key={t.id}
//                     className="flex items-center justify-between gap-3 py-3"
//                     >
//                     <div className="min-w-0 flex-1">
//                         <div className="flex items-center gap-2">
//                         <span className="text-lg font-semibold tabular-nums">#{t.tokenNumber}</span>
//                         <Badge status={t.status} />
//                         {t.source === 'WALK_IN' && (
//                             <span className="text-[10px] uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
//                             walk-in
//                             </span>
//                         )}
//                         </div>
//                         <div className="text-xs text-slate-500 truncate">
//                         {t.patient.fullName} • {t.patient.mobile} •{' '}
//                         {t.arrivalStatus === 'ARRIVED' ? 'Arrived' : 'Not arrived'}
//                         </div>
//                     </div>
//                     <div className="flex flex-wrap gap-1 justify-end">{actions}</div>
//                     </div>
//                 );
//                 })}
//             </div>
//             </div>
//         </div>
//         </Card>

//       {/* Cancel session modal */}
//       <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel session"
//         footer={<>
//           <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
//           <Button variant="danger" disabled={busy || !cancelReason.trim()} onClick={confirmCancelSession}>
//             Confirm cancel
//           </Button>
//         </>}>
//         <p className="text-sm text-slate-600 mb-3">
//           Historical tokens remain accessible. Provide a reason (audited).
//         </p>
//         <Input label="Reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
//                placeholder="e.g. Doctor emergency" />
//       </Modal>

//       {/* Walk-in modal */}
//       <Modal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="New walk-in token"
//         footer={<>
//           <Button variant="outline" onClick={() => setWalkInOpen(false)}>Cancel</Button>
//           <Button onClick={submitWalkIn}
//                   disabled={busy || !walkIn.patientName || !walkIn.patientMobile}>
//             Create token
//           </Button>
//         </>}>
//         <div className="space-y-3">
//           <Input label="Patient name" value={walkIn.patientName}
//                  onChange={(e) => setWalkIn({ ...walkIn, patientName: e.target.value })} />
//           <Input label="Mobile number" inputMode="numeric" value={walkIn.patientMobile}
//                  onChange={(e) => setWalkIn({ ...walkIn, patientMobile: e.target.value })} />
//           <p className="text-xs text-slate-500">
//             If a patient account already exists for this mobile, the token is added to that patient.
//           </p>
//         </div>
//       </Modal>

//       {/* Reason prompt modal */}
//       <Modal open={!!reasonPrompt} onClose={() => setReasonPrompt(null)} title={`${reasonPrompt?.label || ''} token`}
//         footer={<>
//           <Button variant="outline" onClick={() => setReasonPrompt(null)}>Back</Button>
//           <Button variant="danger" disabled={busy || !reasonText.trim()} onClick={doReasonAction}>
//             Confirm {reasonPrompt?.label}
//           </Button>
//         </>}>
//         <p className="text-sm text-slate-600 mb-3">
//           Provide a short reason. It will be recorded in the audit log.
//         </p>
//         <Input label="Reason" value={reasonText} onChange={(e) => setReasonText(e.target.value)}
//                placeholder="e.g. Patient not present" />
//       </Modal>
//     </StaffLayout>
//   );
// }

import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, PauseCircle, PlayCircle, XCircle, AlertOctagon, Lock,
  PhoneCall, Play, CheckCircle2, SkipForward, RotateCcw, ArrowDownToLine,
  UserCheck, UserPlus, RefreshCw, Search,
} from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import BottomSheet from '../../components/ui/BottomSheet';
import TokenRow from '../../components/TokenRow';
import {
  getSession, openSession, pauseSession, resumeSession, closeSession,
  unavailableSession, cancelSession,
} from '../../api/sessions';
import {
  getSessionQueue, createWalkIn, arriveToken, callToken, startToken,
  completeToken, skipToken, recallToken, putAtEnd, noShowToken,
} from '../../api/tokens';
import { getErrorMessage } from '../../api/client';

export default function ReceptionistSessionDetail() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkIn, setWalkIn] = useState({ patientName: '', patientMobile: '' });

  const [reasonPrompt, setReasonPrompt] = useState(null);
  const [reasonText, setReasonText] = useState('');

  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const [sessionRes, queueRes] = await Promise.all([
        getSession(id),
        getSessionQueue(id),
      ]);

      // Handle both possible shapes returned by the backend.
      const session = sessionRes?.session || sessionRes;
      const tokens = Array.isArray(queueRes?.tokens)
        ? queueRes.tokens
        : Array.isArray(queueRes)
          ? queueRes
          : [];

      setSession(session || null);
      setTokens(tokens);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const run = async (fn, okMsg = '') => {
    setBusy(true); setErr(''); setInfo('');
    try { await fn(); await load(); if (okMsg) setInfo(okMsg); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  /* Session-level actions */
  const confirmClose = async () => {
    const waiting = tokens.filter((t) => t.status === 'WAITING').length;
    if (waiting > 0 && !window.confirm(`There are ${waiting} patients waiting. Close anyway?`)) return;
    await run(() => closeSession(id), 'Session closed.');
  };

  const confirmCancelSession = async () => {
    if (!cancelReason.trim()) return;
    if (!window.confirm('Cancel this session? Historical tokens remain accessible.')) return;
    await run(() => cancelSession(id, cancelReason.trim()), 'Session cancelled.');
    setCancelOpen(false);
    setCancelReason('');
  };

  /* Walk-in */
  const submitWalkIn = async () => {
    await run(() => createWalkIn(id, walkIn), 'Walk-in token created.');
    setWalkIn({ patientName: '', patientMobile: '' });
    setWalkInOpen(false);
  };

  /* Token actions with reason */
  const askReasonThen = (token, action, label) => {
    setReasonPrompt({ token, action, label });
    setReasonText('');
  };

  const doReasonAction = async () => {
    if (!reasonPrompt) return;
    const { token, action, label } = reasonPrompt;
    if (!reasonText.trim()) return;
    await run(() => action(token.id, reasonText.trim()), `${label} done.`);
    setReasonPrompt(null);
  };

  /* ---- render guards ---- */
  if (loading) {
    return (
      <StaffLayout>
        <div className="space-y-3">
          <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </StaffLayout>
    );
  }

  if (err && !session) {
    return (
      <StaffLayout>
        <Link to="/receptionist" className="text-sm text-brand-600 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to today
        </Link>
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {err}
        </div>
      </StaffLayout>
    );
  }

  if (!session) {
    return (
      <StaffLayout>
        <Link to="/receptionist" className="text-sm text-brand-600 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to today
        </Link>
        <div className="mt-4 text-slate-500">Session not found.</div>
      </StaffLayout>
    );
  }

  /* Safely derive every field we render. */
  const status = session.status || 'SCHEDULED';
  const doctorName = session.doctor?.user?.fullName || 'Unknown doctor';
  const departmentName = session.doctor?.department?.name || '';
  const roomNo = session.doctor?.roomNo || '—';
  const startTime = session.startTime || '--:--';
  const endTime = session.endTime || '--:--';
  const bookedCount = session.bookedCount ?? 0;
  const maxCapacity = session.maxCapacity ?? 0;

  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const currentServing = tokens.find((t) => ['CALLED', 'IN_CONSULTATION'].includes(t.status));

  const filtered = filter.trim()
    ? tokens.filter((t) => {
        const q = filter.trim().toLowerCase();
        const num = String(t.tokenNumber || '');
        const name = (t.patient?.fullName || '').toLowerCase();
        const mobile = (t.patient?.mobile || '');
        return num.includes(q) || name.includes(q) || mobile.includes(q);
      })
    : tokens;

  return (
    <StaffLayout>
      <Link to="/receptionist" className="text-sm text-brand-600 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to today
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{doctorName}</h1>
        <Badge status={status} />
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>
      <p className="text-slate-500 text-sm">
        {departmentName} • {startTime}–{endTime} • Room {roomNo}
      </p>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
      {info && <p className="mt-3 text-teal-700 text-sm">{info}</p>}

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card><div className="p-4 text-center">
          <div className="text-xs text-slate-500">Now serving</div>
          <div className="text-2xl font-semibold">
            {currentServing?.tokenNumber ?? '—'}
          </div>
        </div></Card>
        <Card><div className="p-4 text-center">
          <div className="text-xs text-slate-500">Waiting</div>
          <div className="text-2xl font-semibold">{waitingTokens.length}</div>
        </div></Card>
        <Card><div className="p-4 text-center">
          <div className="text-xs text-slate-500">Booked</div>
          <div className="text-2xl font-semibold">{bookedCount}/{maxCapacity}</div>
        </div></Card>
      </div>

      {/* Session actions */}
      <Card className="mt-6">
        <div className="p-5">
          <h2 className="font-semibold">Session actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {status === 'SCHEDULED' && (
              <Button disabled={busy} onClick={() => run(() => openSession(id), 'Queue opened.')}>
                <PlayCircle className="w-4 h-4 mr-1" /> Open queue
              </Button>
            )}
            {status === 'OPEN' && (
              <Button variant="outline" disabled={busy} onClick={() => run(() => pauseSession(id), 'Queue paused.')}>
                <PauseCircle className="w-4 h-4 mr-1" /> Pause
              </Button>
            )}
            {status === 'PAUSED' && (
              <Button variant="secondary" disabled={busy} onClick={() => run(() => resumeSession(id), 'Queue resumed.')}>
                <PlayCircle className="w-4 h-4 mr-1" /> Resume
              </Button>
            )}
            {['OPEN', 'PAUSED'].includes(status) && (
              <Button variant="outline" disabled={busy} onClick={confirmClose}>
                <Lock className="w-4 h-4 mr-1" /> Close
              </Button>
            )}
            {['SCHEDULED', 'OPEN', 'PAUSED'].includes(status) && (
              <Button variant="outline" disabled={busy}
                      onClick={() => run(() => unavailableSession(id), 'Marked unavailable.')}>
                <AlertOctagon className="w-4 h-4 mr-1" /> Mark unavailable
              </Button>
            )}
            {['SCHEDULED', 'OPEN', 'PAUSED', 'UNAVAILABLE'].includes(status) && (
              <Button variant="danger" disabled={busy} onClick={() => setCancelOpen(true)}>
                <XCircle className="w-4 h-4 mr-1" /> Cancel session
              </Button>
            )}
            {status === 'UNAVAILABLE' && (
              <Button variant="outline" disabled={busy}
                      onClick={() => run(() => resumeSession(id), 'Queue resumed.')}>
                <PlayCircle className="w-4 h-4 mr-1" /> Resume as open
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Walk-in */}
      <Card className="mt-6">
        <div className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold">Walk-in token</h2>
            <Button size="sm" disabled={status !== 'OPEN' || busy} onClick={() => setWalkInOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Add walk-in
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Walk-in tokens share the same counter as online tokens.
          </p>
        </div>
      </Card>

      {/* Queue */}
      <Card className="mt-6">
        <div className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold">Queue ({tokens.length})</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 w-full sm:w-64"
                placeholder="Token # or name / mobile"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            {filtered.length === 0 && (
              <p className="text-slate-500 text-sm">No tokens to show.</p>
            )}
            {filtered.map((t) => {
              const actions = [];
              const isWaiting = t.status === 'WAITING';
              const isCalled = t.status === 'CALLED';
              const isInConsult = t.status === 'IN_CONSULTATION';
              const isSkipped = t.status === 'SKIPPED';
              const notArrived = t.arrivalStatus === 'NOT_ARRIVED';

              if (notArrived && (isWaiting || isCalled)) {
                actions.push(
                  <Button key="arrive" size="sm" variant="outline"
                          onClick={() => run(() => arriveToken(t.id), 'Marked arrived.')}>
                    <UserCheck className="w-4 h-4 mr-1" /> Arrived
                  </Button>
                );
              }
              if (isWaiting) {
                actions.push(
                  <Button key="call" size="sm"
                          onClick={() => run(() => callToken(t.id), `Called #${t.tokenNumber}.`)}>
                    <PhoneCall className="w-4 h-4 mr-1" /> Call
                  </Button>,
                  <Button key="skip" size="sm" variant="outline"
                          onClick={() => askReasonThen(t, skipToken, 'Skip')}>
                    <SkipForward className="w-4 h-4 mr-1" /> Skip
                  </Button>,
                  <Button key="end" size="sm" variant="ghost"
                          onClick={() => run(() => putAtEnd(t.id), 'Moved to end.')}>
                    <ArrowDownToLine className="w-4 h-4 mr-1" /> End
                  </Button>
                );
              }
              if (isCalled) {
                actions.push(
                  <Button key="start" size="sm"
                          onClick={() => run(() => startToken(t.id), `Started #${t.tokenNumber}.`)}>
                    <Play className="w-4 h-4 mr-1" /> Start
                  </Button>,
                  <Button key="skip" size="sm" variant="outline"
                          onClick={() => askReasonThen(t, skipToken, 'Skip')}>
                    <SkipForward className="w-4 h-4 mr-1" /> Skip
                  </Button>,
                  <Button key="noshow" size="sm" variant="outline"
                          onClick={() => askReasonThen(t, noShowToken, 'No-show')}>
                    No-show
                  </Button>
                );
              }
              if (isInConsult) {
                actions.push(
                  <Button key="complete" size="sm" variant="secondary"
                          onClick={() => run(() => completeToken(t.id), `Completed #${t.tokenNumber}.`)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                  </Button>,
                  <Button key="skip" size="sm" variant="outline"
                          onClick={() => askReasonThen(t, skipToken, 'Skip')}>
                    <SkipForward className="w-4 h-4 mr-1" /> Skip
                  </Button>
                );
              }
              if (isSkipped) {
                actions.push(
                  <Button key="recall" size="sm"
                          onClick={() => run(() => recallToken(t.id), `Recalled #${t.tokenNumber}.`)}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Recall
                  </Button>,
                  <Button key="end" size="sm" variant="outline"
                          onClick={() => run(() => putAtEnd(t.id), 'Moved to end.')}>
                    <ArrowDownToLine className="w-4 h-4 mr-1" /> End
                  </Button>
                );
              }

              // Defensive: ensure patient object always exists.
              const safeToken = {
                ...t,
                patient: t.patient || { fullName: 'Unknown', mobile: '—' },
              };
              return <TokenRow key={t.id} token={safeToken} actions={actions} />;
            })}
          </div>
        </div>
      </Card>

      {/* Cancel session modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel session"
        footer={<>
          <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
          <Button variant="danger" disabled={busy || !cancelReason.trim()} onClick={confirmCancelSession}>
            Confirm cancel
          </Button>
        </>}>
        <p className="text-sm text-slate-600 mb-3">
          Historical tokens remain accessible. Provide a reason (audited).
        </p>
        <Input label="Reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
               placeholder="e.g. Doctor emergency" />
      </Modal>

      {/* Walk-in modal */}
      <Modal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="New walk-in token"
        footer={<>
          <Button variant="outline" onClick={() => setWalkInOpen(false)}>Cancel</Button>
          <Button onClick={submitWalkIn}
                  disabled={busy || !walkIn.patientName || !walkIn.patientMobile}>
            Create token
          </Button>
        </>}>
        <div className="space-y-3">
          <Input label="Patient name" value={walkIn.patientName}
                 onChange={(e) => setWalkIn({ ...walkIn, patientName: e.target.value })} />
          <Input label="Mobile number" inputMode="numeric" value={walkIn.patientMobile}
                 onChange={(e) => setWalkIn({ ...walkIn, patientMobile: e.target.value })} />
          <p className="text-xs text-slate-500">
            If a patient account already exists for this mobile, the token is added to that patient.
          </p>
        </div>
      </Modal>

      {/* Reason prompt modal */}
      <Modal open={!!reasonPrompt} onClose={() => setReasonPrompt(null)}
             title={`${reasonPrompt?.label || ''} token`}
        footer={<>
          <Button variant="outline" onClick={() => setReasonPrompt(null)}>Back</Button>
          <Button variant="danger" disabled={busy || !reasonText.trim()} onClick={doReasonAction}>
            Confirm {reasonPrompt?.label}
          </Button>
        </>}>
        <p className="text-sm text-slate-600 mb-3">
          Provide a short reason. It will be recorded in the audit log.
        </p>
        <Input label="Reason" value={reasonText} onChange={(e) => setReasonText(e.target.value)}
               placeholder="e.g. Patient not present" />
      </Modal>
    </StaffLayout>
  );
}