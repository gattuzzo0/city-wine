import { invMono, invSans } from '@/lib/staffFonts'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${invSans.variable} ${invMono.variable}`}>{children}</div>
}
