/**
 * Doctor Availability — set weekly schedule.
 * POST /api/doctors/slots/  { day, start_time, end_time, slot_mins }
 * GET  /api/doctors/slots/
 *
 * Falls back to localStorage if backend endpoint isn't ready.
 */
import { useState, useEffect } from 'react'
import { CheckCircle, Plus, Trash2 } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { doctorApi } from '../../services/api.js'

const DAYS = [
  { code:'MON', label:'Monday' },
  { code:'TUE', label:'Tuesday' },
  { code:'WED', label:'Wednesday' },
  { code:'THU', label:'Thursday' },
  { code:'FRI', label:'Friday' },
  { code:'SAT', label:'Saturday' },
  { code:'SUN', label:'Sunday' },
]
const DURATIONS = [15, 20, 30, 45, 60]

// localStorage fallback key
const slotKey = (userId) => `mp_slots_${userId}`

export default function DoctorAvailability() {
  const { currentUser, showToast } = useApp()
  const [slots,   setSlots]   = useState([])   // [{day, start_time, end_time, slot_mins}]
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [useLocal, setUseLocal] = useState(false)

  // Form state for adding a new slot
  const [form, setForm] = useState({ day:'MON', start_time:'09:00', end_time:'17:00', slot_mins:30 })
  const setF = k => v => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    doctorApi.getSlots().then(({ data, error }) => {
      if (data) {
        setSlots(data)
      } else {
        // Backend endpoint not ready — use localStorage
        setUseLocal(true)
        const stored = localStorage.getItem(slotKey(currentUser?.id))
        if (stored) setSlots(JSON.parse(stored))
      }
      setLoading(false)
    })
  }, [])

  const saveToLocal = (newSlots) => {
    localStorage.setItem(slotKey(currentUser?.id), JSON.stringify(newSlots))
  }

  const addSlot = async () => {
    if (!form.day || !form.start_time || !form.end_time) return
    if (form.start_time >= form.end_time) { showToast('End time must be after start time.', 'error'); return }

    setSaving(true)
    const newSlots = slots.filter(s => s.day !== form.day).concat({ ...form })

    if (useLocal) {
      setSlots(newSlots)
      saveToLocal(newSlots)
      showToast('Availability saved locally!', 'success')
    } else {
      const { error } = await doctorApi.saveSlots(form)
      if (error) { showToast(error, 'error') }
      else {
        setSlots(newSlots)
        showToast('Availability saved!', 'success')
      }
    }
    setSaving(false)
  }

  const removeSlot = async (day) => {
    const newSlots = slots.filter(s => s.day !== day)
    setSlots(newSlots)
    if (useLocal) saveToLocal(newSlots)
    else showToast('Day removed. Save to apply.', 'info')
  }

  const dayLabel = (code) => DAYS.find(d => d.code === code)?.label || code

  return (
    <div className="min-h-full">
      <NavBar role="DOCTOR"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">My Availability</h2>
        <p className="text-sm text-slate-400 mb-6">Set which days and hours patients can book appointments with you.</p>

        {useLocal && (
          <div className="mb-5 p-3 rounded-xl text-sm"
            style={{ background:'#d9770611', color:'#d97706', border:'1px solid #d9770622' }}>
            Saving locally (apply <code>BACKEND_PATCHES.py</code> Issue #4 to save to database).
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add slot form */}
          <div className="p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Add / Update Day</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600">Day</label>
                <select value={form.day} onChange={e => setF('day')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm text-slate-900 bg-white">
                  {DAYS.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setF('start_time')(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm text-slate-900 bg-white"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600">End Time</label>
                  <input type="time" value={form.end_time} onChange={e => setF('end_time')(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm text-slate-900 bg-white"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600">Slot Duration</label>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map(m => (
                    <button key={m} type="button"
                      onClick={() => setF('slot_mins')(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        form.slot_mins===m ? 'text-white bg-brand-600' : 'border border-surface-200 text-slate-600 hover:bg-surface-50'
                      }`}>
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={addSlot} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-brand-600 hover:opacity-90 transition disabled:opacity-50">
                <Plus size={15}/> {saving ? 'Saving…' : 'Add / Update Day'}
              </button>
            </div>
          </div>

          {/* Current schedule */}
          <div className="p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Current Schedule</h3>
            {loading && <p className="text-slate-400 text-sm">Loading…</p>}
            {!loading && slots.length === 0 && (
              <p className="text-sm text-slate-400">No availability set yet. Add days on the left.</p>
            )}
            <div className="space-y-2">
              {DAYS.map(d => {
                const slot = slots.find(s => s.day === d.code)
                if (!slot) return null
                return (
                  <div key={d.code} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background:'#05966910', border:'1px solid #05966925' }}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{d.label}</p>
                      <p className="text-xs text-slate-500">
                        {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)} &nbsp;·&nbsp; {slot.slot_mins} min slots
                      </p>
                    </div>
                    <button onClick={() => removeSlot(d.code)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
