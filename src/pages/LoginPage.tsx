import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { supabase } from '../lib/supabase'

const ACCOUNTS = ['admin@ipm.local', 'support@ipm.local']

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('Вход — IPM Connections')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    for (const email of ACCOUNTS) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) return // сессия появилась, App сам переключит экран
    }

    setError('Неверный пароль')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-10 w-full max-w-sm text-center"
      >
        <h1 className="font-semibold text-3xl text-sand mb-2">IPM Connections</h1>
        <p className="text-muted text-sm mb-8">внутренний сервис поддержки</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль доступа"
          autoFocus
          className="w-full glass-input rounded-lg px-4 py-2.5 text-ink placeholder:text-muted/60 focus:outline-none focus:border-bronze mb-4"
        />

        {error && <p className="text-terra text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
            className="w-full bg-bronze text-bg font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}