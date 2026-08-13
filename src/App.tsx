import CompaniesPage from './pages/CompaniesPage'
import CompanyPage from './pages/CompanyPage'
import DutyPage from './pages/DutyPage'
import ExportPage from './pages/ExportPage'
import LoginPage from './pages/LoginPage'
import LogsPage from './pages/LogsPage'
import Layout from './app/Layout'
import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { log } from './shared/lib/audit'

const MAX_SESSION_MS = 6 * 60 * 60 * 1000 // 6 часов
const SESSION_START_KEY = 'ipm_session_start'

function readSessionStart(): number | null {
  const raw = localStorage.getItem(SESSION_START_KEY)
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : null
}

function sessionExpired(): boolean {
  const start = readSessionStart()
  if (start === null) return false
  return Date.now() - start > MAX_SESSION_MS
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // сессия уже есть, но метки нет (например, первый запуск после обновления) — считаем вход «сейчас»
        if (readSessionStart() === null) {
          localStorage.setItem(SESSION_START_KEY, String(Date.now()))
        }
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
      if (event === 'SIGNED_IN') {
        localStorage.setItem(SESSION_START_KEY, String(Date.now()))
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(SESSION_START_KEY)
      }
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

  // роль текущего пользователя
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

  // пока вкладка открыта — проверяем раз в минуту
  useEffect(() => {
    const t = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session && sessionExpired()) {
        void log('session_expired')
        await supabase.auth.signOut()
      }
    }, 60_000)
    return () => clearInterval(t)
  }, [])

  if (!ready || (loggedIn && role === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray">
        Загрузка…
      </div>
    )
  }

  if (!loggedIn) {
    return <LoginPage />
  }

  // разработчик: только логи, без обычного интерфейса
  if (role === 'dev') {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#06090f]/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-semibold text-lg text-sky">IPM Connections · логи</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray hover:text-red transition-colors"
            >
              Выйти
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          <LogsPage />
        </main>
      </div>
    )
  }

  // admin / support: обычный интерфейс, журнала нет вообще
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CompaniesPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/duty" element={<DutyPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}