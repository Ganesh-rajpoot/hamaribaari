import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Hospitals from './pages/public/Hospitals';
import HospitalDetail from './pages/public/HospitalDetail';
import DepartmentDoctors from './pages/public/DepartmentDoctors';
import DoctorSessions from './pages/public/DoctorSessions';
import PatientDashboard from './pages/patient/Dashboard';
import ReceptionistToday from './pages/receptionist/Today';
import ReceptionistSessionDetail from './pages/receptionist/SessionDetail';
import AdminOverview from './pages/admin/Overview';
import AdminHospitalEdit from './pages/admin/HospitalEdit';
import AdminDepartments from './pages/admin/Departments';
import AdminDoctors from './pages/admin/Doctors';
import AdminSchedules from './pages/admin/Schedules';
import AdminStaff from './pages/admin/Staff';
import AdminSessions from './pages/admin/Sessions';
import JoinQueue from './pages/patient/JoinQueue';
import TokenDetail from './pages/patient/TokenDetail';
import OperatorOverview from './pages/operator/Overview';
import OperatorHospitals from './pages/operator/Hospitals';
import OperatorHospitalDetail from './pages/operator/HospitalDetail';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorQueue from './pages/doctor/Queue';
import PatientTokens from './pages/patient/Tokens';
import PageTransition from './components/PageTransition';
import  InstallPWA from './components/InstallPWA';



const roleHome = (role) => (
  role === 'SUPER_ADMIN'    ? '/operator'     :
  role === 'PATIENT'        ? '/patient'      :
  role === 'RECEPTIONIST'   ? '/receptionist' :
  role === 'DOCTOR'         ? '/doctor'       :
  role === 'HOSPITAL_ADMIN' ? '/admin'        : '/'
);

function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-brand-600">HamariBaari</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="text-slate-600 hidden sm:inline" to="/hospitals">Hospitals</Link>
          {!user && (<>
            <Link className="text-slate-600" to="/login">Login</Link>
            <Link className="px-3 py-1.5 rounded-lg bg-brand-600 text-white" to="/register">Register</Link>
          </>)}
          {user && (<>
            <Link to={roleHome(user.role)} className="text-slate-600 hidden sm:inline">Dashboard</Link>
            <span className="hidden md:inline text-slate-500">{user.fullName}</span>
            <button onClick={() => { logout(); nav('/'); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              Logout
            </button>
          </>)}
        </nav>
      </div>
    </header>
  );
}

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

          {/* Receptionist */}
          <Route path="/receptionist" element={
            <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistToday /></ProtectedRoute>
          } />
          <Route path="/receptionist/sessions/:id" element={
            <ProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN']}><ReceptionistSessionDetail /></ProtectedRoute>
          } />

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
            <Route path="/patient/tokens" element={
            <ProtectedRoute roles={['PATIENT']}><PatientTokens /></ProtectedRoute>
            } />
          <Route path="/patient/join/:sessionId" element={
            <ProtectedRoute roles={['PATIENT']}><JoinQueue /></ProtectedRoute>
            } />
            <Route path="/patient/tokens/:id" element={
            <ProtectedRoute roles={['PATIENT']}><TokenDetail /></ProtectedRoute>
            } />

          {/* Fallbacks */}
          <Route path="/dashboard" element={
            user ? <Navigate to={roleHome(user.role)} replace /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
      </main>
      <footer className="py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} HamariBaari — MVP
      </footer>
    </div>
  );
}