const statusStyles = {
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100 text-red-600',
  draft: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function Badge({ status }) {
  const style = statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`${style} rounded-full px-3 py-1 text-xs font-medium`}>
      {status?.toUpperCase()}
    </span>
  )
}
