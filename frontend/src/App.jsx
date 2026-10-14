// import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Landing from './pages/public/Landing';
// import Login from './pages/public/Login';
// import Register from './pages/public/Register';
// import Hospitals from './pages/public/Hospitals';
// import HospitalDetail from './pages/public/HospitalDetail';
// import DepartmentDoctors from './pages/public/DepartmentDoctors';
// import DoctorSessions from './pages/public/DoctorSessions';
// import PatientDashboard from './pages/patient/Dashboard';
// import ReceptionistToday from './pages/receptionist/Today';
// import ReceptionistSessionDetail from './pages/receptionist/SessionDetail';
// import AdminOverview from './pages/admin/Overview';
// import AdminHospitalEdit from './pages/admin/HospitalEdit';
// import AdminDepartments from './pages/admin/Departments';
// import AdminDoctors from './pages/admin/Doctors';
// import AdminSchedules from './pages/admin/Schedules';
// import AdminStaff from './pages/admin/Staff';
// import AdminSessions from './pages/admin/Sessions';
// import JoinQueue from './pages/patient/JoinQueue';
// import TokenDetail from './pages/patient/TokenDetail';
// import OperatorOverview from './pages/operator/Overview';
// import OperatorHospitals from './pages/operator/Hospitals';
// import OperatorHospitalDetail from './pages/operator/HospitalDetail';

// import DoctorDashboard from './pages/doctor/Dashboard';
// import DoctorQueue from './pages/doctor/Queue';
// import PatientTokens from './pages/patient/Tokens';
// import PageTransition from './components/PageTransition';
// import  InstallPWA from './components/InstallPWA';



// const roleHome = (role) => (
//   role === 'SUPER_ADMIN'    ? '/operator'     :
//   role === 'PATIENT'        ? '/patient'      :
//   role === 'RECEPTIONIST'   ? '/receptionist' :
//   role === 'DOCTOR'         ? '/doctor'       :
//   role === 'HOSPITAL_ADMIN' ? '/admin'        : '/'
// );

// function TopBar() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   return (
//     <header className="sticky top-0 z-20 bg-white border-b border-slate-100">
//       <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
//         <Link to="/" className="font-semibold text-brand-600">HamariBaari</Link>
//         <nav className="flex items-center gap-3 text-sm">
//           <Link className="text-slate-600 hidden sm:inline" to="/hospitals">Hospitals</Link>
//           {!user && (<>
//             <Link className="text-slate-600" to="/login">Login</Link>
//             <Link className="px-3 py-1.5 rounded-lg bg-brand-600 text-white" to="/register">Register</Link>
//           </>)}
//           {user && (<>
//             <Link to={roleHome(user.role)} className="text-slate-600 hidden sm:inline">Dashboard</Link>
//             <span className="hidden md:inline text-slate-500">{user.fullName}</span>
//             <button onClick={() => { logout(); nav('/'); }}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
//               Logout
//             </button>
//           </>)}
//         </nav>
//       </div>
//     </header>
//   );
// }

// export default function App() {
//   const { user } = useAuth();
//   return (
//     <div className="min-h-full flex flex-col">
//       <TopBar />
//       <InstallPWA />
//       <main className="flex-1">
//         <PageTransition>
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/hospitals" element={<Hospitals />} />
//           <Route path="/hospitals/:id" element={<HospitalDetail />} />
//           <Route path="/hospitals/:id/departments/:deptId" element={<DepartmentDoctors />} />
//           <Route path="/doctors/:id/sessions" element={<DoctorSessions />} />
//           <Route path="/operator" element={
//             <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorOverview /></ProtectedRoute>
//             } />
//             <Route path="/operator/hospitals" element={
//             <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorHospitals /></ProtectedRoute>
//             } />
//             <Route path="/operator/hospitals/:id" element={
//             <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorHospitalDetail /></ProtectedRoute>
//             } />
//           {/* Patient */}
//           <Route path="/patient" element={
//             <ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
//           } />

//           {/* Receptionist */}
//           <Route path="/receptionist" element={
//             <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistToday /></ProtectedRoute>
//           } />
//           <Route path="/receptionist/sessions/:id" element={
//             <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistSessionDetail /></ProtectedRoute>
//           } />

//           <Route path="/doctor" element={
//             <ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
//             } />
//             <Route path="/doctor/queue" element={
//             <ProtectedRoute roles={['DOCTOR']}><DoctorQueue /></ProtectedRoute>
//             } />

//           {/* Admin */}
//           <Route path="/admin" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminOverview /></ProtectedRoute>
//           } />
//           <Route path="/admin/hospital" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminHospitalEdit /></ProtectedRoute>
//           } />
//           <Route path="/admin/departments" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminDepartments /></ProtectedRoute>
//           } />
//           <Route path="/admin/doctors" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminDoctors /></ProtectedRoute>
//           } />
//           <Route path="/admin/doctors/:id/schedules" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminSchedules /></ProtectedRoute>
//           } />
//           <Route path="/admin/staff" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminStaff /></ProtectedRoute>
//           } />
//           <Route path="/admin/sessions" element={
//             <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminSessions /></ProtectedRoute>
//           } />
//             <Route path="/patient/tokens" element={
//             <ProtectedRoute roles={['PATIENT']}><PatientTokens /></ProtectedRoute>
//             } />
//           <Route path="/patient/join/:sessionId" element={
//             <ProtectedRoute roles={['PATIENT']}><JoinQueue /></ProtectedRoute>
//             } />
//             <Route path="/patient/tokens/:id" element={
//             <ProtectedRoute roles={['PATIENT']}><TokenDetail /></ProtectedRoute>
//             } />

//           {/* Fallbacks */}
//           <Route path="/dashboard" element={
//             user ? <Navigate to={roleHome(user.role)} replace /> : <Navigate to="/login" replace />
//           } />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//         </PageTransition>
//       </main>
//       <footer className="py-6 text-center text-xs text-slate-400">
//         © {new Date().getFullYear()} HamariBaari — MVP
//       </footer>
//     </div>
//   );
// }



import { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, LayoutDashboard, LogIn, UserPlus, Home,
  ShieldCheck, FileText, Stethoscope, MapPin,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import InstallPWA from './components/InstallPWA';
import Footer from './components/Footer';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Hospitals from './pages/public/Hospitals';
import HospitalDetail from './pages/public/HospitalDetail';
import DepartmentDoctors from './pages/public/DepartmentDoctors';
import DoctorSessions from './pages/public/DoctorSessions';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

import PatientDashboard from './pages/patient/Dashboard';
import PatientTokens from './pages/patient/Tokens';
import JoinQueue from './pages/patient/JoinQueue';
import TokenDetail from './pages/patient/TokenDetail';

import ReceptionistToday from './pages/receptionist/Today';
import ReceptionistSessionDetail from './pages/receptionist/SessionDetail';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorQueue from './pages/doctor/Queue';

import AdminOverview from './pages/admin/Overview';
import AdminHospitalEdit from './pages/admin/HospitalEdit';
import AdminDepartments from './pages/admin/Departments';
import AdminDoctors from './pages/admin/Doctors';
import AdminSchedules from './pages/admin/Schedules';
import AdminStaff from './pages/admin/Staff';
import AdminSessions from './pages/admin/Sessions';

import OperatorOverview from './pages/operator/Overview';
import OperatorHospitals from './pages/operator/Hospitals';
import OperatorHospitalDetail from './pages/operator/HospitalDetail';

const roleHome = (role) => (
  role === 'SUPER_ADMIN'    ? '/operator'     :
  role === 'PATIENT'        ? '/patient'      :
  role === 'RECEPTIONIST'   ? '/receptionist' :
  role === 'DOCTOR'         ? '/doctor'       :
  role === 'HOSPITAL_ADMIN' ? '/admin'        : '/'
);

/* ====================================================================
   TopBar — desktop links + mobile hamburger drawer
   ==================================================================== */
function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const go = (to) => {
    close();
    nav(to);
  };

  const handleLogout = () => {
    close();
    logout();
    nav('/');
  };

  return (
    <>
      {/* ============ Sticky top bar ============ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 pq-safe-header">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-14 flex items-center justify-between gap-3">
            {/* Brand */}
            <Link
              to="/"
              onClick={close}
              className="flex items-center gap-2 min-w-0"
            >
              <img src="/logo.svg" alt="" className="w-8 h-8 rounded-xl" />
              <span className="font-bold tracking-tight text-slate-900 truncate">
                Hamari<span className="text-brand-600">Baari</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/hospitals'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                to="/hospitals"
              >
                Hospitals
              </Link>

              {!user && (
                <>
                  <Link
                    className={`px-3 py-1.5 rounded-lg transition ${
                      pathname === '/login'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    to="/login"
                  >
                    Login
                  </Link>
                  <Link
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                    to="/register"
                  >
                    Register
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                    to={roleHome(user.role)}
                  >
                    Dashboard
                  </Link>
                  <span className="text-slate-500 px-2 truncate max-w-[140px]">
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="pq-icon-btn md:hidden -mr-2"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============ Mobile drawer ============ */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={close}
        >
          <aside
            className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col
                       animate-[pqDrawerIn_220ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="pq-safe-header">
              <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
                <span className="font-semibold text-slate-800">
                  {user ? `Hi, ${(user.fullName || '').split(' ')[0]}` : 'Menu'}
                </span>
                <button
                  onClick={close}
                  className="pq-icon-btn"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <DrawerLink to="/" icon={Home} onClick={close} active={pathname === '/'}>
                Home
              </DrawerLink>

              <DrawerLink
                to="/hospitals"
                icon={MapPin}
                onClick={close}
                active={pathname.startsWith('/hospitals')}
              >
                Hospitals
              </DrawerLink>

              {user && (
                <DrawerLink
                  to={roleHome(user.role)}
                  icon={LayoutDashboard}
                  onClick={close}
                  active={pathname.startsWith(roleHome(user.role))}
                >
                  Dashboard
                </DrawerLink>
              )}

              <div className="my-2 border-t border-slate-100" />

              <DrawerLink
                to="/privacy"
                icon={ShieldCheck}
                onClick={close}
                active={pathname === '/privacy'}
              >
                Privacy Policy
              </DrawerLink>

              <DrawerLink
                to="/terms"
                icon={FileText}
                onClick={close}
                active={pathname === '/terms'}
              >
                Terms of Use
              </DrawerLink>
            </nav>

            {/* Drawer footer — auth actions */}
            <div className="p-3 border-t border-slate-100 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {!user && (
                <div className="space-y-2">
                  <button
                    onClick={() => go('/login')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                               border border-slate-200 text-slate-700 py-2.5 text-sm font-medium
                               hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </button>
                  <button
                    onClick={() => go('/register')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                               bg-brand-600 text-white py-2.5 text-sm font-medium
                               hover:bg-brand-700"
                  >
                    <UserPlus className="w-4 h-4" /> Create account
                  </button>
                </div>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                             bg-rose-50 text-rose-700 py-2.5 text-sm font-medium hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function DrawerLink({ to, icon: Icon, children, onClick, active }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
        ${active
          ? 'bg-brand-50 text-brand-700'
          : 'text-slate-700 hover:bg-slate-100'}`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  );
}

/* ====================================================================
   Footer — brand, quick links, legal, responsive
   ==================================================================== */
// function Footer() {
//   return (
//     <footer className="mt-10 border-t border-slate-100 bg-slate-50">
//       <div className="mx-auto max-w-6xl px-4 py-10">
//         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
//           {/* Brand */}
//           <div className="sm:col-span-2 lg:col-span-1">
//             <Link to="/" className="flex items-center gap-2">
//               <img src="/logo.svg" alt="" className="w-8 h-8 rounded-xl" />
//               <span className="font-bold text-slate-900">
//                 Hamari<span className="text-brand-600">Baari</span>
//               </span>
//             </Link>
//             <p className="mt-3 text-sm text-slate-600 max-w-xs">
//               Join the queue from home. Reach closer to your turn.
//             </p>
//           </div>

//           {/* Product */}
//           <div>
//             <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
//               Product
//             </h4>
//             <ul className="mt-3 space-y-2 text-sm">
//               <FooterLink to="/hospitals">Find a hospital</FooterLink>
//               <FooterLink to="/register">Create account</FooterLink>
//               <FooterLink to="/login">Sign in</FooterLink>
//             </ul>
//           </div>

//           {/* For hospitals */}
//           <div>
//             <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
//               For hospitals
//             </h4>
//             <ul className="mt-3 space-y-2 text-sm">
//               <li className="text-slate-600 flex items-center gap-2">
//                 <Stethoscope className="w-4 h-4 text-slate-400" />
//                 OPD queue management
//               </li>
//               <li className="text-slate-600 flex items-center gap-2">
//                 <MapPin className="w-4 h-4 text-slate-400" />
//                 Reception + doctors console
//               </li>
//               <li className="text-slate-500 text-xs mt-3">
//                 Contact sales for onboarding.
//               </li>
//             </ul>
//           </div>

//           {/* Legal */}
//           <div>
//             <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
//               Legal
//             </h4>
//             <ul className="mt-3 space-y-2 text-sm">
//               <FooterLink to="/privacy">Privacy Policy</FooterLink>
//               <FooterLink to="/terms">Terms of Use</FooterLink>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom strip */}
//         <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row
//                         items-center justify-between gap-3 text-xs text-slate-500">
//           <div>
//             © {new Date().getFullYear()} HamariBaari. All rights reserved.
//           </div>
//           <div className="flex items-center gap-4">
//             <Link to="/privacy" className="hover:text-slate-800">Privacy</Link>
//             <Link to="/terms" className="hover:text-slate-800">Terms</Link>
//           </div>
//         </div>

//         <p className="mt-4 text-[11px] text-slate-400 text-center sm:text-left">
//           HamariBaari is a queue management tool. It does not provide medical advice,
//           diagnosis, prescriptions, or process payments.
//         </p>
//       </div>
//     </footer>
//   );
// }

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-slate-600 hover:text-slate-900 transition">
        {children}
      </Link>
    </li>
  );
}

/* ====================================================================
   App — routes only
   ==================================================================== */
export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-full flex flex-col">
      <TopBar />
      <InstallPWA />
      <main className="flex-1">
        <PageTransition>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/hospitals/:id" element={<HospitalDetail />} />
            <Route path="/hospitals/:id/departments/:deptId" element={<DepartmentDoctors />} />
            <Route path="/doctors/:id/sessions" element={<DoctorSessions />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Operator */}
            <Route path="/operator" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorOverview /></ProtectedRoute>
            } />
            <Route path="/operator/hospitals" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorHospitals /></ProtectedRoute>
            } />
            <Route path="/operator/hospitals/:id" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}><OperatorHospitalDetail /></ProtectedRoute>
            } />

            {/* Patient */}
            <Route path="/patient" element={
              <ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
            } />
            <Route path="/patient/tokens" element={
              <ProtectedRoute roles={['PATIENT']}><PatientTokens /></ProtectedRoute>
            } />
            <Route path="/patient/tokens/:id" element={
              <ProtectedRoute roles={['PATIENT']}><TokenDetail /></ProtectedRoute>
            } />
            <Route path="/patient/join/:sessionId" element={
              <ProtectedRoute roles={['PATIENT']}><JoinQueue /></ProtectedRoute>
            } />

            {/* Receptionist */}
            <Route path="/receptionist" element={
              <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistToday /></ProtectedRoute>
            } />
            <Route path="/receptionist/sessions/:id" element={
              <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistSessionDetail /></ProtectedRoute>
            } />

            {/* Doctor */}
            <Route path="/doctor" element={
              <ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
            } />
            <Route path="/doctor/queue" element={
              <ProtectedRoute roles={['DOCTOR']}><DoctorQueue /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminOverview /></ProtectedRoute>
            } />
            <Route path="/admin/hospital" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminHospitalEdit /></ProtectedRoute>
            } />
            <Route path="/admin/departments" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminDepartments /></ProtectedRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminDoctors /></ProtectedRoute>
            } />
            <Route path="/admin/doctors/:id/schedules" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminSchedules /></ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminStaff /></ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedRoute roles={['HOSPITAL_ADMIN']}><AdminSessions /></ProtectedRoute>
            } />

            {/* Fallbacks */}
            <Route path="/dashboard" element={
              user ? <Navigate to={roleHome(user.role)} replace /> : <Navigate to="/login" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}