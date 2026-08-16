import type { Person } from '../../../shared/types'

export function OvertimeDot({ hours, className = '' }: { hours: number; className?: string }) {
  if (hours <= 0) return null
  return <span className={`dot bg-sky ${className}`} title={`Переработка: ${hours} ч`} />
}

export function PersonNameButton({
  person,
  highlighted,
  onToggleHighlight,
  className,
}: {
  person: Person
  highlighted: boolean
  onToggleHighlight: (id: string) => void
  className: string
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggleHighlight(person.id)
      }}
      title="Подсветить все смены"
      className={`${className} ${highlighted ? 'text-sky' : 'text-ink'}`}
    >
      {person.name}
    </button>
  )
}