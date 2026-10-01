import { DELIVERY_LEAD_BUSINESS_DAYS, PICKUP_CUTOFF_HOUR, SHOP_TZ } from './constants'
import type { DateCheck, FulfillmentMethod } from './types'

const YMD = /^\d{4}-\d{2}-\d{2}$/

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value ?? ''
}

export function mexicoCityParts(now: Date): { ymd: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const ymd = `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}`
  return { ymd, hour: Number(part(parts, 'hour')) }
}

function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

function weekdayUtcYmd(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 18, 0, 0)).getUTCDay()
}

function addBusinessDaysSkipSunday(ymd: string, n: number): string {
  let cur = ymd
  let added = 0
  while (added < n) {
    cur = addCalendarDays(cur, 1)
    if (weekdayUtcYmd(cur) !== 0) added += 1
  }
  return cur
}

export function earliestFulfillmentDate(fulfillment: FulfillmentMethod, now: Date = new Date()): string {
  const { ymd, hour } = mexicoCityParts(now)
  if (fulfillment === 'pickup') {
    return hour >= PICKUP_CUTOFF_HOUR ? addCalendarDays(ymd, 1) : ymd
  }
  return addBusinessDaysSkipSunday(ymd, DELIVERY_LEAD_BUSINESS_DAYS)
}

export function validateFulfillmentDate(
  fulfillment: FulfillmentMethod,
  date: string,
  now: Date = new Date(),
): DateCheck {
  if (!YMD.test(date)) return { ok: false, detail: 'Fecha inválida' }
  const min = earliestFulfillmentDate(fulfillment, now)
  if (date < min) {
    return {
      ok: false,
      detail: fulfillment === 'pickup' ? 'La fecha de recolección no es válida' : 'La fecha de entrega no es válida',
    }
  }
  if (fulfillment === 'delivery' && weekdayUtcYmd(date) === 0) {
    return { ok: false, detail: 'No entregamos en domingo' }
  }
  return { ok: true }
}

export function upcomingFulfillmentDates(fulfillment: FulfillmentMethod, now: Date = new Date(), count = 14): string[] {
  const min = earliestFulfillmentDate(fulfillment, now)
  const dates: string[] = []
  let cur = min
  let guard = 0
  while (dates.length < count && guard < 60) {
    guard += 1
    if (validateFulfillmentDate(fulfillment, cur, now).ok) dates.push(cur)
    cur = addCalendarDays(cur, 1)
  }
  return dates
}
