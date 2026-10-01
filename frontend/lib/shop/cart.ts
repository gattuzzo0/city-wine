import { MAX_LINE_QTY } from './constants'
import type { CartLine } from './types'

export function clampLineQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1
  return Math.min(MAX_LINE_QTY, Math.max(1, Math.trunc(qty)))
}

export function mergeCartLines(lines: CartLine[]): CartLine[] {
  const order: string[] = []
  const qty = new Map<string, number>()
  for (const line of lines) {
    const id = line.productId.trim()
    if (!id) continue
    if (!qty.has(id)) order.push(id)
    qty.set(id, clampLineQty((qty.get(id) ?? 0) + clampLineQty(line.qty)))
  }
  return order.map((productId) => ({ productId, qty: qty.get(productId) ?? 1 }))
}

export function parseCheckoutItems(items: unknown): CartLine[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El carrito está vacío')
  }
  const lines: CartLine[] = items.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Línea de carrito inválida')
    const productId = 'productId' in raw && typeof raw.productId === 'string' ? raw.productId.trim() : ''
    const qty = 'qty' in raw ? Number(raw.qty) : NaN
    if (!productId) throw new Error('Falta productId')
    return { productId, qty: clampLineQty(qty) }
  })
  const merged = mergeCartLines(lines)
  if (merged.length === 0) throw new Error('El carrito está vacío')
  return merged
}
