import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

const homeFor = (role) =>
  role === 'PATIENT' ? '/patient' : '/'; // other roles added in later phases

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = await login(form.mobile.trim(), form.password);
      nav(homeFor(u.role), { replace: true });
    } catch (e2) { setErr(getErrorMessage(e2)); }
    finally { setBusy(false); }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="text-slate-500 text-sm mt-1">Use your mobile number and password.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-slate-700">Mobile number</label>
          <input inputMode="numeric" autoComplete="tel"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="10-digit mobile" required />
        </div>
        <div>
          <label className="text-sm text-slate-700">Password</label>
          <input type="password" autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required />
        </div>

        {err && <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>}

        <button disabled={busy}
          className="w-full rounded-xl bg-brand-600 text-white py-3 text-lg font-medium disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        New patient? <Link className="text-brand-600" to="/register">Create account</Link>
      </p>
    </section>
  );
}