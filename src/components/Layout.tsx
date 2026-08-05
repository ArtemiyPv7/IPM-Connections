import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => setRole(p?.role ?? null))
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm transition-colors ${
      isActive ? 'bg-white/10 text-sand' : 'text-muted hover:text-ink'
    }`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#06090f]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-lg text-sand">IPM Connections</span>
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
              <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-muted">{role}</span>
            )}
            <button onClick={logout} className="text-sm text-muted hover:text-terra transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}