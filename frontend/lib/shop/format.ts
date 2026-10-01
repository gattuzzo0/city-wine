import { CATALOG_BUCKET } from './constants'

export function pesosToStripeAmount(pesos: number): number {
  return Math.trunc(pesos) * 100
}

export function stripeAmountToPesos(amount: number): number {
  return Math.trunc(amount / 100)
}

export function publicProductImage(imagePath: string | null | undefined, supabaseUrl: string): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('/') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  const base = supabaseUrl.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${CATALOG_BUCKET}/${imagePath}`
}

export function assertProductId(id: string): string {
  const v = id.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) || v.length > 80) {
    throw new Error('El id debe ser minúsculas, números y guiones')
  }
  return v
}

export function whatsappPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `52${digits}` : digits
}

export function whatsappQuestionUrl(phone: string, message: string, locale: 'es' | 'en'): string {
  const full = whatsappPhoneDigits(phone)
  const cleaned = message.trim().replace(/\s+/g, ' ')
  const text =
    locale === 'en' ? `City Wine. Question: ${cleaned}` : `City Wine. Pregunta: ${cleaned}`
  return `whatsapp://send?phone=${full}&text=${encodeURIComponent(text)}`
}
