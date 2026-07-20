/**
 * HealthProfile — Issues fixed:
 *  #8  Tabs for Basic Info / Medical History / Lifestyle
 *  #8  All fields saved to localStorage (persists immediately)
 *  #8  Allergies and past diseases use TagInput chips
 *  #8  Dropdown options for blood group, exercise, sleep, stress, etc.
 *  #3  Tag-based allergies and past diseases
 */
import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import NavBar from '../../components/NavBar.jsx'
import TagInput from '../../components/TagInput.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { loadHealthProfile, saveHealthProfile } from '../../context/AppContext.jsx'
import {
  BLOOD_GROUPS, YES_NO, EXERCISE_OPTIONS,
  SLEEP_OPTIONS, STRESS_OPTIONS, DIET_OPTIONS,
  COMMON_ALLERGIES, COMMON_PAST_DISEASES,
} from '../../data/constants.js'

const TABS = ['Basic Info', 'Medical History', 'Lifestyle']

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">
        {label} {required && <span style={{color:'#dc2626'}}>*</span>}
      </label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder = 'Select…' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function NumberInput({ value, onChange, placeholder, min, max }) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max}
      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white" />
  )
}

export default function HealthProfile() {
  const { currentUser, showToast } = useApp()
  const [tab, setTab]     = useState(0)
  const [saved, setSaved] = useState(false)

  // Load from localStorage
  const stored = loadHealthProfile(currentUser?.id)

  // ── Tab 1: Basic Info ──────────────────────────────────────────────────────
  const [age,        setAge]        = useState(stored?.age        || currentUser?.age || '')
  const [gender,     setGender]     = useState(stored?.gender     || currentUser?.gender || '')
  const [height,     setHeight]     = useState(stored?.height     || '')
  const [weight,     setWeight]     = useState(stored?.weight     || '')
  const [bloodGroup, setBloodGroup] = useState(stored?.bloodGroup || '')

  // ── Tab 2: Medical History ─────────────────────────────────────────────────
  const [allergies,       setAllergies]       = useState(stored?.allergies       || [])
  const [pastDiseases,    setPastDiseases]    = useState(stored?.pastDiseases    || [])
  const [currentMeds,     setCurrentMeds]     = useState(stored?.currentMeds     || '')

  // ── Tab 3: Lifestyle ───────────────────────────────────────────────────────
  const [smoking,    setSmoking]    = useState(stored?.smoking    || '')
  const [alcohol,    setAlcohol]    = useState(stored?.alcohol    || '')
  const [exercise,   setExercise]   = useState(stored?.exercise   || '')
  const [sleep,      setSleep]      = useState(stored?.sleep      || '')
  const [stress,     setStress]     = useState(stored?.stress     || '')
  const [diet,       setDiet]       = useState(stored?.diet       || '')

  // BMI
  const bmi = height && weight
    ? parseFloat((parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1))
    : null

  // ── Auto-save on every change ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return
    saveHealthProfile(currentUser.id, {
      age, gender, height, weight, bloodGroup,
      allergies, pastDiseases, currentMeds,
      smoking, alcohol, exercise, sleep, stress, diet,
    })
  }, [age, gender, height, weight, bloodGroup,
      allergies, pastDiseases, currentMeds,
      smoking, alcohol, exercise, sleep, stress, diet,
      currentUser?.id])

  const handleSave = () => {
    if (!currentUser?.id) return
    saveHealthProfile(currentUser.id, {
      age, gender, height, weight, bloodGroup,
      allergies, pastDiseases, currentMeds,
      smoking, alcohol, exercise, sleep, stress, diet,
    })
    setSaved(true)
    showToast('Health profile saved!', 'success')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-full">
      <NavBar role="PATIENT" />
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Health Profile</h2>
            <p className="text-sm text-slate-400 mt-1">Your data is saved to your device and used to improve AI predictions.</p>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition bg-brand-600">
            {saved ? <><CheckCircle size={15}/> Saved!</> : '💾 Save Profile'}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface-100 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tab === i ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-white shadow-sm">

          {/* ── TAB 0: Basic Info ──────────────────────────────────────────── */}
          {tab === 0 && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Age" required>
                  <NumberInput value={age} onChange={setAge} placeholder="e.g. 28" min={1} max={120} />
                </Field>
                <Field label="Gender">
                  <Select value={gender} onChange={setGender}
                    options={['Male','Female','Other','Prefer not to say']} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Height (cm)" required>
                  <NumberInput value={height} onChange={setHeight} placeholder="e.g. 170" min={50} max={250} />
                </Field>
                <Field label="Weight (kg)" required>
                  <NumberInput value={weight} onChange={setWeight} placeholder="e.g. 70" min={10} max={300} />
                </Field>
              </div>

              {/* BMI result */}
              {bmi && (
                <div className="p-4 rounded-xl text-center"
                  style={{
                    background: bmi < 18.5 ? '#7c3aed12' : bmi < 25 ? '#05966912' : bmi < 30 ? '#d9770612' : '#dc262612',
                    border:     `1px solid ${bmi < 18.5 ? '#7c3aed30' : bmi < 25 ? '#05966930' : bmi < 30 ? '#d9770630' : '#dc262630'}`,
                  }}>
                  <div className="text-2xl font-bold font-display"
                    style={{ color: bmi < 18.5 ? '#7c3aed' : bmi < 25 ? '#059669' : bmi < 30 ? '#d97706' : '#dc2626' }}>
                    BMI: {bmi}
                  </div>
                  <div className="text-sm font-medium mt-1"
                    style={{ color: bmi < 18.5 ? '#7c3aed' : bmi < 25 ? '#059669' : bmi < 30 ? '#d97706' : '#dc2626' }}>
                    {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Calculated from height and weight</div>
                </div>
              )}

              <Field label="Blood Group">
                <Select value={bloodGroup} onChange={setBloodGroup} options={BLOOD_GROUPS} />
              </Field>
            </div>
          )}

          {/* ── TAB 1: Medical History ─────────────────────────────────────── */}
          {tab === 1 && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 mb-2">Medical History</h3>

              <Field label="Allergies">
                <TagInput
                  options={COMMON_ALLERGIES}
                  selected={allergies}
                  onChange={setAllergies}
                  placeholder="Search and select allergies…"
                />
                {allergies.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No allergies selected — select from the list above.</p>
                )}
              </Field>

              <Field label="Past / Chronic Diseases">
                <TagInput
                  options={COMMON_PAST_DISEASES}
                  selected={pastDiseases}
                  onChange={setPastDiseases}
                  placeholder="Search conditions…"
                />
                {pastDiseases.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No conditions selected.</p>
                )}
              </Field>

              <Field label="Current Medications">
                <textarea value={currentMeds} onChange={e => setCurrentMeds(e.target.value)}
                  rows={3} placeholder="e.g. Metformin 500mg, Salbutamol inhaler as needed…"
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white resize-none" />
              </Field>
            </div>
          )}

          {/* ── TAB 2: Lifestyle ───────────────────────────────────────────── */}
          {tab === 2 && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 mb-2">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Smoking">
                  <Select value={smoking} onChange={setSmoking} options={YES_NO} />
                </Field>
                <Field label="Alcohol Consumption">
                  <Select value={alcohol} onChange={setAlcohol} options={['No','Occasionally','Regularly']} />
                </Field>
              </div>
              <Field label="Exercise Frequency">
                <Select value={exercise} onChange={setExercise} options={EXERCISE_OPTIONS} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sleep Duration">
                  <Select value={sleep} onChange={setSleep} options={SLEEP_OPTIONS} />
                </Field>
                <Field label="Stress Level">
                  <Select value={stress} onChange={setStress} options={STRESS_OPTIONS} />
                </Field>
              </div>
              <Field label="Diet Type">
                <Select value={diet} onChange={setDiet} options={DIET_OPTIONS} />
              </Field>
            </div>
          )}

        </div>

        {/* Navigation between tabs */}
        <div className="flex justify-between mt-4">
          <button onClick={() => setTab(t => Math.max(0, t-1))} disabled={tab===0}
            className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-semibold text-slate-600 hover:bg-surface-50 transition disabled:opacity-30">
            ← Previous
          </button>
          {tab < TABS.length - 1
            ? <button onClick={() => setTab(t => t+1)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:opacity-90 transition">
                Next →
              </button>
            : <button onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:opacity-90 transition">
                {saved ? '✓ Saved!' : '💾 Save Profile'}
              </button>
          }
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          💾 Changes are auto-saved to your device as you type.
        </p>
      </div>
    </div>
  )
}
