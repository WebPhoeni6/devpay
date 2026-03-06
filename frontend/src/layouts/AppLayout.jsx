import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, LogOut, Users } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { useEffect } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/clients', icon: Users, label: 'Clients' },
]

export default function AppLayout() {
  const { user, loadUser, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <img src="/logo.svg" alt="DevPay" className="h-7" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8E9FB] text-[#3B3FD8]'
                    : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1A1A2E]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50 hover:text-red-500 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280]">
              {user?.full_name || user?.email || 'Workspace'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#3B3FD8] flex items-center justify-center text-white text-xs font-semibold">
              {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
