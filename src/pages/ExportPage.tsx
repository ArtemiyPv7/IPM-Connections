import { useState } from 'react'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { handleError } from '../shared/lib/errors'
import { buildFullWorkbook } from '../features/export/buildWorkbook'

export default function ExportPage() {
  const [busy, setBusy] = useState(false)

  usePageTitle('Экспорт — IPM Connections')

  async function onExport() {
    setBusy(true)
    try {
      await buildFullWorkbook()
    } catch (e) {
      handleError(e instanceof Error ? e : { message: String(e) }, 'export all')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md glass rounded-xl p-8 text-center">
      <h1 className="font-semibold text-xl text-white mb-2">Экспорт данных</h1>
      <p className="text-gray text-sm mb-6">
        Полный файл Excel: заводы, подключения с паролями, дополнительные поля, история, сотрудники и дежурства.
      </p>
      <button
        onClick={onExport}
        disabled={busy}
        className="px-5 py-2.5 rounded-lg bg-blue text-black font-medium transition-colors disabled:opacity-50"
      >
        {busy ? 'Готовим…' : 'Скачать .xlsx'}
      </button>
    </div>
  )
}