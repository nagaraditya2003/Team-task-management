// ============================================================
// services/authService.js
//
// LESSON: Service files are the ONLY place that talks to the API.
// Components never call fetch directly — they call these functions.
// This means if the API changes, you fix it in ONE place.
// ============================================================

import api from './api'

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    return res.data
  },

  // Fetch the logged-in user's profile (used on app load)
  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },

  getMembers: async () => {
    const res = await api.get('/auth/members')
    return res.data
  }
}
