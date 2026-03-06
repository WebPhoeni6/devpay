export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img src="/logo.svg" alt="DevPay" className="h-9 sm:h-10" />
        </div>
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[color:var(--border)] shadow-sm p-5 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
