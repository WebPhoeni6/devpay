const statusStyles = {
  paid: {
    background: 'var(--success-soft)',
    color: 'var(--success)',
  },
  unpaid: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
  draft: {
    background: 'var(--warning-soft)',
    color: 'var(--warning)',
  },
  sent: {
    background: 'var(--info-soft)',
    color: 'var(--info)',
  },
  overdue: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
}

export default function Badge({ status }) {
  const normalized = status?.toLowerCase()
  const style = statusStyles[normalized] || { background: 'var(--row-hover)', color: 'var(--text-secondary)' }

  return (
    <span className="rounded-full px-3 py-1 text-xs font-medium" style={style}>
      {(status || 'unknown').toUpperCase()}
    </span>
  )
}
