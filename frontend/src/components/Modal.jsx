import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--bg-overlay)] p-0 sm:p-4">
      <div className="bg-[var(--bg-surface)] rounded-t-2xl sm:rounded-2xl shadow-xl border border-[color:var(--border)] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[color:var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
