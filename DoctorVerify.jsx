import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, FileText, ExternalLink } from 'lucide-react'
import AdminNavBar from './AdminNavBar.jsx'
import Modal from '../../components/Modal.jsx'
import { http } from '../../services/api.js'
import { useApp } from '../../context/AppContext.jsx'

async function fetchSafe(url) {
  try { const r = await http.get(url); return r.data } catch { return null }
}

export default function AdminDoctorVerify() {
  const { showToast } = useApp()
  const [doctors,  setDoctors]  = useState([])
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [viewing,  setViewing]  = useState(null)
  const [noAdminEndpoint, setNoAdminEndpoint] = useState(false)

  useEffect(() => {
    fetchSafe('/admin-api/doctors/').then(data => {
      if (data) setDoctors(data)
      else {
        setNoAdminEndpoint(true)
        fetchSafe('/doctors/').then(d => { if (d) setDoctors(d) })
      }
      setLoading(false)
    })
  }, [])

  const doAction = async (doctor, action) => {
    try {
      const res = await http.patch(`/admin-api/doctors/${doctor.id}/`, { action })
      setDoctors(prev => prev.map(d =>
        d.id === doctor.id ? { ...d, is_verified: action === 'verify' } : d
      ))
      showToast(`Doctor ${action === 'verify' ? 'verified ✓' : 'rejected'}!`,
        action === 'verify' ? 'success' : 'error')
      if (viewing?.id === doctor.id)
        setViewing({ ...doctor, is_verified: action === 'verify' })
    } catch {
      showToast('Action failed — make sure BACKEND_PATCHES.py is applied.', 'error')
    }
  }

  const tabs   = ['all','verified','unverified']
  const counts = {
    all:        doctors.length,
    verified:   doctors.filter(d =>  d.is_verified).length,
    unverified: doctors.filter(d => !d.is_verified).length,
  }
  const filtered =
    filter === 'verified'   ? doctors.filter(d =>  d.is_verified) :
    filter === 'unverified' ? doctors.filter(d => !d.is_verified) : doctors

  return (
    <div className="min-h-full">
      <AdminNavBar/>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">Doctor Verification</h2>
        <p className="text-sm text-slate-400 mb-4">Review registrations and verify doctor credentials.</p>

        {noAdminEndpoint && (
          <div className="mb-5 p-4 rounded-xl text-sm"
            style={{ background:'#d9770611', color:'#d97706', border:'1px solid #d9770622' }}>
            Showing verified doctors only. Apply <code>BACKEND_PATCHES.py</code> to see all doctors.
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                filter===t ? 'text-white' : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
              }`}
              style={filter===t ? { background:'#7c3aed' } : {}}>
              {t} <span className="opacity-60 ml-1">({counts[t]})</span>
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {!loading && filtered.length===0 && (
          <div className="text-center py-16 text-slate-400">No doctors in this category.</div>
        )}

        <div className="space-y-3">
          {filtered.map((d,i) => (
            <div key={d.id} className="p-5 rounded-xl bg-white shadow-sm animate-slide-in"
              style={{ animationDelay:`${i*0.04}s` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {d.user?.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{d.user?.name}</h3>
                    <span className="tag text-xs"
                      style={{ background: d.is_verified?'#05966922':'#d9770622',
                               color: d.is_verified?'#059669':'#d97706' }}>
                      {d.is_verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                    {/* Show license badge if file exists */}
                    {(d.license_file || d.license_file_url) && (
                      <span className="tag text-xs" style={{ background:'#2563eb22', color:'#2563eb' }}>
                        <FileText size={10} className="inline mr-1"/>Certificate uploaded
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>📧 {d.user?.email}</span>
                    <span>🏥 {d.specialization || '—'}</span>
                    <span>📅 {d.experience_years} yrs exp</span>
                    {d.hospital && <span>🏨 {d.hospital}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button onClick={() => setViewing(d)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-slate-600 hover:bg-surface-50 transition">
                    <Eye size={13}/> View
                  </button>
                  {!d.is_verified && (
                    <button onClick={() => doAction(d,'verify')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-accent-green hover:opacity-90 transition">
                      <CheckCircle size={13}/> Verify
                    </button>
                  )}
                  {d.is_verified && (
                    <button onClick={() => doAction(d,'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-accent-red hover:opacity-90 transition">
                      <XCircle size={13}/> Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal with license certificate */}
      {viewing && (
        <Modal title="Doctor Details" onClose={() => setViewing(null)}>
          <div className="space-y-3 text-sm">
            {[
              ['Name',        viewing.user?.name],
              ['Email',       viewing.user?.email],
              ['Phone',       viewing.user?.phone || '—'],
              ['Specialization', viewing.specialization || '—'],
              ['Hospital',    viewing.hospital || '—'],
              ['Experience',  `${viewing.experience_years} years`],
              ['Rating',      viewing.rating ? viewing.rating.toFixed(1) + ' ★' : '—'],
              ['Status',      viewing.is_verified ? '✓ Verified' : '⏳ Pending verification'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3 py-1 border-b border-surface-100 last:border-0">
                <span className="w-32 text-slate-400 flex-shrink-0">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}

            {/* Medical certificate section */}
            <div className="mt-4 p-4 rounded-xl"
              style={{ background:'#2563eb08', border:'1px solid #2563eb20' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} style={{ color:'#2563eb' }}/>
                <span className="font-semibold text-sm text-slate-800">Medical Certificate</span>
              </div>
              {viewing.license_file_url ? (
                <a href={viewing.license_file_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition w-fit"
                  style={{ background:'#2563eb' }}>
                  <ExternalLink size={13}/> View / Download Certificate
                </a>
              ) : viewing.license_file ? (
                <a href={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}/media/${viewing.license_file}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition w-fit"
                  style={{ background:'#2563eb' }}>
                  <ExternalLink size={13}/> View / Download Certificate
                </a>
              ) : (
                <p className="text-xs text-slate-400">No certificate uploaded yet.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {!viewing.is_verified
                ? <button onClick={() => doAction(viewing,'verify')}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-accent-green hover:opacity-90 transition">
                    ✓ Verify Doctor
                  </button>
                : <button onClick={() => doAction(viewing,'reject')}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-accent-red hover:opacity-90 transition">
                    ✗ Revoke Verification
                  </button>
              }
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
