/**
 * AppContext — global state.
 *
 * Health profile is persisted in localStorage under "mp_health_<userId>"
 * so it survives page refreshes without needing a backend endpoint.
 * When the profiles app backend is ready, replace localStorage calls
 * with real API calls in HealthProfile.jsx.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../services/api.js'

const AppContext = createContext(null)

// ── Health profile localStorage helpers ───────────────────────────────────────
export function loadHealthProfile(userId) {
  try { return JSON.parse(localStorage.getItem(`mp_health_${userId}`) || 'null') } catch { return null }
}
export function saveHealthProfile(userId, data) {
  localStorage.setItem(`mp_health_${userId}`, JSON.stringify(data))
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('mp_user') || 'null') } catch { return null }
  })
  const [predictionResult, setPredictionResult] = useState(null)
  const [toasts, setToasts]  = useState([])

  useEffect(() => {
    sessionStorage.setItem('mp_user', JSON.stringify(currentUser))
  }, [currentUser])

  // ── Toast ───────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback((user, access, refresh) => {
    localStorage.setItem('mp_access',  access)
    localStorage.setItem('mp_refresh', refresh)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mp_access')
    localStorage.removeItem('mp_refresh')
    sessionStorage.removeItem('mp_user')
    setCurrentUser(null)
  }, [])

  const rehydrate = useCallback(async () => {
    const token = localStorage.getItem('mp_access')
    if (!token || currentUser) return
    const { data } = await authApi.me()
    if (data) setCurrentUser(data)
    else logout()
  }, [currentUser, logout])

  useEffect(() => { rehydrate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{
      currentUser,
      login, logout,
      predictionResult, setPredictionResult,
      toasts, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
