import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [message, setMessage] = useState('Проверяю соединение…')

  useEffect(() => {
    async function check() {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'support@ipm.local',
        password: 'support123',
      })

      if (error) {
        setMessage('Ошибка входа: ' + error.message)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      const { count } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      setMessage(
        `Всё работает! Роль: ${profile?.role ?? 'не найдена'}, заводов в базе: ${count ?? 0}`
      )
    }

    check()
  }, [])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="bg-card border border-line rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="font-serif text-3xl text-sand mb-2">IPM Connections</h1>
        <p className="text-muted text-sm mb-6">внутренний сервис поддержки</p>
        <p className="text-ink">{message}</p>
      </div>
    </div>
  )
}