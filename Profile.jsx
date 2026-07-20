/**
 * Doctor Profile — view and edit own profile.
 * GET/PATCH /api/doctors/profile/
 * Also shows user info from /api/me
 */
import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { doctorApi } from '../../services/api.js'
import { InputField, SelectField, PrimaryBtn } from '../../components/FormFields.jsx'

const SPECS = [
  'General Medicine','Cardiology','Neurology','Orthopedics','Dermatology',
  'Pulmonology','Gastroenterology','Endocrinology','Psychiatry','Pediatrics',
  'Gynaecology','Urology','Ophthalmology','ENT','Dentistry','Oncology',
  'Nephrology','Rheumatology','Haematology','Infectious Disease',
]

export default function DoctorProfile() {
  const { currentUser, showToast } = useApp()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const [spec, setSpec]   = useState('')
  const [hosp, setHosp]   = useState('')
  const [exp,  setExp]    = useState('')

  useEffect(() => {
    doctorApi.getProfile().then(({ data }) => {
      if (data) {
        setProfile(data)
        setSpec(data.specialization || '')
        setHosp(data.hospital || '')
        setExp(String(data.experience_years || ''))
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await doctorApi.updateProfile({
      specialization:   spec,
      hospital:         hosp,
      experience_years: parseInt(exp) || 0,
    })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    showToast('Profile updated!', 'success')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-full">
      <NavBar role="DOCTOR"/>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">My Profile</h2>

        {loading
          ? <p className="text-slate-400 text-sm">Loading…</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Avatar + status card */}
              <div className="md:col-span-1">
                <div className="p-6 rounded-xl bg-white shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {currentUser?.name?.charAt(0) || 'D'}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{currentUser?.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{spec || 'Specialization not set'}</p>
                  <p className="text-xs text-slate-400 mt-1">{hosp || ''}</p>

                  <div className="mt-4">
                    {profile?.is_verified
                      ? <span className="tag text-xs" style={{ background:'#05966920', color:'#059669', border:'1px solid #05966930' }}>
                          <CheckCircle size={11} className="inline mr-1"/>Verified Doctor
                        </span>
                      : <span className="tag text-xs" style={{ background:'#d9770620', color:'#d97706', border:'1px solid #d9770630' }}>
                          ⏳ Pending Verification
                        </span>
                    }
                  </div>

                  {profile?.rating > 0 && (
                    <div className="mt-3 text-sm font-semibold text-slate-700">
                      ⭐ {profile.rating.toFixed(1)} / 5.0
                    </div>
                  )}
                </div>

                {/* Account info */}
                <div className="mt-4 p-5 rounded-xl bg-white shadow-sm">
                  <h4 className="font-semibold text-sm text-slate-700 mb-3">Account Info</h4>
                  {[
                    ['Email',  currentUser?.email],
                    ['Phone',  currentUser?.phone  || '—'],
                    ['Age',    currentUser?.age     || '—'],
                    ['Gender', currentUser?.gender  || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-surface-100 last:border-0 text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit form */}
              <div className="md:col-span-2">
                <div className="p-6 rounded-xl bg-white shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-5">Professional Details</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                    <SelectField label="Specialization" value={spec} onChange={e => setSpec(e.target.value)}>
                      <option value="">Select specialization…</option>
                      {SPECS.map(s => <option key={s}>{s}</option>)}
                    </SelectField>

                    <InputField label="Hospital / Clinic Name"
                      value={hosp} onChange={e => setHosp(e.target.value)}
                      placeholder="e.g. Apollo Hospital, Mumbai"/>

                    <InputField label="Years of Experience"
                      type="number" min="0" max="60"
                      value={exp} onChange={e => setExp(e.target.value)}
                      placeholder="e.g. 8"/>

                    {!profile?.is_verified && (
                      <div className="p-4 rounded-xl text-sm"
                        style={{ background:'#d9770610', color:'#d97706', border:'1px solid #d9770625' }}>
                        ⏳ Your account is pending admin verification. You will appear in the patient's doctor list once verified.
                      </div>
                    )}

                    <PrimaryBtn type="submit" disabled={saving} className="w-full justify-center">
                      {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
                    </PrimaryBtn>
                  </form>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
