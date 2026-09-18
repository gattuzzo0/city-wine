import { invMono, invSans } from '@/lib/staffFonts'

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${invSans.variable} ${invMono.variable}`}>{children}</div>
}
