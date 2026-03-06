import { create } from 'zustand'
import * as api from '../api/invoices'

const useInvoiceStore = create((set) => ({
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.getInvoices()
      set({ invoices: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch invoices', loading: false })
    }
  },

  fetchInvoice: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.getInvoice(id)
      set({ currentInvoice: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch invoice', loading: false })
    }
  },

  createInvoice: async (invoiceData) => {
    const { data } = await api.createInvoice(invoiceData)
    set((state) => ({ invoices: [data, ...state.invoices] }))
    return data
  },

  updateInvoice: async (id, invoiceData) => {
    const { data } = await api.updateInvoice(id, invoiceData)
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? data : inv)),
      currentInvoice: state.currentInvoice?.id === id ? data : state.currentInvoice,
    }))
    return data
  },

  deleteInvoice: async (id) => {
    await api.deleteInvoice(id)
    set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }))
  },
}))

export default useInvoiceStore
