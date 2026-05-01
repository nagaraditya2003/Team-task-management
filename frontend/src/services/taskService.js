// services/taskService.js

import api from './api'

export const taskService = {
  getAll: async (projectId = null) => {
    const url = projectId ? `/tasks?project=${projectId}` : '/tasks'
    const res = await api.get(url)
    return res.data
  },

  getStats: async () => {
    const res = await api.get('/tasks/stats')
    return res.data
  },

  create: async (data) => {
    const res = await api.post('/tasks', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/tasks/${id}`)
    return res.data
  }
}
