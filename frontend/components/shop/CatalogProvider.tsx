'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '@/lib/shop/apiUrl'
import type { ShopProduct } from '@/lib/shop/mapping'
import { catalogStill } from '@/lib/wines'

type CatalogState = {
  products: ShopProduct[]
  status: 'loading' | 'ok' | 'error'
}

const CatalogContext = createContext<CatalogState>({ products: [], status: 'loading' })

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CatalogState>({ products: [], status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetch(apiUrl('/api/catalog'))
      .then(async (res) => {
        if (!res.ok) throw new Error('catalog')
        const data = (await res.json()) as { products: ShopProduct[] }
        if (!cancelled) {
          const products = (data.products ?? []).map((p) => ({
            ...p,
            imageUrl: catalogStill(p.id, p.imageUrl),
          }))
          setState({ products, status: 'ok' })
        }
      })
      .catch(() => {
        if (!cancelled) setState({ products: [], status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => state, [state])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
