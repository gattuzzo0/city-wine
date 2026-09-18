import { describe, expect, it } from 'vitest'
import { clampLineQty, mergeCartLines, parseCheckoutItems } from './cart'
import { earliestFulfillmentDate, validateFulfillmentDate } from './fulfillment'
import { shippingPesos } from './shipping'
import { isStaffEmail } from './staff'
import { nextStockAfterSale } from './stock'
import { whatsappQuestionUrl } from './format'

describe('shippingPesos', () => {
  it('pickup is always 0', () => {
    expect(shippingPesos(0, 'pickup')).toBe(0)
    expect(shippingPesos(1999, 'pickup')).toBe(0)
    expect(shippingPesos(9000, 'pickup')).toBe(0)
  })

  it('delivery charges 180 under 2000 subtotal', () => {
    expect(shippingPesos(1999, 'delivery')).toBe(180)
    expect(shippingPesos(1, 'delivery')).toBe(180)
  })

  it('delivery is free at 2000 and above', () => {
    expect(shippingPesos(2000, 'delivery')).toBe(0)
    expect(shippingPesos(2001, 'delivery')).toBe(0)
  })
})

describe('fulfillment dates America/Mexico_City', () => {
  it('pickup same day before 16:00', () => {
    const now = new Date('2026-09-16T20:00:00.000Z')
    expect(earliestFulfillmentDate('pickup', now)).toBe('2026-09-16')
  })

  it('pickup next calendar day at or after 16:00', () => {
    const now = new Date('2026-09-16T22:00:00.000Z')
    expect(earliestFulfillmentDate('pickup', now)).toBe('2026-09-17')
  })

  it('delivery is +4 business days skipping Sunday', () => {
    const now = new Date('2026-09-16T18:00:00.000Z')
    expect(earliestFulfillmentDate('delivery', now)).toBe('2026-09-21')
  })

  it('rejects dates before earliest', () => {
    const now = new Date('2026-09-16T20:00:00.000Z')
    expect(validateFulfillmentDate('pickup', '2026-09-15', now).ok).toBe(false)
    expect(validateFulfillmentDate('pickup', '2026-09-16', now).ok).toBe(true)
  })

  it('rejects Sunday delivery', () => {
    const now = new Date('2026-09-16T18:00:00.000Z')
    expect(validateFulfillmentDate('delivery', '2026-09-27', now).ok).toBe(false)
    expect(validateFulfillmentDate('delivery', '2026-09-21', now).ok).toBe(true)
  })
})

describe('staff allowlist', () => {
  it('matches trimmed case-insensitive emails', () => {
    expect(isStaffEmail('Ada@City.Wine', 'ada@city.wine, other@x.com')).toBe(true)
    expect(isStaffEmail('nope@x.com', 'ada@city.wine')).toBe(false)
    expect(isStaffEmail('ada@city.wine', '')).toBe(false)
  })
})

describe('cart qty', () => {
  it('caps lines at 12 and rejects empty or bad ids', () => {
    expect(clampLineQty(0)).toBe(1)
    expect(clampLineQty(3)).toBe(3)
    expect(clampLineQty(40)).toBe(12)
    expect(() => parseCheckoutItems([])).toThrow()
    expect(() => parseCheckoutItems([{ productId: '', qty: 1 }])).toThrow()
    expect(parseCheckoutItems([{ productId: 'nebbiolo-casa', qty: 2 }])).toEqual([
      { productId: 'nebbiolo-casa', qty: 2 },
    ])
  })

  it('merges duplicate product ids', () => {
    expect(
      mergeCartLines([
        { productId: 'a', qty: 2 },
        { productId: 'a', qty: 3 },
        { productId: 'b', qty: 1 },
      ]),
    ).toEqual([
      { productId: 'a', qty: 5 },
      { productId: 'b', qty: 1 },
    ])
  })
})

describe('stock decrement', () => {
  it('subtracts only when enough stock', () => {
    expect(nextStockAfterSale(24, 2)).toBe(22)
    expect(() => nextStockAfterSale(1, 2)).toThrow()
    expect(() => nextStockAfterSale(0, 1)).toThrow()
  })
})

describe('whatsappQuestionUrl', () => {
  it('opens the app scheme with Mexico country code', () => {
    const url = whatsappQuestionUrl('55 1234 5678', '  ¿Tienen nebbiolo?  ', 'es')
    expect(url.startsWith('whatsapp://send?phone=525512345678&text=')).toBe(true)
    expect(url.includes('wa.me')).toBe(false)
    expect(url).toContain('Pregunta')
  })

  it('keeps a number that already has 52', () => {
    const url = whatsappQuestionUrl('52 55 1234 5678', 'Hello', 'en')
    expect(url.startsWith('whatsapp://send?phone=525512345678&text=')).toBe(true)
    expect(url).toContain('Question')
  })
})
