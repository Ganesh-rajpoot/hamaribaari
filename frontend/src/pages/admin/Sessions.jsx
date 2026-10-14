import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { listSessionsByDate, ensureTodaySessions } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

export default function AdminSessions() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try { setList(await listSessionsByDate(date)); }
    catch (e) { setErr(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, [date]);

  const ensure = async () => {
    try { await ensureTodaySessions(); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <StaffLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                 className="rounded-xl border border-slate-200 px-3 py-2" />
          <Button size="sm" variant="outline" onClick={ensure}>Ensure today</Button>
        </div>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id}><div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{s.doctor.user.fullName}</div>
                <div className="text-xs text-slate-500">
                  {s.doctor.department?.name} • {s.startTime}–{s.endTime}
                </div>
              </div>
              <Badge status={s.status} />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Booked {s.bookedCount}/{s.maxCapacity} • Next token {s.nextTokenNumber}
            </div>
            <Link to={`/receptionist/sessions/${s.id}`}
                  className="mt-2 inline-block text-sm text-brand-600">Open queue →</Link>
          </div></Card>
        ))}
        {list.length === 0 && <p className="text-slate-500">No sessions for this date.</p>}
      </div>
    </StaffLayout>
  );
}