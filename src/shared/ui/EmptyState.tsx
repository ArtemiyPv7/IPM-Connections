import type { ReactNode } from 'react'

export default function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: string
  title: string
  hint?: ReactNode
}) {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-ink text-sm mb-1">{title}</p>
      {hint && <p className="text-muted text-xs">{hint}</p>}
    </div>
  )
}