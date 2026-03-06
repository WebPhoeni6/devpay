export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
    outline: 'border border-[color:var(--border-muted)] text-[var(--text-secondary)] hover:bg-[var(--row-hover)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
