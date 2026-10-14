import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Ticket, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/patient',         label: 'Home',      icon: Home,   exact: true },
  { to: '/hospitals',       label: 'Hospitals', icon: Search },
  { to: '/patient/tokens',  label: 'Tokens',    icon: Ticket },
  { to: '/patient/profile', label: 'Profile',   icon: User },
];

export default function PatientLayout({ children, notifications = 0 }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (t) =>
    t.exact ? pathname === t.to : pathname.startsWith(t.to);

  return (
    <div className="min-h-full bg-white pq-has-bottom-nav">
      {/* ============ Top app bar ============ */}
      <header className="pq-appbar">
        <div className="pq-container">
          <div className="pq-appbar-inner">
            <Link to="/patient" className="pq-brand">
              <span className="pq-brand-mark">H</span>
              <span className="pq-brand-text">ospital<span>Queue</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((t) => {
                const active = isActive(t);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                      ${active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: notification bell on mobile (logout moved to Profile page) */}
            <button
              className="pq-icon-btn md:hidden"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* On desktop keep the logout as text link */}
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="hidden md:inline-flex text-sm text-slate-500 hover:text-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* ============ Main content ============ */}
      <main className="pq-container py-5 sm:py-6">
        {children}
      </main>

      {/* ============ Bottom tab bar (mobile only) ============ */}
      <nav className="pq-tabbar md:hidden">
        <div className="pq-tabbar-inner">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`pq-tab ${active ? 'pq-tab-active' : ''}`}
              >
                <span className="pq-tab-icon">
                  <Icon className="w-5 h-5" />
                </span>
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}