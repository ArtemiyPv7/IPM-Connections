import { useState } from 'react'
import { toast } from '../../lib/toast'
import { log } from '../../shared/lib/audit'

export default function CopyButton({ text, audit }: { text: string; audit?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast('Скопировано')
      void log('copy', audit ?? 'значение')
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // среда без clipboard API — просто игнорируем
    }
  }

  return (
    <button
      onClick={copy}
      title="Скопировать"
      className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded border border-ink/10 text-gray hover:text-sky hover:border-blue transition-colors text-[11px] leading-none"
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}