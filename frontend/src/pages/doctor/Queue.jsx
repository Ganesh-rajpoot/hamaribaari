import { useEffect, useState } from 'react';
import { Play, CheckCircle2, SkipForward, RefreshCw, User } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getDoctorQueue, doctorStart, doctorComplete, doctorSkip } from '../../api/doctor';
import { getErrorMessage } from '../../api/client';
import useInterval from '../../hooks/useInterval';

export default function DoctorQueue() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [skipOpen, setSkipOpen] = useState(null);
  const [skipReason, setSkipReason] = useState('');

  const load = async () => {
    try { setData(await getDoctorQueue()); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  useEffect(() => { load(); }, []);
  useInterval(load, 8000);

  const run = async (fn, ok) => {
    setBusy(true); setErr(''); setInfo('');
    try { await fn(); await load(); if (ok) setInfo(ok); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const submitSkip = async () => {
    if (!skipOpen || !skipReason.trim()) return;
    await run(() => doctorSkip(skipOpen.id, skipReason.trim()), `Skipped #${skipOpen.tokenNumber}.`);
    setSkipOpen(null); setSkipReason('');
  };

  if (!data) return <StaffLayout><p className="text-slate-500">Loading…</p></StaffLayout>;

  const { session, currentServing, waitingCount, nextUp, profile } = data;

  return (
    <StaffLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My queue</h1>
          {profile && (
            <p className="text-slate-500 text-sm">
              {profile.department.name} • Room {profile.roomNo || '—'}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
      {info && <p className="mt-3 text-teal-700 text-sm">{info}</p>}

      {!session && (
        <Card className="mt-6"><div className="p-6 text-slate-600">
          No active session right now. Ask the receptionist to open the queue.
        </div></Card>
      )}

      {session && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge status={session.status} />
            <span className="text-slate-500 text-sm">
              {session.startTime}–{session.endTime} • Waiting {waitingCount} • Booked {session.bookedCount}/{session.maxCapacity}
            </span>
          </div>

          {/* Current patient */}
          <Card className="mt-4">
            <div className="p-5">
              <div className="text-xs text-slate-500">Current patient</div>
              {!currentServing && (
                <p className="text-slate-600 mt-2">No patient is currently being called.</p>
              )}
              {currentServing && (
                <div className="mt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-3xl font-bold">#{currentServing.tokenNumber}</div>
                    <Badge status={currentServing.status} />
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      <User className="w-4 h-4" /> {currentServing.patient.fullName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Mobile {currentServing.patient.mobile} • {currentServing.arrivalStatus === 'ARRIVED' ? 'Arrived' : 'Not arrived'}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentServing.status === 'CALLED' && (
                      <Button disabled={busy}
                              onClick={() => run(() => doctorStart(currentServing.id), `Started #${currentServing.tokenNumber}.`)}>
                        <Play className="w-4 h-4 mr-1" /> Start consultation
                      </Button>
                    )}
                    {currentServing.status === 'IN_CONSULTATION' && (
                      <Button variant="secondary" disabled={busy}
                              onClick={() => run(() => doctorComplete(currentServing.id), `Completed #${currentServing.tokenNumber}.`)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Complete &amp; call next
                      </Button>
                    )}
                    <Button variant="outline" disabled={busy}
                            onClick={() => { setSkipOpen(currentServing); setSkipReason(''); }}>
                      <SkipForward className="w-4 h-4 mr-1" /> Skip
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Next up */}
          <Card className="mt-6">
            <div className="p-5">
              <h2 className="font-semibold">Next up</h2>
              {nextUp.length === 0 && (
                <p className="text-slate-500 text-sm mt-2">No waiting patients.</p>
              )}
              <ul className="mt-3 divide-y divide-slate-100">
                {nextUp.map((t) => (
                  <li key={t.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">#{t.tokenNumber}</span>
                      <span className="text-slate-700">{t.patient.fullName}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.arrivalStatus === 'ARRIVED' ? 'Arrived' : 'Not arrived'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </>
      )}

      {/* Skip modal */}
      <Modal open={!!skipOpen} onClose={() => setSkipOpen(null)}
             title={`Skip #${skipOpen?.tokenNumber ?? ''}`}
             footer={<>
               <Button variant="outline" onClick={() => setSkipOpen(null)}>Back</Button>
               <Button variant="danger" disabled={busy || !skipReason.trim()} onClick={submitSkip}>
                 Confirm skip
               </Button>
             </>}>
        <p className="text-sm text-slate-600 mb-3">
          Reason is recorded in the audit log. The patient can be recalled by reception.
        </p>
        <Input label="Reason" value={skipReason} onChange={(e) => setSkipReason(e.target.value)}
               placeholder="e.g. Patient not present in room" />
      </Modal>
    </StaffLayout>
  );
}