import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Stethoscope, CalendarPlus } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getMyHospital, listDepartments, listDoctors, ensureTodaySessions } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

export default function AdminOverview() {
  const [hospital, setHospital] = useState(null);
  const [counts, setCounts] = useState({ depts: 0, doctors: 0 });
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [h, depts, docs] = await Promise.all([getMyHospital(), listDepartments(), listDoctors()]);
        setHospital(h);
        setCounts({ depts: depts.length, doctors: docs.length });
      } catch (e) { setErr(getErrorMessage(e)); }
    })();
  }, []);

  const runEnsure = async () => {
    setErr(''); setInfo('');
    try {
      const r = await ensureTodaySessions();
      setInfo(`Created ${r.created} session(s) for today.`);
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <StaffLayout>
      <h1 className="text-2xl font-bold">Hospital Admin</h1>
      <p className="text-slate-500 text-sm">Manage departments, doctors, schedules, staff.</p>

      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
      {info && <p className="mt-4 text-teal-700 text-sm">{info}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card><div className="p-5">
          <Building2 className="w-5 h-5 text-brand-600" />
          <div className="mt-2 font-semibold">{hospital?.name || '—'}</div>
          <div className="text-xs text-slate-500">{hospital?.city}</div>
          <Link to="/admin/hospital" className="mt-2 inline-block text-sm text-brand-600">Edit details</Link>
        </div></Card>
        <Card><div className="p-5">
          <Users className="w-5 h-5 text-brand-600" />
          <div className="mt-2 text-2xl font-semibold">{counts.depts}</div>
          <div className="text-xs text-slate-500">Departments</div>
          <Link to="/admin/departments" className="mt-2 inline-block text-sm text-brand-600">Manage</Link>
        </div></Card>
        <Card><div className="p-5">
          <Stethoscope className="w-5 h-5 text-brand-600" />
          <div className="mt-2 text-2xl font-semibold">{counts.doctors}</div>
          <div className="text-xs text-slate-500">Doctors</div>
          <Link to="/admin/doctors" className="mt-2 inline-block text-sm text-brand-600">Manage</Link>
        </div></Card>
      </div>

      <Card className="mt-6">
        <div className="p-5 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><CalendarPlus className="w-5 h-5 text-brand-600" /> Daily OPD</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create today&apos;s sessions from each doctor&apos;s weekly schedule. Safe to run more than once.
            </p>
          </div>
          <Button onClick={runEnsure}>Ensure today&apos;s sessions</Button>
        </div>
      </Card>
    </StaffLayout>
  );
}