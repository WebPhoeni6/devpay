import { create } from 'zustand'
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth'

const useAuthStore = create((set) => ({
  user: null,
  access_token: localStorage.getItem('access_token'),
  refresh_token: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null })
    try {
      const { data } = await apiLogin(credentials)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ access_token: data.access, refresh_token: data.refresh, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Login failed', loading: false })
      return false
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await apiRegister(userData)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ access_token: data.access, refresh_token: data.refresh, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data || 'Registration failed', loading: false })
      return false
    }
  },

  loadUser: async () => {
    try {
      const { data } = await getMe()
      set({ user: data })
    } catch {
      // silently fail
    }
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, access_token: null, refresh_token: null })
  },
}))

export default useAuthStore
