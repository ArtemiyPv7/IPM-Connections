import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // среда без clipboard API — просто игнорируем
    }
  }

  return (
    <button
      onClick={copy}
      title="Скопировать"
      className="ml-2 text-xs px-2 py-0.5 rounded border border-white/10 text-muted hover:text-sand hover:border-bronze transition-colors"
    >
      {copied ? '✓' : 'копировать'}
    </button>
  )
}