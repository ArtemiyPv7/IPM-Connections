import { useState } from 'react'
import ToastHost from '../shared/ui/ToastHost'
import { log } from '../shared/lib/audit'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRole } from '../shared/hooks/useRole'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('ipm_theme', next)
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-ink/10 text-gray hover:text-sky hover:border-blue transition-colors text-sm"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const role = useRole()

  async function logout() {
    void log('logout')
    await supabase.auth.signOut()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm transition-colors ${
      isActive ? 'bg-ink/10 text-sky' : 'text-gray hover:text-ink'
    }`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ink/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                window.location.hash = '#/'
                window.location.reload()
              }}
              title="На главную (с перезагрузкой)"
              className="font-semibold text-lg text-sky hover:text-ink transition-colors cursor-pointer"
            >
              IPM Connections
            </button>
            <nav className="flex gap-1">
              <NavLink to="/" className={linkClass} end>
                Заводы
              </NavLink>
              <NavLink to="/duty" className={linkClass}>
                Дежурства
              </NavLink>
              <NavLink to="/export" className={linkClass}>
                Экспорт
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {role && (
              <span className="text-xs px-2 py-0.5 rounded border border-ink/10 text-gray">{role}</span>
            )}
            <button onClick={logout} className="text-sm text-gray hover:text-red transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      <ToastHost />
    </div>
  )
}