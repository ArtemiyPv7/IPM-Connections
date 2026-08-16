import { useState } from 'react'
import ToastHost from '../shared/ui/ToastHost'
import { log } from '../shared/lib/audit'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRole } from '../shared/hooks/useRole'
import OnDutyNow from '../features/duty/components/OnDutyNow'

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
  const { pathname } = useLocation()

  async function logout() {
    void log('logout')
    await supabase.auth.signOut()
  }

  function goHome() {
    window.location.hash = '#/'
    window.location.reload()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap transition-colors ${
      isActive ? 'bg-ink/10 text-sky' : 'text-gray hover:text-ink'
    }`

  // «Заводы» подсвечиваются и на «/», и на «/company/:id» — теперь это один экран.
  const companiesActive = pathname === '/' || pathname.startsWith('/company')

  return (
    // Внешняя подложка: вокруг «окна» виден фон страницы.
    <div className="min-h-screen p-3 sm:p-4">
      {/* Окно интерфейса: радиус 16px (rounded-2xl), как в макете */}
      <div className="flex flex-col h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-ink/10 bg-[var(--card-bg)] shadow-2xl">
        <header className="shrink-0 border-b border-ink/10">
          <div className="pl-3 pr-3 sm:pr-6 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              {/* Лого-плитка: радиус 10px — как у плиток протоколов (.tile) */}
              <button onClick={goHome} title="На главную (с перезагрузкой)" className="flex items-center gap-3 shrink-0">
                <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue to-sky flex items-center justify-center text-paper font-bold text-[10px] select-none">
                  IPM
                </span>
                <span className="font-semibold text-lg text-sky hover:text-ink transition-colors max-[640px]:hidden">
                  IPM Connections
                </span>
              </button>
              <nav className="flex gap-0.5 sm:gap-1 min-w-0">
                <Link to="/" className={linkClass({ isActive: companiesActive })}>
                  Заводы
                </Link>
                <NavLink to="/duty" className={linkClass}>
                  Дежурства
                </NavLink>
                <NavLink to="/export" className={linkClass}>
                  Экспорт
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="max-[700px]:hidden">
                <OnDutyNow />
              </div>
              <ThemeToggle />
              {/* Мобильный вариант: бейдж роли = кнопка выхода */}
              {role && (
                <button
                  onClick={logout}
                  title={`${role} · выйти`}
                  className="sm:hidden w-6 h-6 flex items-center justify-center rounded-full border border-ink/10 text-xs text-gray hover:text-red hover:border-red transition-colors select-none"
                >
                  {role.slice(0, 1).toUpperCase()}
                </button>
              )}
              {/* Десктоп: бейдж роли + отдельная кнопка выхода */}
              <div className="max-sm:hidden flex items-center gap-3">
                {role && (
                  <span
                    title={role}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-ink/10 text-xs text-gray select-none"
                  >
                    {role.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <button onClick={logout} className="text-sm text-gray hover:text-red transition-colors">
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* Контент скроллится внутри окна; страницы-«панели» (заводы) скроллятся сами */}
        <main className="flex-1 min-h-0 overflow-y-auto relative">{children}</main>
      </div>
      <ToastHost />
    </div>
  )
}