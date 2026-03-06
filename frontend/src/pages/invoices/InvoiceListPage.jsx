import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import InvoiceDetailPanel from '../../components/InvoiceDetailPanel'
import useInvoiceStore from '../../stores/invoiceStore'

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function shortId(id) {
  return `#${String(id).replace(/-/g, '').slice(0, 5).toUpperCase()}`
}

function SortIndicator({ active, direction }) {
  if (!active) return <ArrowUpDown size={14} className="text-[var(--text-muted)]" />
  return direction === 'asc'
    ? <ChevronUp size={14} className="text-[var(--primary)]" />
    : <ChevronDown size={14} className="text-[var(--primary)]" />
}

export default function InvoiceListPage() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore()
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'desc' })
  const [selectedRows, setSelectedRows] = useState(new Set())

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(invoices.map((inv) => inv.status?.toLowerCase()).filter(Boolean)))
    return ['all', ...values]
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = invoices.filter((inv) => {
      const clientName = inv.client?.name?.toLowerCase() || ''
      const title = inv.title?.toLowerCase() || ''
      const invoiceCode = String(inv.id).replace(/-/g, '').toLowerCase()
      const status = inv.status?.toLowerCase() || ''

      const matchesSearch = !query
        || clientName.includes(query)
        || title.includes(query)
        || invoiceCode.includes(query)
      const matchesStatus = statusFilter === 'all' || status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      switch (sortConfig.key) {
        case 'id':
          return String(a.id).localeCompare(String(b.id)) * direction
        case 'amount':
          return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * direction
        case 'client':
          return ((a.client?.name || a.title || '').localeCompare(b.client?.name || b.title || '')) * direction
        case 'created_at':
          return ((new Date(a.created_at || 0)).getTime() - (new Date(b.created_at || 0)).getTime()) * direction
        case 'status':
          return ((a.status || '').localeCompare(b.status || '')) * direction
        case 'due_date':
        default:
          return ((new Date(a.due_date || 0)).getTime() - (new Date(b.due_date || 0)).getTime()) * direction
      }
    })

    return filtered
  }, [invoices, search, statusFilter, sortConfig])

  useEffect(() => {
    setSelectedRows((prev) => {
      const valid = new Set(invoices.map((inv) => String(inv.id)))
      return new Set(Array.from(prev).filter((id) => valid.has(id)))
    })
  }, [invoices])

  const visibleIds = filteredInvoices.map((inv) => String(inv.id))
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.has(id))

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  return (
    <div className={`flex gap-6 ${selectedInvoice ? 'mr-80' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Invoices</h1>
            <p className="text-sm text-[var(--text-secondary)]">Manage and track your invoices</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Export Invoice</Button>
            <Link to="/invoices/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} /> New Invoice
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[color:var(--border)] flex flex-wrap gap-3 items-center justify-between">
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by client, title or invoice id"
                className="w-full border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedRows.size > 0 && (
            <div className="px-6 py-3 border-b border-[color:var(--border)] bg-[var(--bg-surface-muted)] flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                {selectedRows.size} row{selectedRows.size === 1 ? '' : 's'} selected
              </p>
              <button
                type="button"
                onClick={() => setSelectedRows(new Set())}
                className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
              >
                Clear
              </button>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-8 text-sm text-[var(--text-secondary)]">Loading...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[var(--text-secondary)]">No invoices match your current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[var(--text-secondary)] border-b border-[color:var(--border)]">
                    <th className="w-12 text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="h-4 w-4 accent-[var(--primary)]"
                        aria-label="Select all visible invoices"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('id')} className="inline-flex items-center gap-1">
                        Invoice ID
                        <SortIndicator active={sortConfig.key === 'id'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('client')} className="inline-flex items-center gap-1">
                        Invoice Name
                        <SortIndicator active={sortConfig.key === 'client'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1">
                        Start Date
                        <SortIndicator active={sortConfig.key === 'created_at'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('due_date')} className="inline-flex items-center gap-1">
                        Due Date
                        <SortIndicator active={sortConfig.key === 'due_date'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1">
                        Amount
                        <SortIndicator active={sortConfig.key === 'amount'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1">
                        Status
                        <SortIndicator active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const id = String(inv.id)
                    const isSelected = selectedRows.has(id)
                    const isOpen = selectedInvoice?.id === inv.id
                    return (
                      <tr
                        key={id}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`border-b border-[color:var(--border)] cursor-pointer transition-colors ${
                          isSelected || isOpen ? 'bg-[var(--row-selected)]' : 'hover:bg-[var(--row-hover)]'
                        }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            className="h-4 w-4 accent-[var(--primary)]"
                            aria-label={`Select invoice ${shortId(inv.id)}`}
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{shortId(inv.id)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">
                          {inv.client?.name || inv.title || '--'}
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{formatDate(inv.created_at)}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{formatDate(inv.due_date)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{formatAmount(inv.amount)}</td>
                        <td className="py-3 px-4">
                          <Badge status={inv.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedInvoice && (
        <InvoiceDetailPanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
