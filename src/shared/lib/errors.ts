import { toast } from './toast'

export function handleError(
  error: { message: string } | null | undefined,
  context = 'запрос к базе'
): boolean {
  if (!error) return false
  console.error(`[IPM] ${context}:`, error.message)
  toast('Ошибка: не удалось выполнить действие')
  return true
}