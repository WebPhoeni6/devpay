import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import useInvoiceStore from '../../stores/invoiceStore'
import useClientStore from '../../stores/clientStore'

export default function InvoiceCreatePage() {
  const navigate = useNavigate()
  const { createInvoice } = useInvoiceStore()
  const { clients, fetchClients } = useClientStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client: '',
    amount: '',
    due_date: '',
    description: '',
    status: 'draft',
  })

  useEffect(() => { fetchClients() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createInvoice({
        ...form,
        amount: parseFloat(form.amount),
        client: form.client,
      })
      toast.success('Invoice created!')
      navigate('/invoices')
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        toast.error(Object.values(msg).flat().join(' '))
      } else {
        toast.error(msg || 'Failed to create invoice')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">New Invoice</h1>
        <p className="text-sm text-[var(--text-secondary)]">Fill in the details below to create an invoice</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Website Design"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Client</label>
            <select
              name="client"
              value={form.client}
              onChange={handleChange}
              required
              className="border border-[color:var(--border-muted)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Amount (NGN)"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Due Date"
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes..."
              className="border border-[color:var(--border-muted)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border border-[color:var(--border-muted)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 justify-center">
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
