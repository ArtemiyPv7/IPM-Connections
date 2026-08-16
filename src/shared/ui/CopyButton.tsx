import { useState } from 'react'
import { toast } from '../lib/toast'
import { log } from '../../shared/lib/audit'

// Иконка копирования: два квадрата (stroke currentColor).
// SVG в отличие от юникод-⧉ всегда идеально центрирован.
function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

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
      className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded border border-ink/10 text-gray hover:text-sky hover:border-blue transition-colors align-middle"
    >
      {copied ? '✓' : <CopyIcon />}
    </button>
  )
}