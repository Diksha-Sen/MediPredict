/**
 * PredictionResult — shows ML result + doctor's response.
 * If doctor suggests appointment, shows Book Appointment button.
 */
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar.jsx'
import { useApp } from '../../context/AppContext.jsx'

const PCT = v => Math.round((v || 0) * 100)

const STATUS_META = {
  HIGH_CONFIDENCE: {
    color:'#059669', icon:'✅',
    label:'High Confidence',
    msg:'The AI model is highly confident in this prediction.',
    showDoctor: false,
  },
  MODERATE_CONFIDENCE: {
    color:'#d97706', icon:'⚠️',
    label:'Moderate Confidence',
    msg:'This prediction has been sent to a doctor for review. You will be notified once verified.',
    showDoctor: true,
  },
  LOW_CONFIDENCE: {
    color:'#dc2626', icon:'🔴',
    label:'Low Confidence',
    msg:'This prediction has been sent to a doctor for review. You will be notified once verified.',
    showDoctor: true,
  },
  NEEDS_DOCTOR_VERIFICATION: {
    color:'#d97706', icon:'🔬',
    label:'Sent to Doctor for Review',
    msg:'A doctor is reviewing your prediction. Check back later or wait for their response.',
    showDoctor: true,
  },
  VERIFIED: {
    color:'#059669', icon:'✅',
    label:'Verified by Doctor',
    msg:'A doctor has reviewed and confirmed this prediction.',
    showDoctor: false,
  },
  REJECTED: {
    color:'#dc2626', icon:'❌',
    label:'Rejected by Doctor',
    msg:'A doctor has reviewed and rejected this prediction. Please consult directly.',
    showDoctor: false,
  },
}

function Bar({ pct, color }) {
  return (
    <div className="confidence-bar mt-1.5" style={{ background:color+'22' }}>
      <div className="confidence-fill" style={{ background:color, width:`${pct}%` }}/>
    </div>
  )
}

export default function PredictionResult() {
  const navigate = useNavigate()
  const { predictionResult: r } = useApp()

  if (!r) { navigate('/patient/dashboard'); return null }

  const confPct = PCT(r.confidence)
  const meta    = STATUS_META[r.status] || STATUS_META.NEEDS_DOCTOR_VERIFICATION

  const models = [
    { label:'Random Forest', pred:r.rf_prediction, prob:PCT(r.rf_probability), color:'#2563eb' },
    { label:'Naive Bayes',   pred:r.nb_prediction, prob:PCT(r.nb_probability), color:'#7c3aed' },
    { label:'Decision Tree', pred:r.dt_prediction, prob:PCT(r.dt_probability), color:'#d97706' },
  ]

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Prediction Result</h2>

        {/* Main result card */}
        <div className="p-6 rounded-xl bg-white shadow-sm mb-4">
          <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Predicted Disease</p>
              <h3 className="font-display text-2xl font-bold text-slate-900">{r.final_prediction}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Symptoms: {Array.isArray(r.symptoms) ? r.symptoms.join(', ') : r.symptoms}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-4xl font-bold font-display" style={{ color:meta.color }}>{confPct}%</div>
              <p className="text-xs font-semibold mt-1" style={{ color:meta.color }}>{meta.label}</p>
            </div>
          </div>

          <Bar pct={confPct} color={meta.color}/>

          {/* Status message */}
          <div className="p-4 rounded-xl mt-4 text-sm font-medium"
            style={{ background:meta.color+'15', border:`1px solid ${meta.color}33`, color:meta.color }}>
            {meta.icon} {meta.msg}
          </div>

          {/* Sent to doctor notice */}
          {meta.showDoctor && !r.suggest_appointment && r.status !== 'VERIFIED' && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-3"
              style={{ background:'#2563eb08', border:'1px solid #2563eb20' }}>
              <span className="text-lg">🔬</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Sent to Doctor for Review</p>
                <p className="text-xs text-slate-400">
                  A verified doctor will review this prediction. You'll see their response here.
                </p>
              </div>
            </div>
          )}

          {/* Doctor has responded */}
          {r.doctor_remarks && (
            <div className="mt-3 p-4 rounded-xl"
              style={{ background:'#05966910', border:'1px solid #05966930' }}>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Doctor's Note</p>
              <p className="text-sm text-slate-700">{r.doctor_remarks}</p>
            </div>
          )}

          {/* Doctor message to patient */}
          {r.doctor_message && (
            <div className="mt-3 p-4 rounded-xl"
              style={{ background:'#2563eb08', border:'1px solid #2563eb25' }}>
              <p className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">Message from Doctor</p>
              <p className="text-sm text-slate-700 italic">"{r.doctor_message}"</p>
            </div>
          )}

          {/* Doctor suggests appointment */}
          {r.suggest_appointment && (
            <div className="mt-4 p-4 rounded-xl"
              style={{ background:'#2563eb12', border:'2px solid #2563eb40' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-1">Doctor Recommends an Appointment</p>
                  <p className="text-sm text-slate-500 mb-3">
                    Based on your symptoms, the doctor recommends you come in for a proper examination.
                  </p>
                  <button
                    onClick={() => navigate('/patient/doctors')}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition"
                    style={{ background:'#2563eb' }}>
                    Book Appointment Now →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Model breakdown */}
        <div className="p-6 rounded-xl bg-white shadow-sm mb-4">
          <h4 className="font-bold mb-4 text-slate-900">AI Model Breakdown</h4>
          <div className="grid grid-cols-3 gap-4">
            {models.map(m => (
              <div key={m.label} className="p-4 rounded-xl border border-surface-200">
                <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color:m.color }}>
                  {m.label}
                </div>
                <div className="font-bold text-slate-900 text-sm mb-2">{m.pred || '—'}</div>
                <Bar pct={m.prob} color={m.color}/>
                <div className="text-xs text-right mt-1 font-semibold" style={{ color:m.color }}>{m.prob}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!r.suggest_appointment && (
            <button onClick={() => navigate('/patient/doctors')}
              className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:opacity-90 transition">
              👨‍⚕️ Find a Doctor
            </button>
          )}
          <button onClick={() => navigate('/patient/symptom-checker')}
            className="px-6 py-3 rounded-xl border border-surface-200 text-slate-700 font-semibold text-sm hover:bg-surface-50 transition">
            🔄 Check Again
          </button>
          <button onClick={() => navigate('/patient/history')}
            className="px-6 py-3 rounded-xl border border-surface-200 text-slate-700 font-semibold text-sm hover:bg-surface-50 transition">
            📋 View History
          </button>
        </div>
      </div>
    </div>
  )
}
