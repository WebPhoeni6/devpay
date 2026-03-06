import { useEffect } from 'react'
import { Mail, User2, CalendarDays, FileText, Users } from 'lucide-react'
import Card from '../../components/Card'
import useAuthStore from '../../stores/authStore'
import useInvoiceStore from '../../stores/invoiceStore'
import useClientStore from '../../stores/clientStore'

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const { user, loadUser } = useAuthStore()
  const { invoices, fetchInvoices } = useInvoiceStore()
  const { clients, fetchClients } = useClientStore()

  useEffect(() => {
    loadUser()
    fetchInvoices()
    fetchClients()
  }, [loadUser, fetchInvoices, fetchClients])

  const paidInvoices = invoices.filter((inv) => inv.status?.toLowerCase() === 'paid').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Profile</h1>
        <p className="text-sm text-[var(--text-secondary)]">Personal account summary and quick stats.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[color:var(--border)] flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[var(--primary)] text-white font-semibold flex items-center justify-center text-lg">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate">{user?.full_name || 'Unnamed User'}</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">{user?.email || '--'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--bg-surface-muted)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <User2 size={16} />
              <span className="text-sm font-medium">Account Info</span>
            </div>
            <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
              <Mail size={14} className="text-[var(--text-secondary)]" />
              {user?.email || '--'}
            </p>
            <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
              <CalendarDays size={14} className="text-[var(--text-secondary)]" />
              Joined {formatDate(user?.created_at)}
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--bg-surface-muted)] p-4 space-y-3">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Workspace Metrics</p>
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-primary)] flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><Users size={14} className="text-[var(--text-secondary)]" /> Clients</span>
                <span className="font-semibold">{clients.length}</span>
              </p>
              <p className="text-sm text-[var(--text-primary)] flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><FileText size={14} className="text-[var(--text-secondary)]" /> Invoices</span>
                <span className="font-semibold">{invoices.length}</span>
              </p>
              <p className="text-sm text-[var(--text-primary)] flex items-center justify-between">
                <span>Paid Invoices</span>
                <span className="font-semibold">{paidInvoices}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
