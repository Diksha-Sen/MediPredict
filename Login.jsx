import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { authApi } from '../../services/api.js'
import { InputField, PrimaryBtn } from '../../components/FormFields.jsx'

export default function PatientLogin() {
  const navigate = useNavigate()
  const { login, showToast } = useApp()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await authApi.login(form.email, form.password)
    if (error) { showToast(error, 'error'); setLoading(false); return }
    if (data.user.role !== 'PATIENT') {
      showToast('This account is not a patient account.', 'error')
      setLoading(false); return
    }
    login(data.user, data.access, data.refresh)
    showToast('Welcome back, ' + data.user.name + '!', 'success')
    navigate('/patient/dashboard')
  }

  return (
    <div className="flex items-center justify-center h-full px-4" style={{ background: '#f8fafc' }}>
      <div className="animate-fade-in w-full max-w-md p-8 rounded-2xl bg-white shadow-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-6 opacity-60 hover:opacity-100 text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900">Patient Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          <InputField label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="••••••••" />
          <PrimaryBtn type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Signing in…' : 'Sign In'}
          </PrimaryBtn>
        </form>
        <p className="text-sm text-center mt-5 text-slate-500">
          No account? <Link to="/patient/signup" className="text-brand-600 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
