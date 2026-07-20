import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import ToastContainer from './components/Toast.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Patient
import RoleSelect          from './pages/RoleSelect.jsx'
import PatientLogin        from './pages/patient/Login.jsx'
import PatientSignup       from './pages/patient/Signup.jsx'
import PatientDashboard    from './pages/patient/Dashboard.jsx'
import SymptomChecker      from './pages/patient/SymptomChecker.jsx'
import PredictionResult    from './pages/patient/PredictionResult.jsx'
import DoctorList          from './pages/patient/DoctorList.jsx'
import PatientAppointments from './pages/patient/Appointments.jsx'
import PatientHistory      from './pages/patient/History.jsx'
import HealthProfile       from './pages/patient/HealthProfile.jsx'

// Doctor
import DoctorLogin         from './pages/doctor/Login.jsx'
import DoctorSignup        from './pages/doctor/Signup.jsx'
import DoctorDashboard     from './pages/doctor/Dashboard.jsx'
import DoctorPredictions   from './pages/doctor/Predictions.jsx'
import DoctorAppointments  from './pages/doctor/Appointments.jsx'
import DoctorSchedule      from './pages/doctor/Schedule.jsx'
import DoctorProfile       from './pages/doctor/Profile.jsx'
import DoctorAvailability  from './pages/doctor/Availability.jsx'

// Admin
import AdminLogin          from './pages/admin/Login.jsx'
import AdminDashboard      from './pages/admin/Dashboard.jsx'
import AdminDoctorVerify   from './pages/admin/DoctorVerify.jsx'
import AdminUsers          from './pages/admin/Users.jsx'
import AdminPredictions    from './pages/admin/Predictions.jsx'
import AdminAppointments   from './pages/admin/Appointments.jsx'

function RequireAuth({ children, role }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace/>
  if (role && currentUser.role !== role) return <Navigate to="/" replace/>
  return children
}

const P = (role, el) => <RequireAuth role={role}>{el}</RequireAuth>

export default function App() {
  return (
    <ErrorBoundary>
      <div className="h-full w-full overflow-auto" style={{ background:'#f8fafc' }}>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<RoleSelect/>} />
          <Route path="/patient/login"  element={<PatientLogin/>} />
          <Route path="/patient/signup" element={<PatientSignup/>} />
          <Route path="/doctor/login"   element={<DoctorLogin/>} />
          <Route path="/doctor/signup"  element={<DoctorSignup/>} />
          <Route path="/admin/login"    element={<AdminLogin/>} />

          {/* Patient */}
          <Route path="/patient/dashboard"         element={P('PATIENT',<PatientDashboard/>)} />
          <Route path="/patient/symptom-checker"   element={P('PATIENT',<SymptomChecker/>)} />
          <Route path="/patient/prediction-result" element={P('PATIENT',<PredictionResult/>)} />
          <Route path="/patient/doctors"           element={P('PATIENT',<DoctorList/>)} />
          <Route path="/patient/appointments"      element={P('PATIENT',<PatientAppointments/>)} />
          <Route path="/patient/history"           element={P('PATIENT',<PatientHistory/>)} />
          <Route path="/patient/health-profile"    element={P('PATIENT',<HealthProfile/>)} />

          {/* Doctor */}
          <Route path="/doctor/dashboard"    element={P('DOCTOR',<DoctorDashboard/>)} />
          <Route path="/doctor/predictions"  element={P('DOCTOR',<DoctorPredictions/>)} />
          <Route path="/doctor/appointments" element={P('DOCTOR',<DoctorAppointments/>)} />
          <Route path="/doctor/schedule"     element={P('DOCTOR',<DoctorSchedule/>)} />
          <Route path="/doctor/profile"      element={P('DOCTOR',<DoctorProfile/>)} />
          <Route path="/doctor/availability" element={P('DOCTOR',<DoctorAvailability/>)} />

          {/* Admin */}
          <Route path="/admin/dashboard"    element={P('ADMIN',<AdminDashboard/>)} />
          <Route path="/admin/doctors"      element={P('ADMIN',<AdminDoctorVerify/>)} />
          <Route path="/admin/users"        element={P('ADMIN',<AdminUsers/>)} />
          <Route path="/admin/predictions"  element={P('ADMIN',<AdminPredictions/>)} />
          <Route path="/admin/appointments" element={P('ADMIN',<AdminAppointments/>)} />

          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
        <ToastContainer/>
      </div>
    </ErrorBoundary>
  )
}
