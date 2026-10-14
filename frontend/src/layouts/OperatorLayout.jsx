import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/operator',            label: 'Overview' },
  { to: '/operator/hospitals',  label: 'Hospitals' },
];

export default function OperatorLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/operator" className="font-semibold text-brand-600">HamariBaari</Link>
            <span className="text-[10px] uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Operator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-500 text-sm">{user?.fullName}</span>
            <button onClick={() => { logout(); nav('/'); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm">
              Logout
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {links.map((l) => {
            const active = pathname === l.to || pathname.startsWith(l.to + '/');
            return (
              <Link key={l.to} to={l.to}
                className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-lg
                  ${active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}