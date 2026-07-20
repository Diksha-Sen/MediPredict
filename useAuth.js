/**
 * useAuth — convenience hook for auth-related state & actions.
 * Components can call `useAuth()` instead of `useApp()` when they
 * only need authentication primitives.
 */
import { useApp } from '../context/AppContext.jsx'

export function useAuth() {
  const { currentUser, login, logout } = useApp()

  const isPatient = currentUser?.role === 'patient'
  const isDoctor  = currentUser?.role === 'doctor'
  const isAdmin   = currentUser?.role === 'admin'

  return { currentUser, login, logout, isPatient, isDoctor, isAdmin }
}
