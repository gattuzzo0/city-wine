'use client'

import { useCart } from '@/components/shop/CartProvider'
import { useI18n } from '@/components/i18n'
import { apiUrl } from '@/lib/shop/apiUrl'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessBody() {
  const { t } = useI18n()
  const { clear } = useCart()
  const params = useSearchParams()
  const [state, setState] = useState<{ paid: boolean; email: string | null } | 'loading' | 'error'>('loading')

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (!sessionId) {
      setState('error')
      return
    }
    let cancelled = false
    fetch(`${apiUrl('/api/checkout')}?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('pay')
        const data = (await res.json()) as { paid: boolean; email: string | null }
        if (cancelled) return
        setState(data)
        if (data.paid) clear()
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [params, clear])

  return (
    <main className="shop-end">
      <p className="eyebrow">City Wine</p>
      {state === 'loading' ? <div className="inv-skel" aria-label={t.catalogLoading}><span /><span /></div> : null}
      {state === 'error' ? <h1>{t.checkoutError}</h1> : null}
      {typeof state === 'object' && state.paid ? (
        <>
          <h1>{t.successTitle}</h1>
          <p>
            {t.successText} {state.email ?? 'tu correo'}
          </p>
        </>
      ) : null}
      {typeof state === 'object' && !state.paid ? <h1>{t.cancelTitle}</h1> : null}
      <a className="text-link" href="/">
        {t.explore}
      </a>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessBody />
    </Suspense>
  )
}
