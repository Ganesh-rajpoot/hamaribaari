import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { listSchedules, addSchedule, deleteSchedule } from '../../api/admin';
import { getErrorMessage } from '../../api/client';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminSchedules() {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ weekday: 1, startTime: '09:00', endTime: '13:00', maxCapacity: 40 });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setList(await listSchedules(id)); } catch (e) { setErr(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, [id]);

  const add = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await addSchedule(id, { ...form, weekday: Number(form.weekday), maxCapacity: Number(form.maxCapacity) }); await load(); }
    catch (e2) { setErr(getErrorMessage(e2)); }
    finally { setBusy(false); }
  };

  const remove = async (sid) => {
    if (!window.confirm('Delete this weekly slot?')) return;
    try { await deleteSchedule(id, sid); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <StaffLayout>
      <Link to="/admin/doctors" className="text-sm text-brand-600 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Weekly schedules</h1>
      <p className="text-slate-500 text-sm">
        Regular weekly slots. Sessions are only created for today when admin runs <em>Ensure today&apos;s sessions</em>.
      </p>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      <Card className="mt-4">
        <form onSubmit={add} className="p-5 grid gap-3 sm:grid-cols-5">
          <label className="sm:col-span-1">
            <span className="block text-sm text-slate-700 mb-1">Weekday</span>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.weekday} onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}>
              {WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}
            </select>
          </label>
          <Input label="Start" type="time" value={form.startTime}
                 onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <Input label="End" type="time" value={form.endTime}
                 onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          <Input label="Capacity" type="number" min="1" max="500" value={form.maxCapacity}
                 onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} />
          <div className="self-end">
            <Button type="submit" disabled={busy}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-2">
        {list.map((s) => (
          <Card key={s.id}><div className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{WEEKDAYS[s.weekday]} • {s.startTime} – {s.endTime}</div>
              <div className="text-xs text-slate-500">Capacity {s.maxCapacity}</div>
            </div>
            <button className="text-red-600 hover:text-red-700" onClick={() => remove(s.id)}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div></Card>
        ))}
        {list.length === 0 && <p className="text-slate-500">No schedule slots yet.</p>}
      </div>
    </StaffLayout>
  );
}