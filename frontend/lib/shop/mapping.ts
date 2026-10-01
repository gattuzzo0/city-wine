import type { CatalogLocale, CatalogProduct, ProductKind } from './types'
import { publicProductImage } from './format'

export type ShopProduct = {
  id: string
  kind: ProductKind
  name: string
  pricePesos: number
  stock: number
  active: boolean
  imageUrl: string | null
  locale: CatalogLocale
}

function asKind(v: unknown): ProductKind {
  if (v === 'wine' || v === 'beer' || v === 'glass') return v
  throw new Error('kind inválido')
}

export function productFromRow(row: Record<string, unknown>): CatalogProduct {
  const locale = row.locale && typeof row.locale === 'object' && !Array.isArray(row.locale) ? (row.locale as CatalogLocale) : {}
  return {
    id: String(row.id),
    kind: asKind(row.kind),
    name: String(row.name ?? ''),
    pricePesos: Number(row.price_pesos),
    stock: Number(row.stock),
    active: Boolean(row.active),
    imagePath: row.image_path == null ? null : String(row.image_path),
    locale,
  }
}

export function toShopProduct(p: CatalogProduct, supabaseUrl: string): ShopProduct {
  return {
    id: p.id,
    kind: p.kind,
    name: p.name,
    pricePesos: p.pricePesos,
    stock: p.stock,
    active: p.active,
    imageUrl: publicProductImage(p.imagePath, supabaseUrl),
    locale: p.locale,
  }
}

export function displayName(p: { name: string; locale: CatalogLocale }, locale: 'es' | 'en'): string {
  if (locale === 'en' && p.locale.name?.en) return p.locale.name.en
  return p.locale.name?.es || p.name
}

export function displayDetail(p: { locale: CatalogLocale }, locale: 'es' | 'en'): string {
  const notes = p.locale.notes?.[locale] ?? p.locale.notes?.es
  const detail = p.locale.detail?.[locale] ?? p.locale.detail?.es
  return detail || notes || ''
}
