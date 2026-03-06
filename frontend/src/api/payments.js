import api from './axios'

export const initializePayment = (invoiceId) =>
  api.post('/payments/initialize/', { invoice_id: invoiceId })

export const verifyPayment = (reference) =>
  api.get(`/payments/verify/${reference}/`)
