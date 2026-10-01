export type FulfillmentMethod = 'pickup' | 'delivery'
export type ProductKind = 'wine' | 'beer' | 'glass'

export type CartLine = { productId: string; qty: number }

export type CatalogLocale = {
  notes?: { es?: string; en?: string }
  description?: { es?: string; en?: string }
  region?: string
  type?: string
  mood?: string
  profile?: Record<string, number>
  brewery?: string
  style?: string
  name?: { es?: string; en?: string }
  detail?: { es?: string; en?: string }
}

export type CatalogProduct = {
  id: string
  kind: ProductKind
  name: string
  pricePesos: number
  stock: number
  active: boolean
  imagePath: string | null
  locale: CatalogLocale
}

export type DateCheck = { ok: true } | { ok: false; detail: string }
