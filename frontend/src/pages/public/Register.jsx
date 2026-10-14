import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: '', mobile: '', password: '', confirmPassword: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      nav('/patient', { replace: true });
    } catch (e2) { setErr(getErrorMessage(e2)); }
    finally { setBusy(false); }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Create patient account</h1>
      <p className="text-slate-500 text-sm mt-1">Only patients can self-register.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {[
          { k:'fullName',        label:'Full name',     type:'text' },
          { k:'mobile',          label:'Mobile number', type:'tel'  },
          { k:'password',        label:'Password',      type:'password' },
          { k:'confirmPassword', label:'Confirm password', type:'password' },
        ].map(({ k, label, type }) => (
          <div key={k}>
            <label className="text-sm text-slate-700">{label}</label>
            <input type={type}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
              value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} required />
          </div>
        ))}

        {err && <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>}

        <button disabled={busy}
          className="w-full rounded-xl bg-brand-600 text-white py-3 text-lg font-medium disabled:opacity-60">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account? <Link className="text-brand-600" to="/login">Sign in</Link>
      </p>
    </section>
  );
}