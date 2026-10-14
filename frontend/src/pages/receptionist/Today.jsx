import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Stethoscope } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getReceptionistToday } from '../../api/sessions';

export default function ReceptionistToday() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try { setSessions(await getReceptionistToday()); }
    catch (e) { setErr(e?.response?.data?.error?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  return (
    <StaffLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s OPD</h1>
          <p className="text-slate-500 text-sm">Open / pause / close queues for today.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      {!loading && sessions.length === 0 && (
        <Card className="mt-6"><div className="p-6 text-slate-600">
          No sessions today. Ask the hospital admin to run <em>Ensure today&apos;s sessions</em>.
        </div></Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="font-semibold truncate">{s.doctor.user.fullName}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {s.doctor.department?.name} • Room {s.doctor.roomNo || '—'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{s.startTime} – {s.endTime}</div>
                </div>
                <Badge status={s.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-slate-500">Serving</div>
                  <div className="text-lg font-semibold">{s.currentToken?.tokenNumber ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Waiting</div>
                  <div className="text-lg font-semibold">{s.waitingCount}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Capacity</div>
                  <div className="text-lg font-semibold">{s.bookedCount}/{s.maxCapacity}</div>
                </div>
              </div>

              <div className="mt-4">
                <Link to={`/receptionist/sessions/${s.id}`}
                      className="text-sm text-brand-600">Manage queue →</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </StaffLayout>
  );
}