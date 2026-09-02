'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { bindScrollFx } from '@/components/scroll-fx'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children, active = true }: { children: React.ReactNode; active?: boolean }) {
  useEffect(() => {
    if (!active) return
    const lenis = new Lenis({ overscroll: false })
    lenis.on('scroll', (e: { scroll: number }) => {
      if (e.scroll < 0) {
        lenis.scrollTo(0, { immediate: true })
        return
      }
      ScrollTrigger.update()
    })
    const tick = (time: number) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    const ctx = gsap.context(() => { bindScrollFx() })
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [active])
  return <>{children}</>
}
