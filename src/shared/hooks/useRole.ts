import { createContext, useContext } from 'react'

export const RoleContext = createContext<string | null>(null)

export function useRole(): string | null {
  return useContext(RoleContext)
}