import CompaniesPage from './pages/CompaniesPage'
import DutyPage from './pages/DutyPage'
import ExportPage from './pages/ExportPage'
import LoginPage from './pages/LoginPage'
import LogsPage from './pages/LogsPage'
import Layout from './app/Layout'
import DevDashboard from './features/dev/DevDashboard'
import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './shared/lib/supabase'
import { log } from './shared/lib/audit'
import { RoleContext } from './shared/hooks/useRole'
import {
  clearSessionStart,
  markSessionStart,
  readSessionStart,
  sessionExpired,
} from './shared/lib/session'

export default function App() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // метки нет (первый запуск после обновления) — считаем вход «сейчас»
        if (readSessionStart() === null) markSessionStart()
        if (sessionExpired()) {
          void log('session_expired')
          supabase.auth.signOut()
          setLoggedIn(false)
          setReady(true)
          return
        }
      }
      setLoggedIn(!!data.session)
      setReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') markSessionStart()
      if (event === 'SIGNED_OUT') clearSessionStart()
      if (session && sessionExpired()) {
        void log('session_expired')
        supabase.auth.signOut()
        setLoggedIn(false)
        return
      }
      setLoggedIn(!!session)
      if (!session) setRole(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || cancelled) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => {
          if (!cancelled) setRole(p?.role ?? null)
        })
    })
    return () => {
      cancelled = true
    }
  }, [loggedIn])

  useEffect(() => {
    const timer = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session && sessionExpired()) {
        void log('session_expired')
        await supabase.auth.signOut()
      }
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  if (!ready || (loggedIn && role === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray">
        Загрузка…
      </div>
    )
  }

  if (!loggedIn) return <LoginPage />

  if (role === 'dev') {
    return (
      <RoleContext.Provider value={role}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-ink/10 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
              <span className="font-semibold text-lg text-sky">
                IPM Connections · разработчик
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray hover:text-red transition-colors"
              >
                Выйти
              </button>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-6 py-8">
            <DevDashboard />
            <LogsPage />
          </main>
        </div>
      </RoleContext.Provider>
    )
  }

  return (
    <RoleContext.Provider value={role}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<CompaniesPage />} />
            <Route path="/company/:id" element={<CompaniesPage />} />
            <Route path="/duty" element={<DutyPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </RoleContext.Provider>
  )
}