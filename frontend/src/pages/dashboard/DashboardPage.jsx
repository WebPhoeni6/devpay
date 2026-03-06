import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ArrowRight } from 'lucide-react'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import InvoiceDetailPanel from '../../components/InvoiceDetailPanel'
import useInvoiceStore from '../../stores/invoiceStore'

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
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

export default function DashboardPage() {
  const { invoices, fetchInvoices, loading } = useInvoiceStore()
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const totalPaid = invoices.filter((inv) => inv.status?.toLowerCase() === 'paid').length
  const totalIssued = invoices.length
  const paidRatio = totalIssued > 0 ? (totalPaid / totalIssued) * 100 : 0

  const chartData = buildChartData(invoices)
  const recentInvoices = invoices.slice(0, 10)

  return (
    <div className={`flex gap-6 ${selectedInvoice ? 'mr-80' : ''}`}>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Welcome back! Here&apos;s your invoice overview.</p>
        </div>

        {/* Top row */}
        <div className="flex gap-6">
          {/* Chart card */}
          <Card className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1A1A2E]">Invoice Income</h2>
                <p className="text-xs text-[#6B7280]">Listed below are all conclusion from invoice income</p>
              </div>
              <div className="flex gap-2">
                {['All', 'Single', 'Recurring'].map((tab) => (
                  <button
                    key={tab}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      tab === 'All'
                        ? 'bg-[#3B3FD8] text-white'
                        : 'text-[#6B7280] hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis hide />
                <Tooltip
                  formatter={(val) => formatAmount(val)}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#E8E9FB" />
                <Bar dataKey="paid" radius={[4, 4, 0, 0]} fill="#3B3FD8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Overview card */}
          <Card className="w-56">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Overview</h2>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-[#6B7280]">Total Paid</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{totalPaid}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Total Issued</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{totalIssued}</p>
              </div>
            </div>
            {/* Stacked bar */}
            <div className="w-full h-2 rounded-full bg-[#E8E9FB] overflow-hidden mb-3">
              <div
                className="h-full bg-[#3B3FD8] rounded-full"
                style={{ width: `${paidRatio}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#6B7280] mb-4">
              <span>Paid {Math.round(paidRatio)}%</span>
              <span>Issued {Math.round(100 - paidRatio)}%</span>
            </div>
            <Link
              to="/invoices"
              className="flex items-center gap-1 text-xs text-[#3B3FD8] font-medium hover:underline"
            >
              View Detail <ArrowRight size={12} />
            </Link>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1A1A2E]">Billing &amp; Invoices</h2>
          </div>
          {loading ? (
            <div className="px-6 py-8 text-sm text-[#6B7280]">Loading...</div>
          ) : recentInvoices.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[#6B7280]">No invoices yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#6B7280] border-b border-gray-100">
                  <th className="text-left py-3 px-6 font-medium">Invoice ID</th>
                  <th className="text-left py-3 px-6 font-medium">Invoice Name</th>
                  <th className="text-left py-3 px-6 font-medium">Start Date</th>
                  <th className="text-left py-3 px-6 font-medium">Due Date</th>
                  <th className="text-left py-3 px-6 font-medium">Amount</th>
                  <th className="text-left py-3 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-[#6B7280]">
                      #{String(inv.id).replace(/-/g, '').slice(0, 5).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-[#1A1A2E]">
                      {inv.client?.name || inv.title || '—'}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#6B7280]">{formatDate(inv.created_at)}</td>
                    <td className="py-4 px-6 text-sm text-[#6B7280]">{formatDate(inv.due_date)}</td>
                    <td className="py-4 px-6 text-sm font-medium text-[#1A1A2E]">{formatAmount(inv.amount)}</td>
                    <td className="py-4 px-6">
                      <Badge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Detail panel */}
      {selectedInvoice && (
        <InvoiceDetailPanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
