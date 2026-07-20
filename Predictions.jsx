/**
 * Doctor Predictions — verify AI predictions.
 * For MODERATE/LOW confidence predictions:
 *   - Approve: confirms the diagnosis
 *   - Suggest Appointment: tells patient to come in
 *   - Modify: change the diagnosis
 */
import { useState, useEffect } from 'react'
import NavBar from '../../components/NavBar.jsx'
import Modal from '../../components/Modal.jsx'
import { InputField, PrimaryBtn } from '../../components/FormFields.jsx'
import { predictionApi } from '../../services/api.js'
import { useApp } from '../../context/AppContext.jsx'

const STATUS_COLOR = {
  HIGH_CONFIDENCE:'#059669', MODERATE_CONFIDENCE:'#d97706', LOW_CONFIDENCE:'#dc2626',
  NEEDS_DOCTOR_VERIFICATION:'#d97706', VERIFIED:'#059669', REJECTED:'#dc2626',
}

export default function DoctorPredictions() {
  const { showToast } = useApp()
  const [preds,   setPreds]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modTarget, setModTarget] = useState(null)
  const [modForm,   setModForm]   = useState({ final_prediction:'', doctor_remarks:'', doctor_message:'', suggest_appointment: false })
  const [saving,    setSaving]    = useState(false)

  const load = () => {
    predictionApi.doctorRequests().then(({ data }) => {
      if (data) setPreds(data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const handleApprove = async (pred) => {
    const { error } = await predictionApi.verify(pred.id, {
      status: 'VERIFIED',
      doctor_remarks: 'Verified by doctor.',
      suggest_appointment: false,
      doctor_message: '',
    })
    if (error) { showToast(error, 'error'); return }
    showToast('Prediction approved!', 'success')
    setPreds(p => p.map(x => x.id===pred.id ? {...x, status:'VERIFIED'} : x))
  }

  const handleSuggestAppointment = async (pred) => {
    const { error } = await predictionApi.verify(pred.id, {
      status: 'NEEDS_DOCTOR_VERIFICATION',
      doctor_remarks: 'Doctor recommends an in-person consultation.',
      suggest_appointment: true,
      doctor_message: 'Based on your symptoms, I recommend you book an appointment for a proper examination.',
    })
    if (error) { showToast(error, 'error'); return }
    showToast('Patient notified to book appointment!', 'success')
    setPreds(p => p.map(x => x.id===pred.id ? {...x, suggest_appointment:true} : x))
  }

  const openModify = (pred) => {
    setModTarget(pred)
    setModForm({
      final_prediction: pred.final_prediction,
      doctor_remarks: '',
      doctor_message: '',
      suggest_appointment: false,
    })
  }

  const submitModify = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await predictionApi.verify(modTarget.id, {
      final_prediction:    modForm.final_prediction,
      doctor_remarks:      modForm.doctor_remarks,
      doctor_message:      modForm.doctor_message,
      suggest_appointment: modForm.suggest_appointment,
      status: 'VERIFIED',
    })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    showToast('Prediction updated!', 'success')
    setPreds(p => p.map(x => x.id===modTarget.id ? {
      ...x,
      final_prediction:    modForm.final_prediction,
      doctor_remarks:      modForm.doctor_remarks,
      doctor_message:      modForm.doctor_message,
      suggest_appointment: modForm.suggest_appointment,
      status: 'VERIFIED',
    } : x))
    setModTarget(null)
  }

  const PCT = v => Math.round((v||0)*100)

  const isPending = (p) => ['NEEDS_DOCTOR_VERIFICATION','MODERATE_CONFIDENCE','LOW_CONFIDENCE'].includes(p.status)

  return (
    <div className="min-h-full">
      <NavBar role="DOCTOR"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">Prediction Requests</h2>
        <p className="text-sm text-slate-400 mb-6">
          Review AI predictions that need verification. You can approve, suggest an appointment, or modify the diagnosis.
        </p>

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {!loading && preds.length===0 && (
          <div className="text-center py-16 text-slate-400">No prediction requests assigned to you.</div>
        )}

        <div className="space-y-4">
          {preds.map((p,i) => {
            const color   = STATUS_COLOR[p.status] || '#64748b'
            const confPct = PCT(p.confidence)
            const symptoms = Array.isArray(p.symptoms) ? p.symptoms.join(', ') : p.symptoms

            return (
              <div key={p.id} className="p-5 rounded-xl bg-white shadow-sm animate-slide-in"
                style={{ animationDelay:`${i*0.05}s` }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.final_prediction}</h3>
                    <p className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()} · Confidence: {confPct}%
                    </p>
                  </div>
                  <span className="tag text-xs" style={{ background:color+'22', color }}>
                    {p.status.replace(/_/g,' ')}
                  </span>
                </div>

                {/* Symptoms */}
                <p className="text-xs text-slate-400 mb-3">Symptoms: {symptoms}</p>

                {/* Model predictions */}
                <div className="flex gap-3 text-xs text-slate-400 mb-3 flex-wrap">
                  <span>RF: <strong className="text-slate-600">{p.rf_prediction}</strong></span>
                  <span>NB: <strong className="text-slate-600">{p.nb_prediction}</strong></span>
                  <span>DT: <strong className="text-slate-600">{p.dt_prediction}</strong></span>
                </div>

                {/* Confidence bar */}
                <div className="confidence-bar mb-4" style={{ background:color+'22' }}>
                  <div className="confidence-fill" style={{ background:color, width:`${confPct}%` }}/>
                </div>

                {/* Actions */}
                {isPending(p) ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                      Doctor Action Required
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {/* Approve */}
                      <button onClick={() => handleApprove(p)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition"
                        style={{ background:'#059669' }}>
                        ✓ Approve Diagnosis
                      </button>

                      {/* Suggest appointment */}
                      <button onClick={() => handleSuggestAppointment(p)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition"
                        style={{ background:'#2563eb' }}>
                        📅 Suggest Appointment
                      </button>

                      {/* Modify */}
                      <button onClick={() => openModify(p)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-surface-200 text-slate-600 hover:bg-surface-50 transition">
                        ✎ Modify
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="tag text-xs" style={{
                        background: p.status==='VERIFIED' ? '#05966922' : '#dc262622',
                        color:      p.status==='VERIFIED' ? '#059669'   : '#dc2626',
                      }}>
                        {p.status==='VERIFIED' ? '✓ Verified' : p.status.replace(/_/g,' ')}
                      </span>
                      {p.suggest_appointment && (
                        <span className="tag text-xs" style={{ background:'#2563eb22', color:'#2563eb' }}>
                          📅 Appointment suggested
                        </span>
                      )}
                    </div>
                    {p.doctor_remarks && (
                      <p className="text-xs text-slate-400">Note: {p.doctor_remarks}</p>
                    )}
                    {p.doctor_message && (
                      <p className="text-xs text-slate-500 italic">"{p.doctor_message}"</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modify modal */}
      {modTarget && (
        <Modal title="Modify Prediction" onClose={() => setModTarget(null)}>
          <form onSubmit={submitModify} className="space-y-4">
            <InputField label="Correct Diagnosis"
              value={modForm.final_prediction}
              onChange={e => setModForm(f => ({ ...f, final_prediction: e.target.value }))}/>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Doctor Remarks</label>
              <textarea rows={2} value={modForm.doctor_remarks}
                onChange={e => setModForm(f => ({ ...f, doctor_remarks: e.target.value }))}
                placeholder="Clinical notes, reason for modification…"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Message to Patient</label>
              <textarea rows={2} value={modForm.doctor_message}
                onChange={e => setModForm(f => ({ ...f, doctor_message: e.target.value }))}
                placeholder="e.g. Please book an appointment for further tests…"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"/>
            </div>

            {/* Suggest appointment toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-200 hover:bg-surface-50">
              <input type="checkbox" checked={modForm.suggest_appointment}
                onChange={e => setModForm(f => ({ ...f, suggest_appointment: e.target.checked }))}
                className="w-4 h-4 accent-brand-600"/>
              <div>
                <p className="text-sm font-semibold text-slate-800">Suggest Appointment</p>
                <p className="text-xs text-slate-400">Patient will see a "Book Appointment" button on their result</p>
              </div>
            </label>

            <div className="flex gap-3">
              <PrimaryBtn type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save & Verify'}
              </PrimaryBtn>
              <button type="button" onClick={() => setModTarget(null)}
                className="px-6 py-3 rounded-xl border border-surface-200 text-sm font-semibold text-slate-600 hover:bg-surface-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
