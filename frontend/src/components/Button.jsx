export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-[#3B3FD8] text-white hover:bg-indigo-700',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
