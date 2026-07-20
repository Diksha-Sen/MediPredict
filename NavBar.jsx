import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { Activity, LayoutDashboard, Search, Calendar, Heart, Brain, Clock, LogOut, User, CalendarClock } from 'lucide-react'

export default function NavBar({ role }) {
  const navigate = useNavigate()
  const { logout } = useApp()
  const isDoctor = role === 'DOCTOR'

  const btn = (label, icon, path) => (
    <button key={label} onClick={() => navigate(path)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium text-sm text-slate-700 transition">
      {icon}{label}
    </button>
  )

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Activity size={18} className="text-white"/>
        </div>
        <span className="font-display font-bold text-slate-900">
          MediPredict{isDoctor ? ' · Doctor' : ''}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {!isDoctor && [
          btn('Home',         <LayoutDashboard size={14}/>, '/patient/dashboard'),
          btn('Check',        <Search size={14}/>,          '/patient/symptom-checker'),
          btn('Doctors',      <User size={14}/>,            '/patient/doctors'),
          btn('Appointments', <Calendar size={14}/>,        '/patient/appointments'),
          btn('Profile',      <Heart size={14}/>,           '/patient/health-profile'),
        ]}
        {isDoctor && [
          btn('Home',         <LayoutDashboard size={14}/>, '/doctor/dashboard'),
          btn('Predictions',  <Brain size={14}/>,           '/doctor/predictions'),
          btn('Appointments', <Calendar size={14}/>,        '/doctor/appointments'),
          btn('Schedule',     <Clock size={14}/>,           '/doctor/schedule'),
          btn('Availability', <CalendarClock size={14}/>,   '/doctor/availability'),
          btn('Profile',      <User size={14}/>,            '/doctor/profile'),
        ]}
        <button onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-500 transition">
          <LogOut size={14}/>
        </button>
      </div>
    </nav>
  )
}
