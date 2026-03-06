export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      )}
      <input
        className={`border border-[color:var(--border-muted)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${error ? 'border-[var(--danger)]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  )
}
