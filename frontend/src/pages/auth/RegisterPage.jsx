import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useAuthStore from '../../stores/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await register(form)
    if (ok) {
      toast.success('Account created!')
      navigate('/dashboard')
    } else {
      const err = useAuthStore.getState().error
      const msg = typeof err === 'string' ? err : Object.values(err || {}).flat().join(' ')
      toast.error(msg || 'Registration failed')
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-xl font-bold text-[#1A1A2E] mb-1">Create account</h1>
      <p className="text-sm text-[#6B7280] mb-6">Start managing invoices today</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
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
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-center text-[#6B7280] mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[#3B3FD8] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
