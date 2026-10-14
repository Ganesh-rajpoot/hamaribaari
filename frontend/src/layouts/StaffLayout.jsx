// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const linksForRole = (role) => {
//   if (role === 'RECEPTIONIST') {
//     return [
//       { to: '/receptionist', label: 'Today' },
//     ];
//   }
//   if (role === 'HOSPITAL_ADMIN') {
//     return [
//       { to: '/admin', label: 'Overview' },
//       { to: '/admin/departments', label: 'Departments' },
//       { to: '/admin/doctors', label: 'Doctors' },
//       { to: '/admin/staff', label: 'Staff' },
//       { to: '/admin/sessions', label: 'Sessions' },
//       { to: '/receptionist', label: 'Today (queue)' },
//     ];
//   }
//   if (role === 'DOCTOR') {
//   return [
//     { to: '/doctor', label: 'Today' },
//     { to: '/doctor/queue', label: 'My queue' },
//   ];
// }
//   return [];

// };

// export default function StaffLayout({ children }) {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const { pathname } = useLocation();
//   const links = linksForRole(user?.role);

//   return (
//     <div className="min-h-full bg-slate-50">
//       <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
//         <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
//           <Link to="/" className="font-semibold text-brand-600">HamariBaari</Link>
//           <div className="flex items-center gap-3">
//             <span className="hidden sm:inline text-slate-500 text-sm">{user?.fullName}</span>
//             <button onClick={() => { logout(); nav('/'); }}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm">
//               Logout
//             </button>
//           </div>
//         </div>
//         <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
//           {links.map((l) => {
//             const active = pathname === l.to || pathname.startsWith(l.to + '/');
//             return (
//               <Link key={l.to} to={l.to}
//                 className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-lg
//                   ${active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
//                 {l.label}
//               </Link>
//             );
//           })}
//         </nav>
//       </header>
//       <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
//     </div>
//   );
// }



// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { Menu, X, LogOut } from 'lucide-react';
// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// const linksForRole = (role) => {
//   if (role === 'RECEPTIONIST') {
//     return [{ to: '/receptionist', label: 'Today' }];
//   }
//   if (role === 'HOSPITAL_ADMIN') {
//     return [
//       { to: '/admin',              label: 'Overview' },
//       { to: '/admin/departments',  label: 'Departments' },
//       { to: '/admin/doctors',      label: 'Doctors' },
//       { to: '/admin/staff',        label: 'Staff' },
//       { to: '/admin/sessions',     label: 'Sessions' },
//       { to: '/receptionist',       label: 'Today (queue)' },
//     ];
//   }
//   if (role === 'DOCTOR') {
//     return [
//       { to: '/doctor',       label: 'Today' },
//       { to: '/doctor/queue', label: 'My queue' },
//     ];
//   }
//   if (role === 'SUPER_ADMIN') {
//     return [
//       { to: '/operator',           label: 'Overview' },
//       { to: '/operator/hospitals', label: 'Hospitals' },
//     ];
//   }
//   return [];
// };

// export default function StaffLayout({ children }) {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const { pathname } = useLocation();
//   const [drawer, setDrawer] = useState(false);
//   const links = linksForRole(user?.role);

//   const isActive = (t) =>
//     pathname === t.to || pathname.startsWith(t.to + '/');

//   return (
//     <div className="min-h-full bg-slate-50">
//       {/* ---------- Header ---------- */}
//       <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
//         <div className="mx-auto max-w-6xl px-4">
//           <div className="h-14 flex items-center justify-between gap-3">
//             {/* Left: brand + mobile menu button */}
//             <div className="flex items-center gap-2 min-w-0">
//               <button
//                 onClick={() => setDrawer(true)}
//                 className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
//                 aria-label="Open menu"
//               >
//                 <Menu className="w-5 h-5" />
//               </button>
//               <Link to="/" className="font-semibold text-brand-600 truncate">
//                 HamariBaari
//               </Link>
//             </div>

//             {/* Right: user + logout */}
//             <div className="flex items-center gap-3">
//               <span className="hidden sm:inline text-slate-500 text-sm truncate max-w-[140px]">
//                 {user?.fullName}
//               </span>
//               <button
//                 onClick={() => { logout(); nav('/'); }}
//                 className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200
//                            text-slate-700 text-sm hover:bg-slate-50"
//               >
//                 <LogOut className="w-4 h-4" />
//                 <span className="hidden sm:inline">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Desktop nav — hidden on mobile */}
//         <nav className="hidden md:block border-t border-slate-100">
//           <div className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto no-scrollbar">
//             {links.map((l) => {
//               const active = isActive(l);
//               return (
//                 <Link
//                   key={l.to}
//                   to={l.to}
//                   className={`whitespace-nowrap text-sm px-3 py-2 border-b-2 transition
//                     ${active
//                       ? 'border-brand-600 text-brand-700 font-medium'
//                       : 'border-transparent text-slate-600 hover:text-slate-900'}`}
//                 >
//                   {l.label}
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>
//       </header>

//       {/* ---------- Mobile drawer ---------- */}
//       {drawer && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 md:hidden"
//           onClick={() => setDrawer(false)}
//         >
//           <aside
//             className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
//               <span className="font-semibold text-brand-600">Menu</span>
//               <button
//                 onClick={() => setDrawer(false)}
//                 className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
//                 aria-label="Close menu"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <nav className="p-3 space-y-1">
//               {links.map((l) => {
//                 const active = isActive(l);
//                 return (
//                   <Link
//                     key={l.to}
//                     to={l.to}
//                     onClick={() => setDrawer(false)}
//                     className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition
//                       ${active
//                         ? 'bg-brand-50 text-brand-700'
//                         : 'text-slate-700 hover:bg-slate-100'}`}
//                   >
//                     {l.label}
//                   </Link>
//                 );
//               })}
//             </nav>
//             <div className="absolute bottom-0 inset-x-0 p-3 border-t border-slate-100">
//               <button
//                 onClick={() => { logout(); nav('/'); }}
//                 className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5
//                            rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
//               >
//                 <LogOut className="w-4 h-4" /> Logout
//               </button>
//             </div>
//           </aside>
//         </div>
//       )}

//       {/* ---------- Content ---------- */}
//       <main className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
//         {children}
//       </main>
//     </div>
//   );
// }


import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const linksForRole = (role) => {
  if (role === 'RECEPTIONIST')
    return [{ to: '/receptionist', label: 'Today' }];
  if (role === 'HOSPITAL_ADMIN')
    return [
      { to: '/admin',             label: 'Overview' },
      { to: '/admin/departments', label: 'Departments' },
      { to: '/admin/doctors',     label: 'Doctors' },
      { to: '/admin/staff',       label: 'Staff' },
      { to: '/admin/sessions',    label: 'Sessions' },
      { to: '/receptionist',      label: 'Today (queue)' },
    ];
  if (role === 'DOCTOR')
    return [
      { to: '/doctor',       label: 'Today' },
      { to: '/doctor/queue', label: 'My queue' },
    ];
  if (role === 'SUPER_ADMIN')
    return [
      { to: '/operator',           label: 'Overview' },
      { to: '/operator/hospitals', label: 'Hospitals' },
    ];
  return [];
};

export default function StaffLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const links = linksForRole(user?.role);

  const isActive = (t) =>
    pathname === t.to || pathname.startsWith(t.to + '/');

  const initials = (user?.fullName || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-full bg-slate-50">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-14 flex items-center justify-between gap-2">
            {/* Left: hamburger (mobile) / brand */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setDrawer(true)}
                className="pq-icon-btn md:hidden -ml-2"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="pq-brand truncate">
                <span className="pq-brand-mark">H</span>
                <span className="pq-brand-text hidden xs:inline">
                  ospital<span>Queue</span>
                </span>
              </Link>
            </div>

            {/* Right: user chip */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-slate-800 truncate max-w-[160px]">
                  {user?.fullName}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white
                           text-xs font-bold flex items-center justify-center flex-shrink-0"
                title={user?.fullName}
              >
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto no-scrollbar">
            {links.map((l) => {
              const active = isActive(l);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`whitespace-nowrap text-sm px-3 py-2 border-b-2 transition
                    ${active
                      ? 'border-brand-600 text-brand-700 font-medium'
                      : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ---------- Mobile drawer ---------- */}
      {drawer && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setDrawer(false)}
        >
          <aside
            className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl
                       flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100
                            pt-[env(safe-area-inset-top)]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500
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

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {links.map((l) => {
                const active = isActive(l);
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

            {/* Drawer footer */}
            <div className="p-3 border-t border-slate-100 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => { logout(); nav('/'); }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5
                           rounded-xl bg-rose-50 text-rose-700 text-sm font-medium
                           hover:bg-rose-100"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------- Content ---------- */}
      <main className="mx-auto max-w-6xl px-4 py-5 sm:py-6">{children}</main>
    </div>
  );
}