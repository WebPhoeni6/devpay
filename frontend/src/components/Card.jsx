export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[var(--bg-surface)] rounded-2xl border border-[color:var(--border)] shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}
