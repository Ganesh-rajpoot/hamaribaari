import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, RefreshCw } from 'lucide-react';
import OperatorLayout from '../../layouts/OperatorLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { listHospitals, createHospital, setHospitalStatus } from '../../api/operator';
import { getErrorMessage } from '../../api/client';

const statusColor = { ACTIVE: 'OPEN', SUSPENDED: 'CANCELLED', PENDING: 'PAUSED' };

const emptyForm = {
  name: '', city: '', address: '', phone: '',
  adminFullName: '', adminMobile: '', adminPassword: '',
};

export default function OperatorHospitals() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try { setList(await listHospitals(q ? { q } : {})); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setBusy(true); setErr(''); setInfo('');
    try {
      const result = await createHospital(form);
      setInfo(`Created ${result.hospital.name}. Admin can log in as ${result.admin.mobile}.`);
      setForm(emptyForm);
      setOpen(false);
      await load();
    } catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const changeStatus = async (id, status) => {
    if (!window.confirm(`Set hospital status to ${status}?`)) return;
    setErr('');
    try { await setHospitalStatus(id, status); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <OperatorLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hospitals</h1>
          <p className="text-slate-500 text-sm">Each hospital gets one admin account you hand over.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New hospital
          </Button>
        </div>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
      {info && <p className="mt-3 text-teal-700 text-sm">{info}</p>}

      <div className="mt-4 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search name or city"
               value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      <div className="mt-6 space-y-3">
        {list.map((h) => (
          <Card key={h.id}>
            <div className="p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/operator/hospitals/${h.id}`}
                        className="font-semibold text-lg hover:text-brand-600">
                    {h.name}
                  </Link>
                  <Badge status={statusColor[h.status] || 'CLOSED'}>{h.status}</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {h.city}
                  {' • '} {h._count.departments} depts
                  {' • '} {h._count.doctors} doctors
                  {' • '} {h._count.sessions} sessions
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {h.status !== 'ACTIVE' && (
                  <Button size="sm" variant="outline"
                          onClick={() => changeStatus(h.id, 'ACTIVE')}>Activate</Button>
                )}
                {h.status === 'ACTIVE' && (
                  <Button size="sm" variant="outline"
                          onClick={() => changeStatus(h.id, 'SUSPENDED')}>Suspend</Button>
                )}
                <Link to={`/operator/hospitals/${h.id}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {!loading && list.length === 0 && (
          <p className="text-slate-500">No hospitals yet. Click <em>New hospital</em> to create one.</p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create hospital"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy ||
            !form.name || !form.city ||
            !form.adminFullName || !form.adminMobile || !form.adminPassword}>
            {busy ? 'Creating…' : 'Create hospital + admin'}
          </Button>
        </>}>
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital</div>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Address (optional)" value={form.address}
                 onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Phone (optional)" value={form.phone}
                 onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <div className="pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            First hospital admin
          </div>
          <Input label="Admin full name" value={form.adminFullName}
                 onChange={(e) => setForm({ ...form, adminFullName: e.target.value })} />
          <Input label="Admin mobile" inputMode="numeric" value={form.adminMobile}
                 onChange={(e) => setForm({ ...form, adminMobile: e.target.value })} />
          <Input label="Admin password" hint="Share this with the hospital; they can change it later"
                 value={form.adminPassword}
                 onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
        </div>
      </Modal>
    </OperatorLayout>
  );
}