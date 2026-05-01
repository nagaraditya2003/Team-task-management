// ============================================================
// services/api.js
//
// LESSON: This creates a single fetch wrapper shared across
// all service files. It automatically attaches the JWT token
// and normalizes JSON/error handling in one place.
// ============================================================

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return { data }
}

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const response = await fetch(`${baseURL}${url}`, {
    ...options,
    headers
  })

  return parseResponse(response)
}

const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, data) =>
    request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) =>
    request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' })
}

export default api
