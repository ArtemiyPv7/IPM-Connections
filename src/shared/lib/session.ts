const MAX_SESSION_MS = 6 * 60 * 60 * 1000
const SESSION_START_KEY = 'ipm_session_start'

export function readSessionStart(): number | null {
  const raw = localStorage.getItem(SESSION_START_KEY)
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : null
}

export function markSessionStart(): void {
  localStorage.setItem(SESSION_START_KEY, String(Date.now()))
}

export function clearSessionStart(): void {
  localStorage.removeItem(SESSION_START_KEY)
}

export function sessionExpired(): boolean {
  const start = readSessionStart()
  if (start === null) return false
  return Date.now() - start > MAX_SESSION_MS
}