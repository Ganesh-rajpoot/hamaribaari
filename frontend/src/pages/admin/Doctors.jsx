import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { listDoctors, listDepartments, createDoctor } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

const initial = {
  fullName: '', mobile: '', password: '', departmentId: '',
  registrationNo: '', roomNo: '', avgConsultMinutes: 8,
};

export default function AdminDoctors() {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [d, deps] = await Promise.all([listDoctors(), listDepartments()]);
      setList(d); setDepartments(deps);
      if (!form.departmentId && deps[0]) setForm((f) => ({ ...f, departmentId: deps[0].id }));
    } catch (e) { setErr(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true); setErr('');
    try {
      await createDoctor({
        ...form,
        avgConsultMinutes: Number(form.avgConsultMinutes) || 8,
      });
      setOpen(false); setForm({ ...initial, departmentId: departments[0]?.id || '' });
      await load();
    } catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <StaffLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> New doctor
        </Button>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((d) => (
          <Card key={d.id}><div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{d.user.fullName}</div>
              <Link to={`/admin/doctors/${d.id}/schedules`}
                    className="text-sm text-brand-600 inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Schedules
              </Link>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {d.department?.name} • Room {d.roomNo || '—'} • {d.user.mobile}
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg consult {d.avgConsultMinutes} min</div>
          </div></Card>
        ))}
        {list.length === 0 && <p className="text-slate-500">No doctors yet.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create doctor account"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy || !form.fullName || !form.mobile || !form.password || !form.departmentId}>
            Create
          </Button>
        </>}>
        <div className="space-y-3">
          <Input label="Full name" value={form.fullName}
                 onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Mobile" inputMode="numeric" value={form.mobile}
                 onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input label="Temporary password" type="password" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <label className="block">
            <span className="block text-sm text-slate-700 mb-1">Department</span>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <Input label="Registration no (optional)" value={form.registrationNo}
                 onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} />
          <Input label="Room no (optional)" value={form.roomNo}
                 onChange={(e) => setForm({ ...form, roomNo: e.target.value })} />
          <Input label="Avg consult minutes" type="number" min="1" max="120"
                 value={form.avgConsultMinutes}
                 onChange={(e) => setForm({ ...form, avgConsultMinutes: e.target.value })} />
        </div>
      </Modal>
    </StaffLayout>
  );
}