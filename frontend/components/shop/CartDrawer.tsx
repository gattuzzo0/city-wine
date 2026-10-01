'use client'

import { apiUrl } from '@/lib/shop/apiUrl'
import { upcomingFulfillmentDates } from '@/lib/shop/fulfillment'
import { displayName } from '@/lib/shop/mapping'
import { shippingPesos } from '@/lib/shop/shipping'
import { formatMXN } from '@/lib/wines'
import { AGE_STORAGE_KEY } from '@/lib/shop/constants'
import { useCart } from './CartProvider'
import { useCatalog } from './CatalogProvider'
import { useI18n } from '@/components/i18n'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import type { FulfillmentMethod } from '@/lib/shop/types'

export function CartDrawer() {
  const { t, locale } = useI18n()
  const { lines, open, setOpen, setQty, remove, count } = useCart()
  const { products } = useCatalog()
  const [step, setStep] = useState<1 | 2>(1)
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('pickup')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  const dates = useMemo(() => upcomingFulfillmentDates(fulfillment), [fulfillment, open])
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const resolved = lines
    .map((l) => {
      const product = byId.get(l.productId)
      if (!product) return null
      return { ...l, product }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const subtotal = resolved.reduce((s, l) => s + l.product.pricePesos * l.qty, 0)
  const ship = shippingPesos(subtotal, fulfillment)
  const total = subtotal + ship

  const pay = async () => {
    setError(null)
    if (sessionStorage.getItem(AGE_STORAGE_KEY) !== '1') {
      setError(t.ageRequired)
      return
    }
    if (!date) {
      setError(t.pickDate)
      return
    }
    setPaying(true)
    try {
      const res = await fetch(apiUrl('/api/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: resolved.map((l) => ({ productId: l.productId, qty: l.qty })),
          fulfillment,
          date,
        }),
      })
      const data = (await res.json()) as { url?: string; detail?: string }
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : t.checkoutError)
        return
      }
      if (data.url) window.location.href = data.url
      else setError(t.checkoutError)
    } catch {
      setError(t.checkoutError)
    } finally {
      setPaying(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="bag"
          className="bag-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          layout
        >
          <header className="bag-drawer-head">
            <p className="eyebrow">{t.cart}</p>
            <strong>
              {step === 1 ? t.cartStepBag : t.cartStepShip} · {count}
            </strong>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.close}>
              <X size={18} />
            </button>
          </header>
          {step === 1 ? (
            <div className="bag-drawer-body">
              {resolved.length === 0 ? (
                <div className="bag-empty">
                  <ShoppingBag size={28} />
                  <p>{t.emptyBag}</p>
                  <a href="#cellar" className="text-link" onClick={() => setOpen(false)}>
                    {t.explore}
                  </a>
                </div>
              ) : (
                <ul className="bag-lines">
                  {resolved.map((l) => (
                    <motion.li layout key={l.productId}>
                      {l.product.imageUrl ? <img src={l.product.imageUrl} alt="" /> : <span className="bag-ph" />}
                      <div>
                        <h3>{displayName(l.product, locale)}</h3>
                        <p>{formatMXN(l.product.pricePesos)}</p>
                        {l.product.stock < l.qty ? <small>{t.soldOut}</small> : null}
                        <div className="bag-qty">
                          <button type="button" aria-label={t.qtyMinus} onClick={() => setQty(l.productId, l.qty - 1)}>
                            <Minus size={14} />
                          </button>
                          <span>{l.qty}</span>
                          <button type="button" aria-label={t.qtyPlus} onClick={() => setQty(l.productId, l.qty + 1)}>
                            <Plus size={14} />
                          </button>
                          <button type="button" className="bag-remove" onClick={() => remove(l.productId)}>
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
              {resolved.length > 0 ? (
                <button type="button" className="magnetic" onClick={() => setStep(2)}>
                  {t.continue} · {formatMXN(subtotal)}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="bag-drawer-body">
              <div className="bag-field">
                <span>{t.fulfillment}</span>
                <div className="bag-pills">
                  <button type="button" className={fulfillment === 'pickup' ? 'active' : ''} onClick={() => { setFulfillment('pickup'); setDate('') }}>
                    {t.pickup}
                  </button>
                  <button type="button" className={fulfillment === 'delivery' ? 'active' : ''} onClick={() => { setFulfillment('delivery'); setDate('') }}>
                    {t.delivery}
                  </button>
                </div>
                <small>{fulfillment === 'pickup' ? t.pickupHelp : t.deliveryHelp}</small>
              </div>
              <div className="bag-field">
                <span>{t.fulfillmentDate}</span>
                <div className="bag-dates">
                  {dates.map((d) => (
                    <button type="button" key={d} className={date === d ? 'active' : ''} onClick={() => setDate(d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <p className="bag-ship">
                {t.shipping}: {ship === 0 ? t.freeShipping : formatMXN(ship)}
              </p>
              <p className="bag-total">
                {t.total}: {formatMXN(total)}
              </p>
              {error ? <p className="bag-error">{error}</p> : null}
              <div className="bag-actions">
                <button type="button" onClick={() => setStep(1)}>
                  {t.quizBack}
                </button>
                <button type="button" className="magnetic" disabled={paying} onClick={() => void pay()}>
                  {paying ? t.paying : t.pay}
                </button>
              </div>
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
