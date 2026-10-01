'use client'

import { I18nProvider } from '@/components/i18n'
import { CartProvider } from '@/components/shop/CartProvider'
import { WhatsappFab } from '@/components/shop/WhatsappFab'

export default function ShopEndLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <CartProvider>
        {children}
        <WhatsappFab />
      </CartProvider>
    </I18nProvider>
  )
}
