import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'

const ROLES = [
  { label:'Continue as Patient', desc:'Check symptoms, get AI predictions & book appointments',
    icon:'👤', bg:'#2563eb', hover:'hover:border-blue-300',   path:'/patient/login', delay:'0.1s' },
  { label:'Continue as Doctor',  desc:'Verify predictions, manage appointments & patients',
    icon:'🩺', bg:'#059669', hover:'hover:border-green-300',  path:'/doctor/login',  delay:'0.2s' },
  { label:'Admin Panel',         desc:'Verify doctors, manage users & oversee the platform',
    icon:'🛡️', bg:'#7c3aed', hover:'hover:border-purple-300', path:'/admin/login',   delay:'0.3s' },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-10" style={{ background:'#f8fafc' }}>
      <div className="animate-fade-in text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center">
            <Activity size={28} className="text-white"/>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900">MediPredict</h1>
        </div>
        <p className="text-lg text-slate-500">AI-powered health prediction platform</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-3xl">
        {ROLES.map(r => (
          <button key={r.label} onClick={() => navigate(r.path)}
            className={`animate-fade-in flex-1 p-8 rounded-2xl card-hover cursor-pointer border-2 border-transparent ${r.hover} text-left bg-white`}
            style={{ animationDelay: r.delay }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background:r.bg }}>
              <span className="text-2xl">{r.icon}</span>
            </div>
            <h2 className="text-lg font-bold mb-2 text-slate-900">{r.label}</h2>
            <p className="text-sm text-slate-500">{r.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
