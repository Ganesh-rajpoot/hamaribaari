import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Stethoscope } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getDoctorToday } from '../../api/doctor';
import { getErrorMessage } from '../../api/client';
import useInterval from '../../hooks/useInterval';

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = async () => {
    try { setData(await getDoctorToday()); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  useEffect(() => { load(); }, []);
  useInterval(load, 20000);

  return (
    <StaffLayout>
      <h1 className="text-2xl font-bold">Today</h1>
      {data && (
        <p className="text-slate-500 text-sm">
          {data.profile.user.fullName} • {data.profile.department.name} • Room {data.profile.roomNo || '—'}
        </p>
      )}

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(data?.sessions || []).map((s) => (
          <Card key={s.id}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span className="font-medium">{s.startTime} – {s.endTime}</span>
                </div>
                <Badge status={s.status} />
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Booked {s.bookedCount}/{s.maxCapacity} • Next token {s.nextTokenNumber}
              </div>
              <div className="mt-4">
                <Link to="/doctor/queue">
                  <Button size="sm"><Stethoscope className="w-4 h-4 mr-1" /> Open my queue</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {data && data.sessions.length === 0 && (
          <Card><div className="p-6 text-slate-600">
            No sessions assigned for today. Contact your receptionist.
          </div></Card>
        )}
      </div>
    </StaffLayout>
  );
}