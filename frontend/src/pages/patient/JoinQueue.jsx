import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getDoctorSessions } from '../../api/hospitals';
import { joinQueue } from '../../api/tokens';
import { getErrorMessage } from '../../api/client';


export default function JoinQueue() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // We don't have a direct GET /sessions/:id for patients.
    // Use doctor sessions listing to find ours; requires knowing doctorId — passed via query.
    const doctorId = new URLSearchParams(window.location.search).get('doctor');
    if (!doctorId) { setErr('Missing doctor reference'); return; }
    getDoctorSessions(doctorId)
      .then((r) => {
        const s = r.sessions.find((x) => x.id === sessionId);
        if (!s) setErr('Session not found');
        else setSession({ ...s, doctor: r.doctor });
      })
      .catch((e) => setErr(getErrorMessage(e)));
  }, [sessionId]);

  const join = async () => {
    setBusy(true); setErr('');
    try {
      const token = await joinQueue(sessionId);
      nav(`/patient/tokens/${token.id}`, { replace: true });
    } catch (e) {
      setErr(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <button onClick={() => nav(-1)} className="text-sm text-brand-600 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="mt-3 text-2xl font-bold">Confirm queue join</h1>

      {!session && !err && <p className="mt-4 text-slate-500">Loading…</p>}
      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}

      {session && (
        <Card className="mt-4">
          <div className="p-5 space-y-2">
            <div className="font-semibold text-lg">{session.doctor?.user?.fullName}</div>
            <div className="text-sm text-slate-500">
              {session.doctor?.department?.name} • Room {session.doctor?.roomNo || '—'}
            </div>
            <div className="text-sm">{session.startTime} – {session.endTime}</div>
            <div className="flex items-center gap-2 pt-2">
              <Badge status={session.status} />
              <span className="text-xs text-slate-500">
                Booked {session.bookedCount}/{session.maxCapacity}
              </span>
            </div>

            <p className="text-xs text-slate-500 pt-3">
              You will get a token number immediately. Reach the hospital when your turn is near.
              Your registration &amp; consultation fee will be handled at reception.
            </p>

            <Button className="w-full mt-3" disabled={busy || session.status !== 'OPEN'} onClick={join}>
              <Ticket className="w-4 h-4 mr-1" /> {busy ? 'Joining…' : 'Join queue'}
            </Button>
            {session.status !== 'OPEN' && (
              <p className="text-xs text-amber-700 text-center">Queue is {session.status.toLowerCase()}.</p>
            )}
          </div>
        </Card>
      )}
    </section>
  );
}