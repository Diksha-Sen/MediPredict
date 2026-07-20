/**
 * Doctor list + book appointment with slot picker.
 * Slots come from GET /api/doctors/<id>/slots/
 * Falls back to localStorage slots if backend not ready.
 */
import { useState, useEffect } from 'react'
import { Star, Calendar } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import Modal from '../../components/Modal.jsx'
import { PrimaryBtn } from '../../components/FormFields.jsx'
import { doctorApi, appointmentApi } from '../../services/api.js'

const DAY_MAP = { MON:1, TUE:2, WED:3, THU:4, FRI:5, SAT:6, SUN:0 }

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(rating||0) ? '#d97706' : 'none'} stroke="#d97706"/>
      ))}
    </div>
  )
}

function generateSlots(startTime, endTime, slotMins) {
  const slots = []
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let cur = sh * 60 + sm
  const end = eh * 60 + em
  while (cur + slotMins <= end) {
    const h = String(Math.floor(cur/60)).padStart(2,'0')
    const m = String(cur%60).padStart(2,'0')
    slots.push(`${h}:${m}`)
    cur += slotMins
  }
  return slots
}

function getUpcomingDates(dayCodes) {
  const dates = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dayCode = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === d.getDay())
    if (dayCodes.includes(dayCode)) {
      dates.push({
        code: dayCode,
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }),
      })
    }
  }
  return dates
}

export default function DoctorList() {
  const { showToast } = useApp()
  const [doctors,  setDoctors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [bookDoctor, setBookDoctor] = useState(null)
  const [slots,    setSlots]    = useState([])
  const [selDate,  setSelDate]  = useState(null)
  const [selTime,  setSelTime]  = useState('')
  const [reason,   setReason]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewForm,   setReviewForm]   = useState({ rating:5, comment:'' })

  useEffect(() => {
    doctorApi.listVerified().then(({ data }) => {
      if (data) setDoctors(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!bookDoctor) { setSlots([]); setSelDate(null); setSelTime(''); return }
    doctorApi.getDoctorSlots(bookDoctor.id).then(({ data }) => {
      if (data && data.length > 0) {
        setSlots(data)
      } else {
        const stored = localStorage.getItem(`mp_slots_${bookDoctor.user?.id}`)
        if (stored) setSlots(JSON.parse(stored))
        else setSlots([])
      }
    })
  }, [bookDoctor])

  const availableDates = slots.length > 0 ? getUpcomingDates(slots.map(s => s.day)) : []
  const currentSlotDef = selDate ? slots.find(s => s.day === selDate.code) : null
  const timeSlots = currentSlotDef
    ? generateSlots(currentSlotDef.start_time, currentSlotDef.end_time, currentSlotDef.slot_mins)
    : []

  const bookAppointment = async (e) => {
    e.preventDefault()
    if (!selDate || !selTime || !reason.trim()) { showToast('Please fill all fields.', 'error'); return }
    setSaving(true)
    const { error } = await appointmentApi.create({
      doctor: bookDoctor.id,
      date:   selDate.date,
      time:   selTime + ':00',
      reason: reason.trim(),
    })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    showToast('Appointment booked!', 'success')
    setBookDoctor(null)
    setReason('')
    setSelDate(null)
    setSelTime('')
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await appointmentApi.review(reviewTarget.id, {
      rating: parseInt(reviewForm.rating), comment: reviewForm.comment,
    })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    showToast('Review submitted!', 'success')
    setReviewTarget(null)
  }

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT"/>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Verified Doctors</h2>
        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {!loading && doctors.length === 0 && (
          <div className="text-center py-16 text-slate-400">No verified doctors yet.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((d,i) => (
            <div key={d.id} className="p-5 rounded-xl bg-white shadow-sm card-hover animate-slide-in"
              style={{ animationDelay:`${i*0.05}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {d.user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{d.user?.name}</h3>
                  <p className="text-xs text-slate-400">{d.specialization}</p>
                  {d.rating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Stars rating={d.rating}/>
                      <span className="text-xs text-slate-400">{d.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              {d.hospital && <div className="text-xs text-slate-500 mb-1">🏥 {d.hospital}</div>}
              <div className="text-xs text-slate-500 mb-3">📅 {d.experience_years} yrs experience</div>
              <button onClick={() => { setBookDoctor(d); setSelDate(null); setSelTime(''); setReason('') }}
                className="w-full py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5">
                <Calendar size={13}/> Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {bookDoctor && (
        <Modal title={`Book with ${bookDoctor.user?.name}`} onClose={() => setBookDoctor(null)}>
          <div className="mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
              {bookDoctor.user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{bookDoctor.user?.name}</p>
              <p className="text-xs text-slate-400">{bookDoctor.specialization} · {bookDoctor.hospital}</p>
            </div>
          </div>

          <form onSubmit={bookAppointment} className="space-y-4">
            {availableDates.length > 0 ? (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Select Date</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {availableDates.map(d => (
                    <button key={d.date} type="button" onClick={() => { setSelDate(d); setSelTime('') }}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-center transition border ${
                        selDate?.date === d.date
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-surface-200 text-slate-600 hover:border-brand-400 hover:bg-blue-50'
                      }`}>
                      <div className="font-bold">{d.label.split(' ')[0]}</div>
                      <div className="opacity-80 mt-0.5">{d.label.split(' ').slice(1).join(' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Date</label>
                <input type="date" required
                  min={new Date(Date.now()+86400000).toISOString().split('T')[0]}
                  onChange={e => setSelDate({ date: e.target.value, code: '', label: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"/>
                <p className="text-xs text-slate-400 mt-1">Doctor hasn't set availability slots yet — you can still request any date.</p>
              </div>
            )}

            {selDate && timeSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Select Time Slot</label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                  {timeSlots.map(t => (
                    <button key={t} type="button" onClick={() => setSelTime(t)}
                      className={`py-2 rounded-lg text-xs font-semibold transition border ${
                        selTime === t
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-surface-200 text-slate-600 hover:border-brand-400 hover:bg-blue-50'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selDate && timeSlots.length === 0 && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Time</label>
                <input type="time" required value={selTime} onChange={e => setSelTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"/>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Reason for Visit</label>
              <textarea required rows={2} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason…"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white resize-none"/>
            </div>

            {selDate && selTime && (
              <div className="p-3 rounded-lg text-sm"
                style={{ background:'#2563eb10', border:'1px solid #2563eb25', color:'#2563eb' }}>
                📅 {selDate.label} &nbsp;·&nbsp; ⏰ {selTime} &nbsp;·&nbsp; {bookDoctor.user?.name}
              </div>
            )}

            <PrimaryBtn type="submit" disabled={saving || !selDate || !selTime || !reason.trim()}
              className="w-full justify-center">
              {saving ? 'Booking…' : 'Confirm Appointment'}
            </PrimaryBtn>
          </form>
        </Modal>
      )}

      {reviewTarget && (
        <Modal title="Leave a Review" onClose={() => setReviewTarget(null)}>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Rating</label>
              <select value={reviewForm.rating} onChange={e => setReviewForm(f=>({...f,rating:e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white">
                {[5,4,3,2,1].map(n=><option key={n} value={n}>{'★'.repeat(n)} — {n} star{n>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Comment</label>
              <textarea rows={3} value={reviewForm.comment} onChange={e => setReviewForm(f=>({...f,comment:e.target.value}))}
                placeholder="Share your experience…"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"/>
            </div>
            <PrimaryBtn type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Submitting…' : 'Submit Review'}
            </PrimaryBtn>
          </form>
        </Modal>
      )}
    </div>
  )
}
