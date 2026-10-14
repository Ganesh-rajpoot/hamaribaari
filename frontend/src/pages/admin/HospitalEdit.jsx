import { useEffect, useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getMyHospital, patchMyHospital } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

export default function HospitalEdit() {
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => { getMyHospital().then((h) => setForm({
    name: h.name || '', city: h.city || '', address: h.address || '', phone: h.phone || '',
  })).catch((e) => setErr(getErrorMessage(e))); }, []);

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setOk(false);
    try { await patchMyHospital(form); setOk(true); }
    catch (e2) { setErr(getErrorMessage(e2)); }
    finally { setBusy(false); }
  };

  return (
    <StaffLayout>
      <h1 className="text-2xl font-bold">Hospital details</h1>
      <Card className="mt-4">
        <form onSubmit={save} className="p-5 space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {ok && <p className="text-teal-700 text-sm">Saved.</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
        </form>
      </Card>
    </StaffLayout>
  );
}