import type { ReactNode } from 'react'
import type { Connection } from '../../../shared/types'

const btn =
  'text-xs px-3 py-1.5 rounded-md border border-ink/10 bg-ink/5 text-ink hover:bg-ink/10 hover:border-blue hover:text-sky transition-colors'

function downloadRdp(conn: Connection, companyName: string) {
  const lines = [
    'screen mode id:i:2',
    'session bpp:i:32',
    'compression:i:1',
    'prompt for credentials:i:1',
    'negotiate security layer:i:1',
    `full address:s:${conn.address ?? ''}`,
  ]
  if (conn.username) lines.push(`username:s:${conn.username}`)
  const blob = new Blob([lines.join('\r\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${companyName} — ${conn.title ?? 'RDP'}.rdp`
  a.click()
  URL.revokeObjectURL(url)
}

// Быстрые действия подключения. Ссылки на конфиги и веб
// живут в секции «Файлы и ссылки» паспорта, здесь не дублируем.
export default function LaunchButtons({
  conn,
  companyName,
}: {
  conn: Connection
  companyName: string
}) {
  const items: ReactNode[] = []
  if (conn.type === 'anydesk' && conn.address) {
    items.push(
      <a key="ad" className={btn} href={`anydesk:${conn.address.replace(/\s/g, '')}`}>
        Открыть в AnyDesk
      </a>
    )
  }
  if (conn.type === 'rdp' && conn.address) {
    items.push(
      <button key="rdp" className={btn} onClick={() => downloadRdp(conn, companyName)}>
        Скачать .rdp
      </button>
    )
  }
  if (items.length === 0) return null
  return <div className="flex flex-wrap gap-2 pt-3">{items}</div>
}