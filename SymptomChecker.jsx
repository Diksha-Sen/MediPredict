/**
 * SymptomChecker — sends exact ML model column names to the API.
 * Display labels are mapped to column names via SYMPTOM_MAP before POST.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import TagInput from '../../components/TagInput.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { loadHealthProfile, saveHealthProfile } from '../../context/AppContext.jsx'
import { SYMPTOMS_LIST, SYMPTOM_MAP, QUICK_SYMPTOMS,
         COMMON_ALLERGIES, COMMON_PAST_DISEASES } from '../../data/constants.js'
import { predictionApi } from '../../services/api.js'

export default function SymptomChecker() {
  const navigate = useNavigate()
  const { currentUser, setPredictionResult, showToast } = useApp()

  // selected = display labels e.g. ["Fever", "Vomiting"]
  const [selected, setSelected] = useState([])

  // Health profile
  const stored = loadHealthProfile(currentUser?.id)
  const [age,         setAge]         = useState(stored?.age          || currentUser?.age || '')
  const [height,      setHeight]      = useState(stored?.height       || '')
  const [weight,      setWeight]      = useState(stored?.weight       || '')
  const [allergies,   setAllergies]   = useState(stored?.allergies    || [])
  const [pastDiseases,setPastDiseases]= useState(stored?.pastDiseases || [])

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const bmi = height && weight
    ? parseFloat((parseFloat(weight) / ((parseFloat(height)/100)**2)).toFixed(1))
    : null

  // Auto-save profile to localStorage
  useEffect(() => {
    if (!currentUser?.id) return
    saveHealthProfile(currentUser.id, { age, height, weight, allergies, pastDiseases })
  }, [age, height, weight, allergies, pastDiseases, currentUser?.id])

  const validate = () => {
    const e = {}
    if (selected.length < 2)   e.symptoms = 'Select at least 2 symptoms.'
    if (!age  || age  < 1)     e.age      = 'Age is required.'
    if (!height || height < 1) e.height   = 'Height is required.'
    if (!weight || weight < 1) e.weight   = 'Weight is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const runPrediction = async () => {
    if (!validate()) return
    setLoading(true)

    // ── KEY FIX: map display labels → exact model column names ──────────────
    const mappedSymptoms = selected.map(s => SYMPTOM_MAP[s]).filter(Boolean)

    if (mappedSymptoms.length === 0) {
      showToast('No valid symptoms mapped to model columns.', 'error')
      setLoading(false)
      return
    }

    const payload = {
      symptoms:      mappedSymptoms,   // e.g. ["fever", "vomiting", "abdominal_pain"]
      age:           parseInt(age),
      bmi:           bmi || undefined,
      allergies:     allergies.length    ? allergies.join(', ')    : undefined,
      past_diseases: pastDiseases.length ? pastDiseases.join(', ') : undefined,
    }

    const { data, error } = await predictionApi.create(payload)
    if (error) { showToast(error, 'error'); setLoading(false); return }
    setPredictionResult(data)
    navigate('/patient/prediction-result')
  }

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT"/>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-1 text-slate-900">Symptom Checker</h2>
        <p className="text-sm mb-6 text-slate-400">
          Select your symptoms — the AI will predict the most likely disease using your trained ML models.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Symptom selection */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">1. Select Symptoms</h3>

              <TagInput
                label="Search and select symptoms"
                options={SYMPTOMS_LIST}
                selected={selected}
                onChange={setSelected}
                placeholder="Type to search (e.g. Fever, Vomiting…)"
              />
              {errors.symptoms && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color:'#dc2626' }}>
                  <AlertCircle size={12}/> {errors.symptoms}
                </p>
              )}

              {/* Quick pick */}
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Quick pick</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SYMPTOMS.filter(s => !selected.includes(s)).map(s => (
                    <button key={s} type="button" onClick={() => setSelected(p => [...p, s])}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-surface-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 hover:bg-blue-50 transition">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {selected.length > 0 && (
                <p className="text-xs text-slate-400 mt-3">
                  {selected.length} symptom{selected.length > 1 ? 's' : ''} selected
                  {selected.length >= 2 ? ' ✓' : ' — need at least 2'}
                </p>
              )}
            </div>

            <button onClick={runPrediction} disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-base hover:opacity-90 transition disabled:opacity-60 bg-brand-600">
              {loading ? '🔬 Analyzing with ML models…' : '🔬 Analyze Symptoms'}
            </button>
          </div>

          {/* RIGHT: Health Profile (required) */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl bg-white shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">2. Health Profile</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background:'#dc262615', color:'#dc2626', border:'1px solid #dc262625' }}>
                  Required
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Saved automatically. Improves prediction accuracy.</p>

              {/* Age */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1 text-slate-600">
                  Age <span style={{ color:'#dc2626' }}>*</span>
                </label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  min="1" max="120" placeholder="e.g. 28"
                  className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 bg-white ${errors.age ? 'border-red-400' : 'border-surface-200'}`}/>
                {errors.age && <p className="text-xs mt-1" style={{ color:'#dc2626' }}>{errors.age}</p>}
              </div>

              {/* Height + Weight */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600">
                    Height (cm) <span style={{ color:'#dc2626' }}>*</span>
                  </label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                    min="50" max="250" placeholder="170"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 bg-white ${errors.height ? 'border-red-400' : 'border-surface-200'}`}/>
                  {errors.height && <p className="text-xs mt-1" style={{ color:'#dc2626' }}>{errors.height}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600">
                    Weight (kg) <span style={{ color:'#dc2626' }}>*</span>
                  </label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                    min="10" max="300" placeholder="70"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 bg-white ${errors.weight ? 'border-red-400' : 'border-surface-200'}`}/>
                  {errors.weight && <p className="text-xs mt-1" style={{ color:'#dc2626' }}>{errors.weight}</p>}
                </div>
              </div>

              {/* BMI */}
              {bmi && (
                <div className="mb-3 p-2.5 rounded-lg text-center text-sm font-semibold"
                  style={{
                    background: bmi<18.5?'#7c3aed15':bmi<25?'#05966915':bmi<30?'#d9770615':'#dc262615',
                    color:      bmi<18.5?'#7c3aed'  :bmi<25?'#059669'  :bmi<30?'#d97706'  :'#dc2626',
                  }}>
                  BMI: {bmi} — {bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese'}
                </div>
              )}

              {/* Allergies */}
              <div className="mb-3">
                <TagInput
                  label="Allergies (optional)"
                  options={COMMON_ALLERGIES}
                  selected={allergies}
                  onChange={setAllergies}
                  placeholder="Search allergies…"
                />
              </div>

              {/* Past diseases */}
              <div className="mb-1">
                <TagInput
                  label="Past Diseases (optional)"
                  options={COMMON_PAST_DISEASES}
                  selected={pastDiseases}
                  onChange={setPastDiseases}
                  placeholder="Search conditions…"
                />
              </div>

              <p className="text-xs text-slate-400 mt-3">💾 Auto-saved to your device</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
