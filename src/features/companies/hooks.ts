import { useState } from 'react'
import {
  FAVORITES_KEY,
  RECENTS_KEY,
  readStringArray,
  writeStringArray,
} from '../../shared/lib/storage'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readStringArray(FAVORITES_KEY))

  function toggle(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      writeStringArray(FAVORITES_KEY, next)
      return next
    })
  }

  return { favorites, toggle }
}

export function useRecents() {
  const [recents] = useState<string[]>(() => readStringArray(RECENTS_KEY))
  return recents
}