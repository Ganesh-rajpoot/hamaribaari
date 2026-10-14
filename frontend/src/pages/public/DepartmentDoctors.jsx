import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { getDoctors } from '../../api/hospitals';
import Card from '../../components/ui/Card';

export default function DepartmentDoctors() {
  const { id, deptId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    getDoctors(id)
      .then((list) => setDoctors(list.filter((d) => d.department?.id === deptId)))
      .catch((e) => setErr(e?.response?.data?.error?.message || 'Failed to load'))
      .finally(() => setBusy(false));
  }, [id, deptId]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/hospitals/${id}`} className="text-sm text-brand-600">← Back to hospital</Link>
      <h1 className="mt-2 text-2xl font-bold">Doctors</h1>
      <p className="text-slate-500 text-sm">Tap a doctor to see today&apos;s OPD sessions.</p>

      {busy && <p className="mt-6">Loading…</p>}
      {err && <p className="mt-6 text-red-600">{err}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {doctors.map((d) => (
          <Card key={d.id}>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-brand-600" />
                <span className="font-semibold">{d.user.fullName}</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {d.department?.name} {d.roomNo ? `• Room ${d.roomNo}` : ''}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Avg consult: {d.avgConsultMinutes} min
              </div>
              <Link to={`/doctors/${d.id}/sessions`}
                    className="mt-3 inline-block text-sm text-brand-600">View today&apos;s sessions →</Link>
            </div>
          </Card>
        ))}
        {!busy && doctors.length === 0 && <p className="text-slate-500">No doctors in this department.</p>}
      </div>
    </section>
  );
}