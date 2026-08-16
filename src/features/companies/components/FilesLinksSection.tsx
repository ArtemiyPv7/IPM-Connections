import type { Connection } from '../../../shared/types'

// Собирает конфиги и веб-ссылки всех подключений завода в одну секцию.
// Если ссылок нет — секция не рендерится вовсе.
export default function FilesLinksSection({ connections }: { connections: Connection[] }) {
  const items: { key: string; label: string; url: string }[] = []
  for (const c of connections) {
    const name = c.title ?? c.type
    if (c.config_url) items.push({ key: `${c.id}-cfg`, label: `${name} · файл конфига`, url: c.config_url })
    if (c.web_url) items.push({ key: `${c.id}-web`, label: `${name} · веб-ссылка`, url: c.web_url })
  }
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray mb-3">
        Файлы и ссылки
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <a
            key={it.key}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="chip text-gray hover:text-sky hover:border-blue transition-colors"
          >
            🔗 {it.label}
          </a>
        ))}
      </div>
    </section>
  )
}