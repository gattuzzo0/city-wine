import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function bindScrollFx() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.fromTo('.hero-copy, .scroll-label', { y: 0, autoAlpha: 1 }, {
    y: -90, autoAlpha: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: 1 },
  })

  gsap.utils.toArray<HTMLElement>('.section-head, .split-head').forEach((el) => {
    gsap.from(el, {
      y: 90, autoAlpha: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    })
  })

  gsap.from('.atmos-list button', {
    x: -50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.atmos-list', start: 'top 80%' },
  })
  gsap.fromTo('.atmos-visual img', { scale: 1.3, yPercent: -10 }, {
    scale: 1, yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.atmos-visual', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
  })

  gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((el, i) => {
    gsap.from(el, {
      x: i % 2 ? 90 : -90, autoAlpha: 0, duration: 1.05, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    })
  })

  gsap.from('.quiz > div:first-child', {
    x: -70, autoAlpha: 0, duration: 1.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.quiz', start: 'top 75%' },
  })
  gsap.from('.quiz-box', {
    x: 70, autoAlpha: 0, duration: 1.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.quiz', start: 'top 75%' },
  })

  ScrollTrigger.batch('.story-card', {
    start: 'top 88%',
    onEnter: (els) => gsap.fromTo(els, { y: 120, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, stagger: 0.14, duration: 1.15, ease: 'power3.out', overwrite: 'auto',
    }),
  })
  gsap.utils.toArray<HTMLElement>('.story-card img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -14, scale: 1.18 }, {
      yPercent: 14, scale: 1, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    })
  })

  gsap.from('.featured > div', {
    x: -80, autoAlpha: 0, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.featured', start: 'top 75%' },
  })
  gsap.fromTo('.featured img', { y: 100, rotate: -8 }, {
    y: -50, rotate: 6, ease: 'none',
    scrollTrigger: { trigger: '.featured', start: 'top bottom', end: 'bottom top', scrub: 1.3 },
  })

  ScrollTrigger.batch('.product', {
    start: 'top 90%',
    onEnter: (els) => gsap.fromTo(els, { y: 80, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.95, ease: 'power3.out', overwrite: 'auto',
    }),
  })

  gsap.utils.toArray<HTMLElement>('.split-head img').forEach((img) => {
    gsap.fromTo(img, { scale: 1.22, yPercent: -8 }, {
      scale: 1, yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    })
  })

  gsap.utils.toArray<HTMLElement>('.line-products').forEach((row) => {
    gsap.from(row.children, {
      y: 60, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 85%' },
    })
  })

  gsap.from('.about img', {
    x: -90, autoAlpha: 0, scale: 1.12, duration: 1.3, ease: 'power3.out',
    scrollTrigger: { trigger: '.about', start: 'top 75%' },
  })
  gsap.from('.about > div', {
    x: 90, autoAlpha: 0, duration: 1.3, ease: 'power3.out',
    scrollTrigger: { trigger: '.about', start: 'top 75%' },
  })

  gsap.from('.footer > div, .footer > small', {
    y: 60, autoAlpha: 0, stagger: 0.16, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 92%' },
  })
}
