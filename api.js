import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export const http = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('mp_access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(res => res, async err => {
  const orig = err.config
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true
    const refresh = localStorage.getItem('mp_refresh')
    if (refresh) {
      try {
        const { data } = await axios.post(`${BASE}/auth/token/refresh`, { refresh })
        localStorage.setItem('mp_access', data.access)
        orig.headers.Authorization = `Bearer ${data.access}`
        return http(orig)
      } catch {
        localStorage.removeItem('mp_access')
        localStorage.removeItem('mp_refresh')
        window.location.href = '/'
      }
    }
  }
  return Promise.reject(err)
})

async function call(fn) {
  try {
    const res = await fn()
    return { data: res.data, error: null }
  } catch (err) {
    const body = err.response?.data
    let message = 'Request failed'
    if (typeof body === 'string') message = body
    else if (body?.detail) message = body.detail
    else if (body?.non_field_errors) message = body.non_field_errors[0]
    else if (body && typeof body === 'object') {
      const first = Object.values(body)[0]
      message = Array.isArray(first) ? first[0] : String(first)
    } else if (err.message) message = err.message
    return { data: null, error: message }
  }
}

export const authApi = {
  login:           (email, password) => call(() => http.post('/auth/login', { email, password })),
  registerPatient: (payload)         => call(() => http.post('/auth/register-patient', payload)),
  registerDoctor:  (payload)         => call(() => http.post('/auth/register-doctor', payload)),
  refreshToken:    (refresh)         => call(() => http.post('/auth/token/refresh', { refresh })),
  me:              ()                => call(() => http.get('/me')),
}

export const doctorApi = {
  listVerified:     ()        => call(() => http.get('/doctors/')),
  get:              (id)      => call(() => http.get(`/doctors/${id}/`)),
  getProfile:       ()        => call(() => http.get('/doctors/profile/')),
  updateProfile:    (payload) => call(() => http.patch('/doctors/profile/', payload)),
  // Slots — GET/POST /api/doctors/slots/
  getSlots:         ()        => call(() => http.get('/doctors/slots/')),
  saveSlots:        (payload) => call(() => http.post('/doctors/slots/', payload)),
  // Public: GET /api/doctors/<id>/slots/
  getDoctorSlots:   (id)      => call(() => http.get(`/doctors/${id}/slots/`)),
}

export const predictionApi = {
  list:           ()            => call(() => http.get('/predictions/')),
  create:         (payload)     => call(() => http.post('/predictions/', payload)),
  get:            (id)          => call(() => http.get(`/predictions/${id}/`)),
  doctorRequests: ()            => call(() => http.get('/predictions/requests/')),
  verify:         (id, payload) => call(() => http.patch(`/predictions/${id}/verify/`, payload)),
}

export const appointmentApi = {
  list:         ()             => call(() => http.get('/appointments/')),
  create:       (payload)      => call(() => http.post('/appointments/', payload)),
  doctorList:   ()             => call(() => http.get('/doctor/appointments/')),
  updateStatus: (id, status)   => call(() => http.patch(`/appointments/${id}/status/`, { status })),
  complete:     (id, payload)  => call(() => http.post(`/appointments/${id}/complete/`, payload)),
  review:       (id, payload)  => call(() => http.post(`/appointments/${id}/review/`, payload)),
}
