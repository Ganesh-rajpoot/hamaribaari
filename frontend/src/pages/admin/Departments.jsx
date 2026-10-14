import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { listDepartments, createDepartment, deleteDepartment } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

export default function AdminDepartments() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    try { setList(await listDepartments()); } catch (e) { setErr(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true); setErr('');
    try { await createDepartment(form); setOpen(false); setForm({ name: '', code: '' }); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await deleteDepartment(id); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <StaffLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((d) => (
          <Card key={d.id}><div className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-slate-500">Code: {d.code}</div>
            </div>
            <button className="text-red-600 hover:text-red-700" onClick={() => remove(d.id)}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div></Card>
        ))}
        {list.length === 0 && <p className="text-slate-500">No departments yet.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New department"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy || !form.name || !form.code}>Create</Button>
        </>}>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Code" hint="Short, alphanumeric e.g. GEN" value={form.code}
                 onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </div>
      </Modal>
    </StaffLayout>
  );
}