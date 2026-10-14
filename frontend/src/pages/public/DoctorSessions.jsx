import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { getDoctorSessions } from '../../api/hospitals';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DoctorSessions() {
  const { id } = useParams();
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    getDoctorSessions(id, date).then(setData).catch((e) =>
      setErr(e?.response?.data?.error?.message || 'Failed to load'));
  }, [id, date]);

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{data?.doctor?.user?.fullName || 'Doctor'}</h1>
      <p className="text-slate-500 text-sm">
        {data?.doctor?.department?.name} • {data?.doctor?.hospital?.name}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-slate-700">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
               className="rounded-xl border border-slate-200 px-3 py-2" />
      </div>

      {err && <p className="mt-4 text-red-600">{err}</p>}

      <div className="mt-6 space-y-3">
        {(data?.sessions || []).map((s) => (
          <Card key={s.id}>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  {s.startTime} – {s.endTime}
                </div>
                <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(s.sessionDate).toDateString()}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Booked {s.bookedCount} / {s.maxCapacity}
                </div>
              </div>
              <div className="text-right">
                <Badge status={s.status} />
                {s.status === 'OPEN' && (
                  <div className="mt-2">
                    <Link to={`/patient/join/${s.id}?doctor=${id}`}
                            className="text-sm text-brand-600 font-medium">Join queue →</Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {data && data.sessions.length === 0 && (
          <p className="text-slate-500">No OPD sessions on this date.</p>
        )}
      </div>
    </section>
  );
}