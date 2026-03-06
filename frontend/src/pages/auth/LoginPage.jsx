import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useAuthStore from '../../stores/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form)
    if (ok) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(useAuthStore.getState().error || 'Login failed')
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Sign in</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Enter your credentials to continue</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="********"
          required
        />
        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="text-sm text-center text-[var(--text-secondary)] mt-4">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[var(--primary)] font-medium hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  )
}
