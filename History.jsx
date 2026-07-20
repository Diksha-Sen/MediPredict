import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar.jsx'
import { predictionApi } from '../../services/api.js'

const STATUS_COLOR = {
  HIGH_CONFIDENCE:'#059669', MODERATE_CONFIDENCE:'#d97706', LOW_CONFIDENCE:'#dc2626',
  NEEDS_DOCTOR_VERIFICATION:'#d97706', VERIFIED:'#059669', REJECTED:'#dc2626',
}

export default function PatientHistory() {
  const navigate = useNavigate()
  const [preds,   setPreds]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    predictionApi.list().then(({ data }) => {
      if (data) setPreds(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Prediction History</h2>

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {!loading && preds.length === 0 && (
          <div className="text-center py-16 text-slate-400">No predictions yet. Use the Symptom Checker.</div>
        )}

        <div className="space-y-3">
          {preds.map((p, i) => {
            const color   = STATUS_COLOR[p.status] || '#64748b'
            const confPct = Math.round((p.confidence || 0) * 100)
            const symptoms = Array.isArray(p.symptoms) ? p.symptoms.join(', ') : p.symptoms

            return (
              <div key={p.id} className="p-5 rounded-xl bg-white shadow-sm animate-slide-in"
                style={{ animationDelay:`${i*0.05}s` }}>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.final_prediction}</h3>
                    <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="tag" style={{ background:color+'22', color }}>{confPct}%</span>
                </div>

                <p className="text-xs text-slate-400 mb-2">Symptoms: {symptoms}</p>

                <div className="confidence-bar mb-3" style={{ background:color+'22' }}>
                  <div className="confidence-fill" style={{ background:color, width:`${confPct}%` }}/>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="tag text-xs" style={{ background:color+'22', color }}>
                    {p.status.replace(/_/g,' ')}
                  </span>
                  {p.suggest_appointment && (
                    <span className="tag text-xs" style={{ background:'#2563eb22', color:'#2563eb' }}>
                      📅 Appointment recommended
                    </span>
                  )}
                </div>

                {/* Doctor message */}
                {p.doctor_message && (
                  <div className="mt-2 p-3 rounded-lg text-xs italic text-slate-600"
                    style={{ background:'#2563eb08', border:'1px solid #2563eb20' }}>
                    Doctor: "{p.doctor_message}"
                  </div>
                )}

                {/* Book appointment button */}
                {p.suggest_appointment && (
                  <button
                    onClick={() => navigate('/patient/doctors')}
                    className="mt-3 px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition"
                    style={{ background:'#2563eb' }}>
                    📅 Book Appointment Now
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
