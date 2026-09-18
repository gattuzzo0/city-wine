'use client'

import { AGE_STORAGE_KEY, CART_STORAGE_KEY } from '@/lib/shop/constants'
import { clampLineQty, mergeCartLines } from '@/lib/shop/cart'
import type { CartLine } from '@/lib/shop/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type CartContextValue = {
  lines: CartLine[]
  open: boolean
  setOpen: (v: boolean) => void
  add: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  count: number
  ageOk: boolean
  confirmAge: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return mergeCartLines(
      parsed
        .filter((l): l is CartLine => Boolean(l) && typeof l === 'object' && typeof (l as CartLine).productId === 'string')
        .map((l) => ({ productId: l.productId, qty: clampLineQty(Number(l.qty)) })),
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [open, setOpen] = useState(false)
  const [ageOk, setAgeOk] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLines(readLines())
    setAgeOk(sessionStorage.getItem(AGE_STORAGE_KEY) === '1')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  }, [lines, ready])

  const add = useCallback((productId: string, qty = 1) => {
    setLines((prev) => mergeCartLines([...prev, { productId, qty }]))
    setOpen(true)
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) {
      setLines((prev) => prev.filter((l) => l.productId !== productId))
      return
    }
    setLines((prev) => mergeCartLines(prev.map((l) => (l.productId === productId ? { ...l, qty } : l))))
  }, [])

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const confirmAge = useCallback(() => {
    sessionStorage.setItem(AGE_STORAGE_KEY, '1')
    setAgeOk(true)
  }, [])

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines])

  const value = useMemo(
    () => ({ lines, open, setOpen, add, setQty, remove, clear, count, ageOk, confirmAge }),
    [lines, open, add, setQty, remove, clear, count, ageOk, confirmAge],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}
