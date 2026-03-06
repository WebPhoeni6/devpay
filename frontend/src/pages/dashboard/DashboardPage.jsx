import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowRight, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import InvoiceDetailPanel from '../../components/InvoiceDetailPanel'
import useInvoiceStore from '../../stores/invoiceStore'
import useThemeStore from '../../stores/themeStore'

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

function buildChartData(invoices) {
  return getLast7Days().map((day) => {
    const label = day.toLocaleDateString('en-US', { weekday: 'short' })
    const dayStr = day.toISOString().slice(0, 10)
    const dayInvoices = invoices.filter(
      (inv) => inv.created_at?.slice(0, 10) === dayStr
    )
    const paid = dayInvoices
      .filter((inv) => inv.status?.toLowerCase() === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const total = dayInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    return { label, paid, total }
  })
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

export default function DashboardPage() {
  const { invoices, fetchInvoices, loading } = useInvoiceStore()
  const theme = useThemeStore((state) => state.theme)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'desc' })
  const [selectedRows, setSelectedRows] = useState(new Set())

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const totalPaid = invoices.filter((inv) => inv.status?.toLowerCase() === 'paid').length
  const totalIssued = invoices.length
  const paidRatio = totalIssued > 0 ? (totalPaid / totalIssued) * 100 : 0

  const chartData = buildChartData(invoices)

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(invoices.map((inv) => inv.status?.toLowerCase()).filter(Boolean)))
    return ['all', ...values]
  }, [invoices])

  const recentInvoices = useMemo(() => {
    const recent = invoices.slice(0, 10)
    const query = search.trim().toLowerCase()

    const filtered = recent.filter((inv) => {
      const matchesSearch = !query
        || inv.client?.name?.toLowerCase().includes(query)
        || inv.title?.toLowerCase().includes(query)
        || String(inv.id).replace(/-/g, '').toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || inv.status?.toLowerCase() === statusFilter
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

  const visibleIds = recentInvoices.map((inv) => String(inv.id))
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

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    borderColor: theme === 'dark' ? '#1f2a44' : '#cbd5e1',
    backgroundColor: 'var(--tooltip-bg)',
    color: 'var(--text-primary)',
  }

  return (
    <div className={`flex gap-4 lg:gap-6 ${selectedInvoice ? 'lg:mr-80' : ''}`}>
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back. Here is your invoice overview.</p>
        </div>

        <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row">
          <Card className="flex-1">
            <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Invoice Income</h2>
                <p className="text-xs text-[var(--text-secondary)]">Last 7 days total invoice value and paid value.</p>
              </div>
              <div className="text-xs px-3 py-1 rounded-full font-medium bg-[var(--primary-soft)] text-[var(--primary)]">
                Weekly View
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                />
                <YAxis hide />
                <Tooltip formatter={(val) => formatAmount(val)} contentStyle={tooltipStyle} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="var(--chart-total)" />
                <Bar dataKey="paid" radius={[4, 4, 0, 0]} fill="var(--chart-paid)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="w-full lg:w-56">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Overview</h2>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Total Paid</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPaid}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Total Issued</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalIssued}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--primary-soft)] overflow-hidden mb-3">
              <div
                className="h-full bg-[var(--primary)] rounded-full"
                style={{ width: `${paidRatio}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-4">
              <span>Paid {Math.round(paidRatio)}%</span>
              <span>Issued {Math.round(100 - paidRatio)}%</span>
            </div>
            <Link
              to="/invoices"
              className="flex items-center gap-1 text-xs text-[var(--primary)] font-medium hover:underline"
            >
              View Detail <ArrowRight size={12} />
            </Link>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[color:var(--border)] flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold text-[var(--text-primary)]">Billing &amp; Invoices</h2>
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <div className="relative w-full sm:w-auto sm:min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter rows"
                  className="w-full border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
            <div className="px-4 sm:px-6 py-3 border-b border-[color:var(--border)] bg-[var(--bg-surface-muted)] flex items-center justify-between gap-3 flex-wrap">
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
            <div className="px-4 sm:px-6 py-8 text-sm text-[var(--text-secondary)]">Loading...</div>
          ) : recentInvoices.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-sm text-[var(--text-secondary)]">No invoices match your filters.</div>
          ) : (
            <>
              <div className="sm:hidden divide-y divide-[color:var(--border)]">
                {recentInvoices.map((inv) => {
                  const id = String(inv.id)
                  const isSelected = selectedRows.has(id)
                  const isOpen = selectedInvoice?.id === inv.id

                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`px-4 py-4 cursor-pointer transition-colors ${
                        isSelected || isOpen ? 'bg-[var(--row-selected)]' : 'hover:bg-[var(--row-hover)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 accent-[var(--primary)]"
                          aria-label={`Select invoice ${shortId(inv.id)}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {inv.client?.name || inv.title || '--'}
                            </p>
                            <Badge status={inv.status} />
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                            <p>ID: {shortId(inv.id)}</p>
                            <p className="text-right font-medium text-[var(--text-primary)]">{formatAmount(inv.amount)}</p>
                            <p>Start: {formatDate(inv.created_at)}</p>
                            <p className="text-right">Due: {formatDate(inv.due_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="text-xs text-[var(--text-secondary)] border-b border-[color:var(--border)]">
                      <th className="w-12 text-left py-3 px-3 sm:px-4">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                          className="h-4 w-4 accent-[var(--primary)]"
                          aria-label="Select all visible rows"
                        />
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('id')} className="inline-flex items-center gap-1">
                          Invoice ID
                          <SortIndicator active={sortConfig.key === 'id'} direction={sortConfig.direction} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('client')} className="inline-flex items-center gap-1">
                          Invoice Name
                          <SortIndicator active={sortConfig.key === 'client'} direction={sortConfig.direction} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1">
                          Start Date
                          <SortIndicator active={sortConfig.key === 'created_at'} direction={sortConfig.direction} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('due_date')} className="inline-flex items-center gap-1">
                          Due Date
                          <SortIndicator active={sortConfig.key === 'due_date'} direction={sortConfig.direction} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1">
                          Amount
                          <SortIndicator active={sortConfig.key === 'amount'} direction={sortConfig.direction} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium">
                        <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1">
                          Status
                          <SortIndicator active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => {
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
                          <td className="py-3 px-3 sm:px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(id)}
                              className="h-4 w-4 accent-[var(--primary)]"
                              aria-label={`Select invoice ${shortId(inv.id)}`}
                            />
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{shortId(inv.id)}</td>
                          <td className="py-3 px-3 sm:px-4 text-sm font-medium text-[var(--text-primary)]">
                            {inv.client?.name || inv.title || '--'}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{formatDate(inv.created_at)}</td>
                          <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{formatDate(inv.due_date)}</td>
                          <td className="py-3 px-3 sm:px-4 text-sm font-medium text-[var(--text-primary)]">{formatAmount(inv.amount)}</td>
                          <td className="py-3 px-3 sm:px-4">
                            <Badge status={inv.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
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

