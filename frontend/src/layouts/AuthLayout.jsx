export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="DevPay" className="h-10" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
