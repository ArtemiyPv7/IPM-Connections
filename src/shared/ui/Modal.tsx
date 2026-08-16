import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

// Модальное окно: затемнение + карточка по центру с пружинистым появлением.
// Закрытие: ✕, клик по затемнению, Esc.
// Рендерим через портал в body: предки с transform (animate-pop/animate-rise)
// ломают position:fixed — оверлей прилипал к паспорту и уезжал вниз.
export default function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[92vh] overflow-y-auto card rounded-2xl p-5 animate-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="font-semibold text-lg text-ink min-w-0 truncate">{title}</h2>
          <button
            onClick={onClose}
            title="Закрыть"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-ink/10 text-gray hover:text-red hover:border-red transition-colors text-xs shrink-0"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}