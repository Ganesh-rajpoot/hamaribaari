import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, Ticket, User, Stethoscope, Building2,
  Users, MoreHorizontal, CalendarDays, Plus, LayoutDashboard,
  LogOut, X, Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ---------------- Tab config per role ---------------- */

const patientTabs = [
  { to: '/patient',         label: 'Home',      icon: Home,      exact: true },
  { to: '/hospitals',       label: 'Hospitals', icon: Search },
  { to: '/patient/tokens',  label: 'Tokens',    icon: Ticket },
  { to: '/patient/profile', label: 'Profile',   icon: User },
];

const receptionistTabs = [
  { to: '/receptionist',        label: 'Today',    icon: CalendarDays, exact: true },
  { to: '/receptionist/walk-in',label: 'Walk-in',  icon: Plus },
  { to: '/receptionist/search', label: 'Search',   icon: Search },
  { to: '/profile',             label: 'Profile',  icon: User },
];

const doctorTabs = [
  { to: '/doctor',       label: 'Today',   icon: CalendarDays, exact: true },
  { to: '/doctor/queue', label: 'Queue',   icon: Ticket },
  { to: '/profile',      label: 'Profile', icon: User },
];

const adminTabs = [
  { to: '/admin',           label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/doctors',   label: 'Doctors',  icon: Stethoscope },
  { to: '/admin/staff',     label: 'Staff',    icon: Users },
  { to: '/admin/more',      label: 'More',     icon: MoreHorizontal },
];

const operatorTabs = [
  { to: '/operator',            label: 'Overview',  icon: LayoutDashboard, exact: true },
  { to: '/operator/hospitals',  label: 'Hospitals', icon: Building2 },
  { to: '/profile',             label: 'Profile',   icon: User },
];

const tabsForRole = (role) => {
  if (role === 'PATIENT')        return patientTabs;
  if (role === 'RECEPTIONIST')   return receptionistTabs;
  if (role === 'DOCTOR')         return doctorTabs;
  if (role === 'HOSPITAL_ADMIN') return adminTabs;
  if (role === 'SUPER_ADMIN')    return operatorTabs;
  return [];
};

/* ---------------- Header title per role ---------------- */

const greetForRole = (role) => {
  if (role === 'RECEPTIONIST')   return 'Reception';
  if (role === 'DOCTOR')         return 'Doctor Console';
  if (role === 'HOSPITAL_ADMIN') return 'Admin Console';
  if (role === 'SUPER_ADMIN')    return 'Operator Console';
  return 'HamariBaari';
};

/* ---------------- Component ---------------- */

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);

  const tabs = tabsForRole(user?.role);
  const isActive = (t) =>
    t.exact ? pathname === t.to : pathname.startsWith(t.to);

  const firstName = (user?.fullName || '').split(' ')[0] || 'there';
  const initials = (user?.fullName || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isStaff = user && user.role !== 'PATIENT';

  return (
    <div className="min-h-full bg-slate-50 pq-has-bottom-nav">
      {/* ================= Top app bar ================= */}
      <header className="pq-appbar pq-safe-header">
        <div className="mx-auto max-w-3xl px-4">
          <div className="pq-appbar-inner">
            {/* Left: brand or greeting */}
            <div className="flex items-center gap-2 min-w-0">
              {isStaff ? (
                <>
                  <button
                    onClick={() => setDrawer(true)}
                    className="pq-icon-btn -ml-2"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      {greetForRole(user?.role)}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {user?.fullName}
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/patient" className="pq-brand">
                  <img src="/logo.svg" alt="" className="w-8 h-8 rounded-xl" />
                  <span className="pq-brand-text">
                    Sehat<span className="text-brand-600">Token</span>
                  </span>
                </Link>
              )}
            </div>

            {/* Right: avatar for staff, bell for patient */}
            <div className="flex items-center gap-1">
              {isStaff ? (
                <div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-orange-500
                             text-white text-xs font-bold flex items-center justify-center"
                  title={user?.fullName}
                >
                  {initials}
                </div>
              ) : (
                <Link to="/patient/tokens" className="pq-icon-btn" aria-label="My tokens">
                  <Ticket className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= Content ================= */}
      <main className="mx-auto max-w-3xl px-4 py-5 sm:py-6 animate-screen-in">
        {children}
      </main>

      {/* ================= Bottom tab bar ================= */}
      {tabs.length > 0 && (
        <nav className="pq-tabbar">
          <div
            className="pq-tabbar-inner mx-auto max-w-3xl"
            style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
          >
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
      )}

      {/* ================= Staff drawer ================= */}
      {drawer && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setDrawer(false)}
        >
          <aside
            className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pq-safe-header">
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-orange-500
                                  text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate max-w-[150px]">
                      {user?.fullName}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawer(false)}
                  className="pq-icon-btn"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {staffLinks(user?.role).map((l) => {
                const active = pathname === l.to || pathname.startsWith(l.to + '/');
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setDrawer(false)}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition
                      ${active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => { logout(); nav('/'); }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5
                           rounded-xl bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ---------- Full drawer link list for staff ---------- */

function staffLinks(role) {
  if (role === 'RECEPTIONIST') {
    return [
      { to: '/receptionist',         label: 'Today' },
      { to: '/receptionist/walk-in', label: 'Add walk-in' },
      { to: '/receptionist/search',  label: 'Search queue' },
      { to: '/profile',              label: 'Profile' },
    ];
  }
  if (role === 'DOCTOR') {
    return [
      { to: '/doctor',       label: 'Today' },
      { to: '/doctor/queue', label: 'My queue' },
      { to: '/profile',      label: 'Profile' },
    ];
  }
  if (role === 'HOSPITAL_ADMIN') {
    return [
      { to: '/admin',              label: 'Overview' },
      { to: '/admin/hospital',     label: 'Hospital details' },
      { to: '/admin/departments',  label: 'Departments' },
      { to: '/admin/doctors',      label: 'Doctors' },
      { to: '/admin/staff',        label: 'Staff' },
      { to: '/admin/sessions',     label: 'Sessions' },
      { to: '/receptionist',       label: 'Reception view' },
      { to: '/profile',            label: 'Profile' },
    ];
  }
  if (role === 'SUPER_ADMIN') {
    return [
      { to: '/operator',           label: 'Overview' },
      { to: '/operator/hospitals', label: 'Hospitals' },
      { to: '/profile',            label: 'Profile' },
    ];
  }
  return [];
}