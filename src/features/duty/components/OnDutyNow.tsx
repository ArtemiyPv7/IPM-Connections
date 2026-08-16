import { useEffect, useState } from 'react'
import { fetchCurrentDutyName } from '../api'

// Компактная плашка «Дежурит: …» для шапки (смена 8:00–8:00 учтена в запросе).
export default function OnDutyNow() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentDutyName().then(setName)
  }, [])

  if (!name) return null
  return (
    <span className="text-xs text-gray whitespace-nowrap">
      Дежурит: <span className="font-medium text-sky">{name}</span>
    </span>
  )
}