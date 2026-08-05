import { useEffect, useState } from 'react'
import { onToast } from '../lib/toast'

interface T {
  id: number
  text: string
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<T[]>([])

  useEffect(
    () =>
      onToast((t) => {
        setToasts((prev) => [...prev, t])
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 2500)
      }),
    []
  )

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="glass rounded-lg px-4 py-2 text-sm text-ink animate-rise">
          {t.text}
        </div>
      ))}
    </div>
  )
}