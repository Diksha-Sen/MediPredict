import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { authApi } from '../../services/api.js'
import { useApp } from '../../context/AppContext.jsx'
import { InputField, SelectField, PrimaryBtn } from '../../components/FormFields.jsx'

export default function PatientSignup() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '', age: '', password: '', confirm_password: '',
  })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      showToast('Passwords do not match.', 'error'); return
    }
    setLoading(true)
    const { data, error } = await authApi.registerPatient({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      age: parseInt(form.age),
      password: form.password,
      confirm_password: form.confirm_password,
    })
    if (error) { showToast(error, 'error'); setLoading(false); return }
    showToast('Account created! Please sign in.', 'success')
    navigate('/patient/login')
  }

  return (
    <div className="flex items-center justify-center min-h-full py-8 px-4" style={{ background: '#f8fafc' }}>
      <div className="animate-fade-in w-full max-w-lg p-8 rounded-2xl bg-white shadow-sm">
        <button onClick={() => navigate('/patient/login')} className="flex items-center gap-2 text-sm mb-6 opacity-60 hover:opacity-100 text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Create Patient Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
            <InputField label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            <SelectField label="Gender" value={form.gender} onChange={set('gender')}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </SelectField>
          </div>
          <InputField label="Age" type="number" required min="1" max="120" value={form.age} onChange={set('age')} placeholder="28" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Password" type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
            <InputField label="Confirm Password" type="password" required value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat password" />
          </div>
          <PrimaryBtn type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Creating…' : 'Create Account'}
          </PrimaryBtn>
        </form>
        <p className="text-sm text-center mt-5 text-slate-500">
          Already have an account? <Link to="/patient/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
