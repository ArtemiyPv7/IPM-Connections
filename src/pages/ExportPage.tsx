import { useState } from 'react'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { handleError } from '../shared/lib/errors'
import { buildFullWorkbook } from '../features/export/buildWorkbook'
import { log } from '../shared/lib/audit'

export default function ExportPage() {
  const [busy, setBusy] = useState(false)
  usePageTitle('Экспорт · IPM Connections')

  async function onExport() {
    setBusy(true)
    void log('export_full')
    try {
      await buildFullWorkbook()
    } catch (e) {
      handleError(e instanceof Error ? e : { message: String(e) }, 'export all')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full card rounded-xl p-8 text-center">
        <h1 className="font-semibold text-xl text-ink mb-2">Экспорт данных</h1>
        <p className="text-gray text-sm mb-6">
          Полный файл Excel: заводы, подключения с паролями, дополнительные поля, история,
          сотрудники и дежурства.
        </p>
        <button onClick={onExport} disabled={busy} className="btn-primary px-5 py-2.5 rounded-lg font-medium">
          {busy ? 'Готовим…' : 'Скачать .xlsx'}
        </button>
      </div>
    </div>
  )
}