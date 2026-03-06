import api from './axios'

export const getInvoices = () => api.get('/invoices/')
export const getInvoice = (id) => api.get(`/invoices/${id}/`)
export const createInvoice = (data) => api.post('/invoices/', data)
export const updateInvoice = (id, data) => api.put(`/invoices/${id}/`, data)
export const deleteInvoice = (id) => api.delete(`/invoices/${id}/`)
