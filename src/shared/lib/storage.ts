export const FAVORITES_KEY = 'ipm_favorites'
export const RECENTS_KEY = 'ipm_recents'
const RECENTS_LIMIT = 6

export function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function writeStringArray(key: string, value: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full или отключён — тихо игнорируем
  }
}

export function pushRecent(id: string): void {
  const list = readStringArray(RECENTS_KEY).filter((x) => x !== id)
  writeStringArray(RECENTS_KEY, [id, ...list].slice(0, RECENTS_LIMIT))
}