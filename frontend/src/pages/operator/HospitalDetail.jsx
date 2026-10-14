import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, KeyRound, Ban, CheckCircle2 } from 'lucide-react';
import OperatorLayout from '../../layouts/OperatorLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import {
  getHospital, createStaff, resetUserPassword, toggleUserActive, setHospitalStatus,
} from '../../api/operator';
import { getErrorMessage } from '../../api/client';

export default function OperatorHospitalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const [staffOpen, setStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ fullName: '', mobile: '', password: '', role: 'RECEPTIONIST' });

  const [resetTarget, setResetTarget] = useState(null);
  const [newPwd, setNewPwd] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try { setData(await getHospital(id)); }
    catch (e) { setErr(getErrorMessage(e)); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const submitStaff = async () => {
    setErr(''); setInfo('');
    try {
      const u = await createStaff(id, staffForm);
      setInfo(`Created ${u.role} ${u.fullName} — login with ${u.mobile}.`);
      setStaffOpen(false);
      setStaffForm({ fullName: '', mobile: '', password: '', role: 'RECEPTIONIST' });
      await load();
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const doReset = async () => {
    if (!resetTarget || !newPwd.trim()) return;
    try {
      await resetUserPassword(resetTarget.id, newPwd.trim());
      setInfo(`Password reset for ${resetTarget.fullName} (${resetTarget.mobile}).`);
      setResetTarget(null); setNewPwd('');
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const toggle = async (user) => {
    try { await toggleUserActive(user.id, !user.isActive); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  const changeStatus = async (status) => {
    if (!window.confirm(`Set hospital status to ${status}?`)) return;
    try { await setHospitalStatus(id, status); await load(); }
    catch (e) { setErr(getErrorMessage(e)); }
  };

  if (!data && !err) return <OperatorLayout><p className="text-slate-500">Loading…</p></OperatorLayout>;
  if (err && !data) return <OperatorLayout><p className="text-red-600">{err}</p></OperatorLayout>;

  const h = data;

  return (
    <OperatorLayout>
      <Link to="/operator/hospitals" className="text-sm text-brand-600 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> All hospitals
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{h.name}</h1>
        <Badge status={h.status === 'ACTIVE' ? 'OPEN' : h.status === 'SUSPENDED' ? 'CANCELLED' : 'PAUSED'}>
          {h.status}
        </Badge>
      </div>
      <p className="text-slate-500 text-sm">{h.city} • {h.address || 'No address'}</p>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
      {info && <p className="mt-3 text-teal-700 text-sm">{info}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card><div className="p-4"><div className="text-xs text-slate-500">Departments</div>
          <div className="text-2xl font-semibold">{h._count.departments}</div></div></Card>
        <Card><div className="p-4"><div className="text-xs text-slate-500">Doctors</div>
          <div className="text-2xl font-semibold">{h._count.doctors}</div></div></Card>
        <Card><div className="p-4"><div className="text-xs text-slate-500">Sessions</div>
          <div className="text-2xl font-semibold">{h._count.sessions}</div></div></Card>
        <Card><div className="p-4"><div className="text-xs text-slate-500">Users</div>
          <div className="text-2xl font-semibold">{h._count.users}</div></div></Card>
      </div>

      <Card className="mt-6">
        <div className="p-5">
          <h2 className="font-semibold">Status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {h.status !== 'ACTIVE' && (
              <Button onClick={() => changeStatus('ACTIVE')}>Activate hospital</Button>
            )}
            {h.status !== 'SUSPENDED' && (
              <Button variant="danger" onClick={() => changeStatus('SUSPENDED')}>Suspend hospital</Button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Suspended hospitals are hidden from patients; existing data is preserved.
          </p>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold">Staff & admin accounts</h2>
            <Button size="sm" onClick={() => setStaffOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add staff
            </Button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {h.users.map((u) => (
              <div key={u.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{u.fullName}</span>
                    <span className="text-[10px] uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {u.role.replace('_', ' ')}
                    </span>
                    {!u.isActive && <span className="text-[10px] uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Disabled</span>}
                  </div>
                  <div className="text-xs text-slate-500">{u.mobile}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline"
                          onClick={() => { setResetTarget(u); setNewPwd(''); }}>
                    <KeyRound className="w-4 h-4 mr-1" /> Reset password
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(u)}>
                    {u.isActive
                      ? <><Ban className="w-4 h-4 mr-1" /> Disable</>
                      : <><CheckCircle2 className="w-4 h-4 mr-1" /> Enable</>}
                  </Button>
                </div>
              </div>
            ))}
            {h.users.length === 0 && <p className="text-slate-500 text-sm">No staff yet.</p>}
          </div>
        </div>
      </Card>

      {/* Add staff modal */}
      <Modal open={staffOpen} onClose={() => setStaffOpen(false)} title="Add staff"
        footer={<>
          <Button variant="outline" onClick={() => setStaffOpen(false)}>Cancel</Button>
          <Button onClick={submitStaff}
                  disabled={!staffForm.fullName || !staffForm.mobile || !staffForm.password}>
            Create
          </Button>
        </>}>
        <div className="space-y-3">
          <Input label="Full name" value={staffForm.fullName}
                 onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} />
          <Input label="Mobile" inputMode="numeric" value={staffForm.mobile}
                 onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })} />
          <Input label="Password" value={staffForm.password}
                 onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
          <label className="block">
            <span className="block text-sm text-slate-700 mb-1">Role</span>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="HOSPITAL_ADMIN">Hospital admin</option>
            </select>
          </label>
          <p className="text-xs text-slate-500">
            Doctors are created by the hospital admin from their own dashboard (they need a department).
          </p>
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)}
             title={`Reset password — ${resetTarget?.fullName ?? ''}`}
        footer={<>
          <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
          <Button onClick={doReset} disabled={!newPwd.trim()}>Reset</Button>
        </>}>
        <Input label="New password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
               hint="Minimum 6 characters. Share securely with the user." />
      </Modal>
    </OperatorLayout>
  );
}