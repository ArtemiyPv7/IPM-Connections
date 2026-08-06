import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { loginWithPassword } from '../features/auth/login'

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
    const ok = await loginWithPassword(password)
    if (ok) return // сессия появилась, App сам переключит экран
    setError('Неверный пароль')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-10 w-full max-w-sm text-center">
        <h1 className="font-semibold text-3xl text-sky mb-2">IPM Connections</h1>
        <p className="text-gray text-sm mb-8">внутренний сервис поддержки</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль доступа"
          autoFocus
          className="w-full glass-input rounded-lg px-4 py-2.5 text-white placeholder:text-gray/60 focus:outline-none focus:border-blue mb-4"
        />
        {error && <p className="text-red text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue text-black font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}