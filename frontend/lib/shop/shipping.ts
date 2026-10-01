import { FREE_SHIPPING_OVER_PESOS, SHIPPING_PESOS } from './constants'
import type { FulfillmentMethod } from './types'

export function shippingPesos(subtotalPesos: number, fulfillment: FulfillmentMethod): number {
  if (fulfillment === 'pickup') return 0
  if (subtotalPesos >= FREE_SHIPPING_OVER_PESOS) return 0
  return SHIPPING_PESOS
}
