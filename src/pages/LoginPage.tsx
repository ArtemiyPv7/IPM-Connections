import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { loginWithPassword } from '../features/auth/login'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  usePageTitle('Вход · IPM Connections')

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
      {/* autoComplete="off" + new-password на поле: браузер не подставляет
          и не предлагает сохранить пароль (общие рабочие машины). */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="card rounded-2xl p-10 w-full max-w-sm text-center"
      >
        <h1 className="font-semibold text-3xl text-sky mb-2">IPM Connections</h1>
        <p className="text-gray text-sm mb-8">внутренний сервис поддержки</p>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль доступа"
            autoComplete="new-password"
            autoFocus
            className="w-full field rounded-lg px-4 py-2.5 pr-11 text-ink placeholder:text-gray/50 focus:outline-none focus:border-blue"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-opacity ${
              showPassword ? 'text-sky opacity-100' : 'text-gray opacity-60 hover:opacity-100'
            }`}
          >
            👁
          </button>
        </div>
        {error && <p className="text-red text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary font-medium rounded-lg py-2.5 disabled:opacity-50"
        >
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}