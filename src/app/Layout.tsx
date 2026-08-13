import ToastHost from '../shared/ui/ToastHost'
import { log } from '../shared/lib/audit'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRole } from '../shared/hooks/useRole'

export default function Layout({ children }: { children: ReactNode }) {
  const role = useRole()

  async function logout() {
    void log('logout')
    await supabase.auth.signOut()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm transition-colors ${
      isActive ? 'bg-white/10 text-sky' : 'text-gray hover:text-white'
    }`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#06090f]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                window.location.hash = '#/'
                window.location.reload()
              }}
              title="На главную (с перезагрузкой)"
              className="font-semibold text-lg text-sky hover:text-white transition-colors cursor-pointer"
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
            {role && (
              <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-gray">{role}</span>
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