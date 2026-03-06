import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import InvoiceDetailPanel from '../../components/InvoiceDetailPanel'
import useInvoiceStore from '../../stores/invoiceStore'

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function InvoiceListPage() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore()
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => { fetchInvoices() }, [])

  return (
    <div className={`flex gap-6 ${selectedInvoice ? 'mr-80' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Invoices</h1>
            <p className="text-sm text-[#6B7280]">Manage and track your invoices</p>
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
          {loading ? (
            <div className="px-6 py-8 text-sm text-[#6B7280]">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[#6B7280]">No invoices yet. Create your first invoice.</div>
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
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedInvoice?.id === inv.id ? 'bg-[#E8E9FB]' : ''
                    }`}
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

      {selectedInvoice && (
        <InvoiceDetailPanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
