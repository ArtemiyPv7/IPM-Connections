export function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function dateKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export function daysWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

export function formatDateRu(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}