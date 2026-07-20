/**
 * adminApi.js — Admin panel API calls.
 *
 * The Django backend doesn't yet expose admin-specific REST endpoints,
 * so we reuse the existing endpoints with the admin's JWT token (which
 * gives access to all records because the admin user has is_staff=True).
 *
 * When you add dedicated admin endpoints (e.g. GET /api/admin/users/),
 * replace the calls below with those URLs.
 *
 * Current strategy:
 *  - Users:        GET /api/me  → only returns current user, so we build a
 *                  userAdmin endpoint once you add it.  For now we use a stub
 *                  that returns an informative message.
 *  - Doctors:      GET /api/doctors/?all=true  (add ?all=true support in view)
 *                  Falls back to /api/doctors/ (verified only) until then.
 *  - Predictions:  Not yet exposed to admin — stub returns empty list.
 *  - Appointments: Not yet exposed to admin — stub returns empty list.
 *
 * To unlock full admin data, add these Django URLs:
 *   path("admin-api/users/",              AdminUserListView.as_view()),
 *   path("admin-api/doctors/",            AdminDoctorListView.as_view()),
 *   path("admin-api/doctors/<pk>/verify/",AdminDoctorVerifyView.as_view()),
 *   path("admin-api/predictions/",        AdminPredictionListView.as_view()),
 *   path("admin-api/appointments/",       AdminAppointmentListView.as_view()),
 */
import { http } from './api.js'

async function call(fn) {
  try {
    const res = await fn()
    return { data: res.data, error: null }
  } catch (err) {
    const body = err.response?.data
    let message = 'Request failed'
    if (body?.detail)              message = body.detail
    else if (body?.non_field_errors) message = body.non_field_errors[0]
    else if (err.message)          message = err.message
    return { data: null, error: message }
  }
}

export const adminApi = {
  // ── Doctors ────────────────────────────────────────────────────────────────
  /**
   * GET /api/doctors/  (verified only until you add ?all=true support)
   * To get unverified doctors too, add to DoctorListView:
   *   if request.user.role == 'ADMIN': return Doctor.objects.all()
   */
  listAllDoctors: () => call(() => http.get('/doctors/')),

  /**
   * PATCH /api/admin-api/doctors/<pk>/verify/
   * Add this view to Django once ready. Stub implementation below.
   * For now falls back to PATCH /api/doctors/profile/ which only works for self.
   */
  verifyDoctor: (doctorId) =>
    call(() => http.patch(`/admin-api/doctors/${doctorId}/verify/`)),

  rejectDoctor: (doctorId) =>
    call(() => http.patch(`/admin-api/doctors/${doctorId}/reject/`)),

  // ── Stats (aggregate from available endpoints) ─────────────────────────────
  /**
   * Fetches whatever is accessible and returns a stats object.
   * Will be richer once admin endpoints exist.
   */
  getStats: async () => {
    const [doctors] = await Promise.all([
      call(() => http.get('/doctors/')),
    ])
    return {
      data: {
        verified_doctors: doctors.data?.length || 0,
      },
      error: null,
    }
  },

  // ── Stubs for future endpoints ─────────────────────────────────────────────
  listUsers:        () => call(() => http.get('/admin-api/users/')),
  listPredictions:  () => call(() => http.get('/admin-api/predictions/')),
  listAppointments: () => call(() => http.get('/admin-api/appointments/')),
}
