import axios from 'axios'

// API URL: Production oder lokaler Proxy
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token zu Requests hinzufügen
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Login
export const login = async (username, password) => {
  // Debug: Log API URL
  console.log('API_URL:', API_URL)
  const loginUrl = `${API_URL}/login`
  console.log('Login URL:', loginUrl)
  const response = await axios.post(loginUrl, { username, password })
  return response.data
}

// Speakers
export const getSpeakers = () => api.get('/speakers')
export const getSpeaker = (id) => api.get(`/speakers/${id}`)
export const createSpeaker = (data) => api.post('/speakers', data)
export const updateSpeaker = (id, data) => api.put(`/speakers/${id}`, data)
export const deleteSpeaker = (id) => api.delete(`/speakers/${id}`)

// Lunches
export const getLunches = () => api.get('/lunches')
export const getLunch = (id) => api.get(`/lunches/${id}`)
export const createLunch = (data) => api.post('/lunches', data)
export const updateLunch = (id, data) => api.put(`/lunches/${id}`, data)
export const deleteLunch = (id) => api.delete(`/lunches/${id}`)

// Calendar
export const getCalendarEvents = (start, end) => {
  const params = start && end ? { start, end } : {}
  return api.get('/calendar', { params })
}

// Invitations
export const getInvitations = () => api.get('/invitations')
export const createInvitation = (data) => api.post('/invitations', data)
export const updateInvitation = (id, data) => api.put(`/invitations/${id}`, data)

// Speaker Requests
export const createSpeakerRequest = (data) => api.post('/speaker-requests', data)
export const getSpeakerRequests = () => api.get('/speaker-requests')
export const updateSpeakerRequest = (id, data) => api.put(`/speaker-requests/${id}`, data)
export const generateCalendlyLinks = (id) => api.post(`/speaker-requests/${id}/generate-calendly`)
// Öffentliche API-Aufrufe (ohne Authentifizierung)
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getPublicSpeakerRequest = (token) => publicApi.get(`/public/speaker-request/${token}`)
export const selectLunchForRequest = (token, lunchId) => publicApi.post(`/public/speaker-request/${token}/select`, { lunch_id: lunchId })
export const declineSpeakerRequest = (token) => publicApi.post(`/public/speaker-request/${token}/decline`)

export default api

