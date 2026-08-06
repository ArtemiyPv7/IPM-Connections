import ExportPage from './pages/ExportPage'
import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import CompaniesPage from './pages/CompaniesPage'
import CompanyPage from './pages/CompanyPage'
import DutyPage from './pages/DutyPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
      setReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray">
        Загрузка…
      </div>
    )
  }

  if (!loggedIn) {
    return <LoginPage />
  }

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