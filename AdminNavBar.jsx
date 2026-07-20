import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { ShieldCheck, LayoutDashboard, UserCheck, Users, Brain, Calendar, LogOut } from 'lucide-react'

export default function AdminNavBar() {
  const navigate = useNavigate()
  const { logout } = useApp()

  const btn = (label, icon, path) => (
    <button key={label} onClick={() => navigate(path)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-purple-50 font-medium text-sm text-slate-700 transition">
      {icon}{label}
    </button>
  )

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'#7c3aed' }}>
          <ShieldCheck size={18} className="text-white"/>
        </div>
        <span className="font-display font-bold text-slate-900">MediPredict · Admin</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {btn('Dashboard',     <LayoutDashboard size={14}/>, '/admin/dashboard')}
        {btn('Verify Doctors',<UserCheck size={14}/>,       '/admin/doctors')}
        {btn('Users',         <Users size={14}/>,           '/admin/users')}
        {btn('Predictions',   <Brain size={14}/>,           '/admin/predictions')}
        {btn('Appointments',  <Calendar size={14}/>,        '/admin/appointments')}
        <button onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 font-medium text-sm text-red-500 transition">
          <LogOut size={14}/>
        </button>
      </div>
    </nav>
  )
}
