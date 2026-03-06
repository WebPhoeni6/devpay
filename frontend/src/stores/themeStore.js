import { create } from 'zustand'

const THEME_KEY = 'devpay_theme'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getSavedTheme() {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return getSystemTheme()
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

const useThemeStore = create((set, get) => ({
  theme: 'light',
  hydrated: false,

  hydrateTheme: () => {
    const theme = getSavedTheme()
    applyTheme(theme)
    set({ theme, hydrated: true })
  },

  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
}))

export default useThemeStore
