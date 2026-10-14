import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Stethoscope, Ticket, CalendarDays } from 'lucide-react';
import OperatorLayout from '../../layouts/OperatorLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStats } from '../../api/operator';
import { getErrorMessage } from '../../api/client';

export default function OperatorOverview() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const items = stats && [
    { label: 'Hospitals',      value: stats.hospitals,       icon: Building2 },
    { label: 'Active',         value: stats.activeHospitals, icon: Building2 },
    { label: 'Staff & users',  value: stats.users,           icon: Users },
    { label: 'Doctors',        value: stats.doctors,         icon: Stethoscope },
    { label: 'Sessions (all)', value: stats.sessions,        icon: CalendarDays },
    { label: 'Tokens today',   value: stats.tokensToday,     icon: Ticket },
  ];

  return (
    <OperatorLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform overview</h1>
          <p className="text-slate-500 text-sm">Create hospitals, hand out credentials, monitor usage.</p>
        </div>
        <Link to="/operator/hospitals">
          <Button>Manage hospitals</Button>
        </Link>
      </div>

      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
      {!stats && !err && <p className="mt-6 text-slate-500">Loading…</p>}

      {items && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.label}>
              <div className="p-5">
                <it.icon className="w-5 h-5 text-brand-600" />
                <div className="mt-2 text-3xl font-semibold">{it.value}</div>
                <div className="text-xs text-slate-500">{it.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </OperatorLayout>
  );
}