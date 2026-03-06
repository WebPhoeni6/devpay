import { create } from 'zustand'
import * as api from '../api/clients'

const useClientStore = create((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.getClients()
      set({ clients: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch clients', loading: false })
    }
  },

  createClient: async (clientData) => {
    const { data } = await api.createClient(clientData)
    set((state) => ({ clients: [...state.clients, data] }))
    return data
  },

  updateClient: async (id, clientData) => {
    const { data } = await api.updateClient(id, clientData)
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? data : c)),
    }))
    return data
  },

  deleteClient: async (id) => {
    await api.deleteClient(id)
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
  },
}))

export default useClientStore
