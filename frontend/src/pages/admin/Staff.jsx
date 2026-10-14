import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createStaff } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

const initial = { fullName: '', mobile: '', password: '', role: 'RECEPTIONIST' };

export default function AdminStaff() {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setOk('');
    try {
      const u = await createStaff(form);
      setOk(`${u.role} account created for ${u.fullName} (${u.mobile}).`);
      setForm(initial);
    } catch (e2) { setErr(getErrorMessage(e2)); }
    finally { setBusy(false); }
  };

  return (
    <StaffLayout>
      <h1 className="text-2xl font-bold">Staff accounts</h1>
      <p className="text-slate-500 text-sm">
        Create receptionist or additional admin accounts. Doctor accounts are created from the Doctors page.
      </p>

      <Card className="mt-4">
        <form onSubmit={submit} className="p-5 space-y-4 max-w-md">
          <Input label="Full name" value={form.fullName}
                 onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Mobile" inputMode="numeric" value={form.mobile}
                 onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
          <Input label="Temporary password" type="password" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <label className="block">
            <span className="block text-sm text-slate-700 mb-1">Role</span>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="HOSPITAL_ADMIN">Hospital admin</option>
            </select>
          </label>

          {err && <p className="text-red-600 text-sm">{err}</p>}
          {ok && <p className="text-teal-700 text-sm">{ok}</p>}

          <Button type="submit" disabled={busy}>
            <UserPlus className="w-4 h-4 mr-1" /> {busy ? 'Creating…' : 'Create account'}
          </Button>
        </form>
      </Card>
    </StaffLayout>
  );
}