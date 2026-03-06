import { create } from 'zustand'
import * as api from '../api/payments'

const usePaymentStore = create((set) => ({
  payment: null,
  loading: false,
  error: null,

  initializePayment: async (invoiceId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.initializePayment(invoiceId)
      set({ payment: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data || 'Failed to initialize payment', loading: false })
      return null
    }
  },

  verifyPayment: async (reference) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.verifyPayment(reference)
      set({ loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data || 'Failed to verify payment', loading: false })
      return null
    }
  },

  clearPayment: () => set({ payment: null, error: null }),
}))

export default usePaymentStore
