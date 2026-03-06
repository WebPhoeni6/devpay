import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './layouts/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClientListPage from './pages/clients/ClientListPage'
import InvoiceListPage from './pages/invoices/InvoiceListPage'
import InvoiceCreatePage from './pages/invoices/InvoiceCreatePage'

function RootRedirect() {
  const token = localStorage.getItem('access_token')
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientListPage />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceCreatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
