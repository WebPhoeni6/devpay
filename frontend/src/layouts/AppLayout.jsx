import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, LogOut, Menu, Moon, Sun, UserCircle2, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import useAuthStore from '../stores/authStore'
import useThemeStore from '../stores/themeStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/clients', icon: Users, label: 'Clients' },
]

export default function AppLayout() {
  const { user, loadUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const navLinkClass = ({ isActive }) => (
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--row-hover)] hover:text-[var(--text-primary)]'
    }`
  )

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <aside className="hidden md:flex w-56 bg-[var(--bg-sidebar)] border-r border-[color:var(--border)] flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-6 py-5 border-b border-[color:var(--border)]">
          <img src="/logo.svg" alt="DevPay" className="h-7" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[color:var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--row-hover)] hover:text-[var(--danger)] w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className={`fixed inset-0 bg-[var(--bg-overlay)] z-30 md:hidden transition-opacity ${mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[color:var(--border)] z-40 transform transition-transform md:hidden ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-4 py-4 border-b border-[color:var(--border)] flex items-center justify-between">
          <img src="/logo.svg" alt="DevPay" className="h-7" />
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-[color:var(--border)] flex items-center justify-center text-[var(--text-secondary)]"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[color:var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--row-hover)] hover:text-[var(--danger)] w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-56">
        <header className="bg-[var(--bg-surface)] border-b border-[color:var(--border)] px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden h-9 w-9 rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--row-hover)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--row-hover)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              onClick={handleProfileClick}
              className="flex items-center gap-2 sm:gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--bg-surface)] px-2.5 sm:px-3 py-1.5 hover:bg-[var(--row-hover)] transition-colors"
              aria-label="Open profile page"
            >
              <div className="text-right hidden lg:block">
                <span className="text-sm text-[var(--text-secondary)] leading-tight block max-w-[160px] truncate">
                  {user?.full_name || user?.email || 'Workspace'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-semibold">
                {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <UserCircle2 size={16} className="text-[var(--text-secondary)] hidden sm:block" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
