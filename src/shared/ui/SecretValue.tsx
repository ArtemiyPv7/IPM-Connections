import { useState } from 'react'

// Маскирует секрет: ••••••••, 👁 показывает/скрывает. Копирование — снаружи (CopyButton).
export default function SecretValue({ value }: { value: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <span className="text-ink break-all font-mono text-[13px]">
        {visible ? value : '••••••••'}
      </span>
      <button
        onClick={() => setVisible((v) => !v)}
        title={visible ? 'Скрыть' : 'Показать'}
        className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded border border-ink/10 text-[11px] leading-none transition-colors ${
          visible ? 'text-sky border-blue' : 'text-gray hover:text-sky hover:border-blue'
        }`}
      >
        👁
      </button>
    </>
  )
}