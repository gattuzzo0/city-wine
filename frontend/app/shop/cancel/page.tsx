'use client'

import { useI18n } from '@/components/i18n'

export default function CancelPage() {
  const { t } = useI18n()
  return (
    <main className="shop-end">
      <p className="eyebrow">City Wine</p>
      <h1>{t.cancelTitle}</h1>
      <p>{t.cancelText}</p>
      <a className="text-link" href="/">
        {t.cart}
      </a>
    </main>
  )
}
