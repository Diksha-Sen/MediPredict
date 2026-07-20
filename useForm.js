/**
 * useForm — lightweight form state + validation hook.
 *
 * Usage:
 *   const { values, errors, touched, set, handleBlur, validate, reset } = useForm(
 *     { email: '', password: '' },
 *     { email: [required(), email()], password: [required(), minLen(6)] }
 *   )
 */
import { useState, useCallback } from 'react'

// ── Built-in validators ───────────────────────────────────────────────────────
export const required  = (msg = 'This field is required') => (v) => (!v || !String(v).trim()) ? msg : null
export const email     = (msg = 'Enter a valid email') => (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : null
export const minLen    = (n, msg) => (v) => String(v || '').length < n ? (msg || `Minimum ${n} characters`) : null
export const maxLen    = (n, msg) => (v) => String(v || '').length > n ? (msg || `Maximum ${n} characters`) : null
export const numeric   = (msg = 'Must be a number') => (v) => isNaN(Number(v)) ? msg : null
export const minVal    = (n, msg) => (v) => Number(v) < n ? (msg || `Minimum value is ${n}`) : null
export const maxVal    = (n, msg) => (v) => Number(v) > n ? (msg || `Maximum value is ${n}`) : null
export const matches   = (other, msg = 'Values do not match') => (v, all) => v !== all[other] ? msg : null
export const phone     = (msg = 'Enter a valid phone number') => (v) => !/^[+\d\s\-()]{7,15}$/.test(v) ? msg : null

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useForm(initialValues = {}, rules = {}) {
  const [values, setValues]   = useState(initialValues)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  /** Update a single field */
  const set = useCallback((key) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e
    setValues(prev => ({ ...prev, [key]: val }))
    // Clear error on change
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }, [errors])

  /** Mark a field as touched on blur */
  const handleBlur = useCallback((key) => () => {
    setTouched(prev => ({ ...prev, [key]: true }))
    const fieldRules = rules[key] || []
    for (const rule of fieldRules) {
      const msg = rule(values[key], values)
      if (msg) { setErrors(prev => ({ ...prev, [key]: msg })); break }
    }
  }, [rules, values])

  /** Run all validations; returns true if form is valid */
  const validate = useCallback(() => {
    const newErrors = {}
    let valid = true
    for (const [key, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const msg = rule(values[key], values)
        if (msg) { newErrors[key] = msg; valid = false; break }
      }
    }
    setErrors(newErrors)
    setTouched(Object.fromEntries(Object.keys(rules).map(k => [k, true])))
    return valid
  }, [rules, values])

  /** Reset to initial state */
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, set, handleBlur, validate, reset, setValues }
}
