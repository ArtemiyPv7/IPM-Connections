// Разбор сырой строки торговых групп:
// «4000 - milk, 4001 - softdrinks» или просто «milk, sweets».

// Части как записаны — для паспорта: «4000 - milk» остаётся «4000 - milk».
export function groupParts(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

// Только названия — для списка: «4000 - milk» → «milk».
export function groupNames(raw: string | null): string[] {
  return groupParts(raw)
    .map((part) => (part.includes('-') ? part.split('-').slice(1).join('-').trim() : part))
    .filter(Boolean)
}