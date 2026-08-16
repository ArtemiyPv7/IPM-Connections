import type { ReactNode } from 'react'

// Секция формы: заголовок капсом + сетка 2 колонки (1 на мобильном).
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

// Поле с подписью (и опциональной подсказкой) — заполненная форма остаётся читаемой.
export default function Field({
  label,
  hint,
  className = '',
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="block text-xs text-gray mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray/70 mt-1">{hint}</span>}
    </label>
  )
}