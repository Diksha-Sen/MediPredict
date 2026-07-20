import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import Modal from '../../components/Modal.jsx'
import { PrimaryBtn } from '../../components/FormFields.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { appointmentApi, doctorApi } from '../../services/api.js'

const STATUS_COLOR = { PENDING:'#d97706', ACCEPTED:'#2563eb', REJECTED:'#dc2626', COMPLETED:'#059669' }

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 focus:outline-none">
          <Star
            size={36}
            fill={(hovered || value) >= n ? '#d97706' : 'none'}
            stroke={(hovered || value) >= n ? '#d97706' : '#cbd5e1'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

const STAR_LABELS = { 1:'Poor', 2:'Fair', 3:'Good', 4:'Very Good', 5:'Excellent' }

export default function PatientAppointments() {
  const { showToast } = useApp()
  const [appts,   setAppts]   = useState([])
  const [doctors, setDoctors] = useState({})
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [rating,   setRating]   = useState(5)
  const [comment,  setComment]  = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([appointmentApi.list(), doctorApi.listVerified()]).then(([a, d]) => {
      if (a.data) setAppts(a.data)
      if (d.data) {
        const map = {}
        d.data.forEach(doc => { map[doc.id] = doc })
        setDoctors(map)
      }
      setLoading(false)
    })
  }, [])

  const openReview = (appt) => {
    setReviewTarget(appt)
    setRating(5)
    setComment('')
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await appointmentApi.review(reviewTarget.id, { rating, comment })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    showToast('Review submitted! Thank you.', 'success')
    setReviewTarget(null)
    // Mark locally that review is done so button disappears
    setAppts(prev => prev.map(a => a.id === reviewTarget.id ? { ...a, _reviewed: true } : a))
  }

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">My Appointments</h2>

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {!loading && appts.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            No appointments yet. Book one from the Doctors page.
          </div>
        )}

        <div className="space-y-3">
          {appts.map((a, i) => {
            const color    = STATUS_COLOR[a.status] || '#999'
            const doctor   = doctors[a.doctor]
            const docName  = doctor?.user?.name || a.doctor_name || `Doctor #${a.doctor}`
            const docSpec  = doctor?.specialization || ''
            return (
              <div key={a.id} className="p-5 rounded-xl bg-white shadow-sm animate-slide-in"
                style={{ animationDelay:`${i*0.05}s` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{docName}</h3>
                    {docSpec && <p className="text-xs text-slate-400">{docSpec}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      📅 {a.date} &nbsp;·&nbsp; 🕐 {a.time?.slice(0,5)}
                    </p>
                    {a.reason && (
                      <p className="text-sm text-slate-500 mt-1">Reason: {a.reason}</p>
                    )}
                  </div>
                  <span className="tag text-xs flex-shrink-0"
                    style={{ background:color+'22', color }}>
                    {a.status}
                  </span>
                </div>

                {a.status === 'COMPLETED' && !a._reviewed && (
                  <button onClick={() => openReview(a)}
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition"
                    style={{ background:'#d97706' }}>
                    <Star size={13} fill="white" stroke="white"/> Leave Review
                  </button>
                )}
                {a.status === 'COMPLETED' && a._reviewed && (
                  <p className="mt-2 text-xs text-slate-400">✓ Review submitted</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <Modal title="Leave a Review" onClose={() => setReviewTarget(null)}>
          <p className="text-sm text-slate-500 mb-5">
            How was your appointment with <strong>{doctors[reviewTarget.doctor]?.user?.name || reviewTarget.doctor_name || 'the doctor'}</strong>?
          </p>
          <form onSubmit={submitReview} className="space-y-5">

            {/* Star picker */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700">Your Rating</label>
              <StarPicker value={rating} onChange={setRating}/>
              {rating > 0 && (
                <p className="mt-2 text-sm font-semibold" style={{ color:'#d97706' }}>
                  {'★'.repeat(rating)} — {STAR_LABELS[rating]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">
                Comment <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your experience…"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white resize-none"/>
            </div>

            <PrimaryBtn type="submit" disabled={saving || rating === 0} className="w-full justify-center">
              {saving ? 'Submitting…' : 'Submit Review'}
            </PrimaryBtn>
          </form>
        </Modal>
      )}
    </div>
  )
}
