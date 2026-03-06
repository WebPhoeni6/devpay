import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)]">
      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[color:var(--border)] w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
