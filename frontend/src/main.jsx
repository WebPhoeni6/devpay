import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import './index.css'

import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './layouts/ProtectedRoute'
import useThemeStore from './stores/themeStore'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClientListPage from './pages/clients/ClientListPage'
import InvoiceListPage from './pages/invoices/InvoiceListPage'
import InvoiceCreatePage from './pages/invoices/InvoiceCreatePage'
import ProfilePage from './pages/profile/ProfilePage'

function RootRedirect() {
  const token = localStorage.getItem('access_token')
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

function ThemeBootstrap() {
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme)

  useEffect(() => {
    hydrateTheme()
  }, [hydrateTheme])

  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeBootstrap />
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
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
