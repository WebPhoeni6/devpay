import { useState } from 'react'
import { X, Copy, Check, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from './Badge'
import Button from './Button'
import usePaymentStore from '../stores/paymentStore'
import useInvoiceStore from '../stores/invoiceStore'

function shortId(id) {
  if (!id) return ''
  return `#${String(id).replace(/-/g, '').slice(0, 5).toUpperCase()}`
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount || 0)
}

export default function InvoiceDetailPanel({ invoice, onClose }) {
  const { initializePayment, verifyPayment, loading } = usePaymentStore()
  const { fetchInvoices } = useInvoiceStore()
  const [paymentLink, setPaymentLink] = useState('')
  const [reference, setReference] = useState('')
  const [copied, setCopied] = useState(false)

  if (!invoice) return null

  const isPaid = invoice.status?.toLowerCase() === 'paid'
  const client = invoice.client_detail || {}

  const handleGenerateLink = async () => {
    const data = await initializePayment(invoice.id)
    if (data) {
      setPaymentLink(data.authorization_url)
      setReference(data.reference)
      toast.success('Payment link generated')
      return
    }
    toast.error('Failed to generate payment link')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (!reference) return
    const data = await verifyPayment(reference)
    if (data) {
      toast.success('Payment verified')
      fetchInvoices()
      return
    }
    toast.error('Payment not confirmed yet')
  }

  return (
    <div className="w-80 bg-[var(--bg-surface)] border-l border-[color:var(--border)] flex flex-col h-full fixed right-0 top-0 z-20 shadow-xl overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]">
        <h2 className="font-semibold text-[var(--text-primary)]">
          Invoice {shortId(invoice.id)}
        </h2>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Start Date</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatDate(invoice.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Due Date</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">Status</p>
          <Badge status={invoice.status} />
        </div>

        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">Client</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {client.name || '--'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{client.email || ''}</p>
        </div>

        <div className="bg-[var(--bg-surface-muted)] border border-[color:var(--border)] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Bill Name</span>
            <span className="font-medium text-[var(--text-primary)]">
              {invoice.title || '--'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Type</span>
            <span className="font-medium text-[var(--text-primary)]">One-Time</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Amount</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatAmount(invoice.amount)}
            </span>
          </div>
        </div>

        {invoice.description && (
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Note</p>
            <p className="text-sm text-[var(--text-primary)]">{invoice.description}</p>
          </div>
        )}

        <div className="pt-2 border-t border-[color:var(--border)]">
          {isPaid ? (
            <div className="flex items-center gap-2">
              <Badge status="paid" />
              {invoice.paid_at && (
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatDate(invoice.paid_at)}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full justify-center"
              >
                Generate Payment Link
              </Button>

              {paymentLink && (
                <>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={paymentLink}
                      className="flex-1 border border-[color:var(--border-muted)] rounded-lg px-3 py-2 text-xs bg-[var(--bg-surface-muted)] text-[var(--text-primary)] truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className="border border-[color:var(--border-muted)] rounded-lg p-2 hover:bg-[var(--row-hover)] text-[var(--text-secondary)]"
                    >
                      {copied ? (
                        <Check size={14} className="text-[var(--success)]" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full justify-center flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Verify Payment
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
