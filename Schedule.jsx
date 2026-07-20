/**
 * GET /api/doctor/appointments/
 * Shows ACCEPTED + PENDING appointments in a calendar grid.
 */
import { useState, useEffect } from 'react'
import NavBar from '../../components/NavBar.jsx'
import { appointmentApi } from '../../services/api.js'

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function DoctorSchedule() {
  const [appts,   setAppts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentApi.doctorList().then(({ data }) => {
      if (data) setAppts(data.filter(a => ['ACCEPTED','PENDING'].includes(a.status)))
      setLoading(false)
    })
  }, [])

  const now        = new Date()
  const year       = now.getFullYear()
  const month      = now.getMonth()
  const monthName  = now.toLocaleString('default', { month:'long', year:'numeric' })
  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMonth= new Date(year, month+1, 0).getDate()
  const today      = now.getDate()

  // Map day-of-month → appointments for current month
  const byDay = {}
  appts.forEach(a => {
    if (!a.date) return
    const d = new Date(a.date)
    if (d.getMonth()===month && d.getFullYear()===year) {
      const day = d.getDate()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(a)
    }
  })

  const upcoming = [...appts]
    .sort((a,b) => new Date(a.date+' '+a.time) - new Date(b.date+' '+b.time))
    .slice(0, 7)

  return (
    <div className="min-h-full">
      <NavBar role="DOCTOR" />
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Schedule</h2>

        {loading && <p className="text-slate-400 text-sm mb-4">Loading…</p>}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="md:col-span-3 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900">{monthName}</h3>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-2 text-slate-400">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_,i) => i+1).map(d => {
                const isToday  = d === today
                const hasAppt  = !!byDay[d]
                const isPast   = d < today && !isToday
                return (
                  <div key={d}
                    className={`text-center py-3 rounded-lg relative text-sm select-none ${isToday ? 'font-bold' : ''} ${isPast ? 'text-slate-300' : 'text-slate-600'}`}
                    style={{ background: isToday ? '#2563eb22' : hasAppt ? '#05966911' : undefined }}>
                    {d}
                    {hasAppt && (
                      <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background:'#059669' }} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded inline-block" style={{ background:'#2563eb22', border:'1px solid #2563eb44' }} /> Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:'#059669' }} /> Has appointment
              </span>
            </div>
          </div>

          {/* Upcoming list */}
          <div className="md:col-span-2 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900">Upcoming</h3>
            {upcoming.length === 0
              ? <p className="text-sm text-slate-400">No upcoming appointments.</p>
              : (
                <div>
                  {upcoming.map(a => (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-surface-200 last:border-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: a.status==='ACCEPTED' ? '#059669' : '#d97706' }} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Patient #{a.user}</p>
                        <p className="text-xs text-slate-400">{a.date} · {a.time?.slice(0,5)}</p>
                        {a.reason && <p className="text-xs text-slate-400 truncate max-w-[160px]">{a.reason}</p>}
                      </div>
                      <span className="ml-auto text-xs font-semibold"
                        style={{ color: a.status==='ACCEPTED' ? '#059669' : '#d97706' }}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
