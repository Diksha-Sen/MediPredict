import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, FileText, Heart } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { predictionApi, appointmentApi } from '../../services/api.js'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const [preds,  setPreds]  = useState([])
  const [appts,  setAppts]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([predictionApi.list(), appointmentApi.list()]).then(([p, a]) => {
      if (p.data) setPreds(p.data)
      if (a.data) setAppts(a.data)
      setLoading(false)
    })
  }, [])

  const pending = appts.filter(a => a.status === 'PENDING').length

  const cards = [
    { label: 'Symptom Checker', desc: 'AI-powered disease prediction', icon: <Search size={32} className="text-brand-600 mb-3"/>, path: '/patient/symptom-checker' },
    { label: 'Find Doctors',    desc: 'Browse verified doctors & book', icon: <Users size={32} className="mb-3" style={{color:'#64748b'}}/>, path: '/patient/doctors' },
    { label: 'Prediction History', desc: 'View past AI predictions', icon: <FileText size={32} className="text-accent-amber mb-3"/>, path: '/patient/history' },
    { label: 'Health Profile',  desc: 'Manage medical history & allergies', icon: <Heart size={32} className="text-accent-red mb-3"/>, path: '/patient/health-profile' },
  ]

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT" />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-6 animate-fade-in text-slate-900">
          Hello, {currentUser?.name} 👋
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { val: loading ? '…' : preds.length,  label: 'Predictions',   color: '#2563eb' },
            { val: loading ? '…' : appts.length,  label: 'Appointments',  color: '#059669' },
            { val: loading ? '…' : pending,        label: 'Pending',       color: '#d97706' },
          ].map((s, i) => (
            <div key={s.label} className="p-5 rounded-xl bg-white animate-fade-in" style={{ animationDelay: `${(i+1)*0.05}s` }}>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-sm mt-1 text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <button key={c.label} onClick={() => navigate(c.path)}
              className="p-6 rounded-xl text-left card-hover animate-fade-in bg-white"
              style={{ animationDelay: `${(i+2)*0.05}s` }}>
              {c.icon}
              <h3 className="font-bold text-lg mb-1 text-slate-900">{c.label}</h3>
              <p className="text-sm text-slate-400">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
