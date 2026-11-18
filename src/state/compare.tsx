import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const KEY = 'atlas:comparar'

interface CompareState {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const Ctx = createContext<CompareState | null>(null)

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  }, [ids])

  const add = useCallback((id: string) => {
    setIds((cur) => (cur.includes(id) ? cur : [...cur, id]))
  }, [])
  const remove = useCallback((id: string) => setIds((cur) => cur.filter((x) => x !== id)), [])
  const clear = useCallback(() => setIds([]), [])

  const value = useMemo(
    () => ({ ids, add, remove, clear }),
    [ids, add, remove, clear],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCompare(): CompareState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCompare precisa estar dentro de CompareProvider')
  return v
}
