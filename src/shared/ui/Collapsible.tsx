import { useState } from 'react'
import type { ReactNode } from 'react'

// Карточка со сворачиваемым телом: плавно через grid-template-rows (0fr → 1fr),
// без JS-измерений высоты. По умолчанию свёрнуто.
export default function Collapsible({
  title,
  action,
  hint,
  children,
}: {
  title: string
  action?: ReactNode
  hint?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          title={open ? 'Свернуть' : 'Развернуть'}
          className="flex items-center gap-2 min-w-0"
        >
          <span className="font-semibold text-ink truncate">{title}</span>
          <span
            className={`text-gray text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3">
            {hint && <p className="text-xs text-gray mb-3">{hint}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}