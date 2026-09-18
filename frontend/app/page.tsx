'use client'
import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Menu, ArrowDownRight, ChevronRight, X } from 'lucide-react'
import { I18nProvider, useI18n } from '@/components/i18n'
import { CustomCursor } from '@/components/custom-cursor'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Eyebrow, WordReveal, MagneticButton } from '@/components/primitives'
import { beers as fallbackBeers, catalogStill, formatMXN, glassware as fallbackGlass, STAGE_IMAGES, wines } from '@/lib/wines'
import { generateRecommendationReason, getWineRecommendation, QUIZ_QUESTIONS, wineTags } from '@/lib/quizRecommend'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { CartProvider, useCart } from '@/components/shop/CartProvider'
import { CatalogProvider, useCatalog } from '@/components/shop/CatalogProvider'
import { WhatsappFab } from '@/components/shop/WhatsappFab'
import { displayDetail, displayName } from '@/lib/shop/mapping'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7F74eb8acoX9X3biRjJWZUX4eBqfbg.png'
const NAV_HREFS = ['#cellar', '#beers', '#glassware', '#stories', '#about'] as const

function Logo() { const { t } = useI18n(); return <a href="#top" className="logo" aria-label="City Wine"><img src={logoUrl} alt={t.logoAlt} /></a> }
function Nav() {
  const { t, locale, toggle } = useI18n()
  const { count, setOpen } = useCart()
  const [menu, setMenu] = useState(false)
  return (
    <header className="nav">
      <Logo />
      <nav className={menu ? 'nav-links open' : 'nav-links'}>
        {t.nav.map((n, i) => (
          <a key={n} href={NAV_HREFS[i]} onClick={() => setMenu(false)}>
            {n}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="cart-btn" aria-label={t.cart} onClick={() => setOpen(true)}>
          <ShoppingBag size={17} />
          <sup>{count}</sup>
        </button>
        <button className="locale" onClick={toggle}>
          {locale === 'es' ? 'EN' : 'ES'}
        </button>
        <button className="menu" onClick={() => setMenu(!menu)} aria-label={t.menu}>
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}
function Intro({ onEnter, onGone }: { onEnter: () => void; onGone: () => void }) {
  const { t } = useI18n()
  const { confirmAge } = useCart()
  const [out, setOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (gone) return
    const html = document.documentElement
    html.classList.add('intro-lock')
    const block = (e: Event) => {
      e.preventDefault()
    }
    const blockKeys = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', block, { passive: false })
    window.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('keydown', blockKeys)
    return () => {
      html.classList.remove('intro-lock')
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('keydown', blockKeys)
    }
  }, [gone])

  if (gone) return null
  return (
    <div
      className={out ? 'intro out' : 'intro'}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && out) {
          setGone(true)
          onGone()
        }
      }}
    >
      <img className="intro-logo" src={logoUrl} alt={t.logoAlt} />
      <p className="eyebrow">City Wine · 1998—2026</p>
      <h1>{t.introTitle}</h1>
      <p className="intro-age">{t.enterAge}</p>
      <MagneticButton
        onClick={() => {
          if (out) return
          confirmAge()
          setOut(true)
          onEnter()
        }}
      >
        {t.enter} <ArrowDownRight size={16} />
      </MagneticButton>
      <span className="intro-line" />
    </div>
  )
}
function Hero({ playTitle }: { playTitle: boolean }) { const { t, locale } = useI18n(); return <section id="top" className="hero"><div className="hero-image"/><Eyebrow>{t.heroEyebrow}</Eyebrow><div className="hero-copy"><h1><WordReveal key={locale} play={playTitle}>{t.heroTitle}</WordReveal></h1><p>{t.heroText}</p><div className="button-row"><MagneticButton href="#cellar">{t.explore} <ArrowDownRight size={16}/></MagneticButton><a className="text-link" href="#quiz">{t.recommend} <ChevronRight size={15}/></a></div></div></section> }
function Guide() { const { t } = useI18n(); return <section id="guide" className="section guide"><div className="section-head"><h2>{t.guideTitle}</h2><p>{t.guideIntro}</p></div><div className="timeline">{t.guide.map(([num, title, text], i) => <div className="timeline-item" key={num}><span className="timeline-num">{num}</span><img src={i % 2 ? '/images/city-wine/cellar.png' : '/images/city-wine/glassware.png'} alt={title}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section> }
function Quiz() {
  const { t, locale } = useI18n()
  const { add } = useCart()
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<string[]>([])
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'ask' | 'searching' | 'found'>('ask')
  const rec = picks.length === 4 ? getWineRecommendation(picks, wines) : null
  const q = QUIZ_QUESTIONS[step]
  const selected = pickedId ?? picks[step]
  const pickTimer = useRef(0)

  useEffect(() => {
    if (phase !== 'searching') return
    const id = window.setTimeout(() => setPhase('found'), 1600)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => () => window.clearTimeout(pickTimer.current), [])

  const pick = (id: string) => {
    if (pickedId || phase !== 'ask') return
    setPickedId(id)
    const next = [...picks.slice(0, step), id]
    window.clearTimeout(pickTimer.current)
    pickTimer.current = window.setTimeout(() => {
      setPicks(next)
      setPickedId(null)
      if (step < QUIZ_QUESTIONS.length - 1) setStep(step + 1)
      else setPhase('searching')
    }, 380)
  }

  const back = () => {
    if (phase !== 'ask' || step === 0) return
    window.clearTimeout(pickTimer.current)
    setPickedId(null)
    setStep(step - 1)
  }

  const restart = () => {
    window.clearTimeout(pickTimer.current)
    setStep(0)
    setPicks([])
    setPickedId(null)
    setPhase('ask')
  }

  return (
    <section id="quiz" className="quiz section">
      <div>
        <Eyebrow>{t.quizEyebrow}</Eyebrow>
        <h2>{t.quizTitle}</h2>
        <p>{t.quizText}</p>
      </div>
      {phase === 'found' && rec ? (
        <div className="quiz-result">
          <img src={rec.best.wine.image} alt={rec.best.wine.name} />
          <div>
            <Eyebrow>{t.quizFound}</Eyebrow>
            <h3>{rec.best.wine.name}</h3>
            <p>{rec.best.wine.description[locale]}</p>
            <strong>{rec.best.match}% {t.quizMatch}</strong>
            <div className="quiz-tags">{wineTags(rec.best.wine, rec.client, locale).join(' · ')}</div>
            <p className="quiz-reason">{generateRecommendationReason(picks, rec.best.wine, locale)}</p>
            <button type="button" className="product-add" onClick={() => add(rec.best.wine.id)}>
              {t.addToCart}
            </button>
            <button type="button" className="quiz-again" onClick={restart}>{t.quizRestart}</button>
          </div>
        </div>
      ) : (
        <div className="quiz-box">
          {phase === 'searching' ? (
            <p>{t.quizSearching}</p>
          ) : q ? (
            <>
              <p>{locale === 'en' ? q.en : q.es}</p>
              {q.options.map((o) => (
                <button key={o.id} className={selected === o.id ? 'picked' : ''} onClick={() => pick(o.id)}>
                  {locale === 'en' ? o.en : o.es}
                  <ChevronRight size={16} />
                </button>
              ))}
            </>
          ) : null}
          {phase === 'ask' && (
            <div className="quiz-nav">
              <button type="button" onClick={back} disabled={step === 0}>{t.quizBack}</button>
              <button type="button" onClick={restart}>{t.quizRestart}</button>
            </div>
          )}
          <small>{t.start} · 0{phase === 'ask' ? step + 1 : 4} / 04</small>
        </div>
      )}
    </section>
  )
}
const OPENED_OPTIONS = [24, 12, 2] as const
function nextOpened(count: number) {
  const i = OPENED_OPTIONS.indexOf(count as (typeof OPENED_OPTIONS)[number])
  return OPENED_OPTIONS[(i + 1) % OPENED_OPTIONS.length]
}
function Stories() {
  const { t } = useI18n()
  const [opened, setOpened] = useState<(typeof OPENED_OPTIONS)[number]>(24)
  return (
    <section id="stories" className="stories section">
      <div className="section-head">
        <Eyebrow>{t.storyEyebrow}</Eyebrow>
        <h2>{t.storyTitle}</h2>
      </div>
      <div className="story-grid">
        {t.storyStages.map((stage, i) => {
          const n = String(i + 1).padStart(2, '0')
          const photo =
            i === 6 ? (
              <picture>
                <source media="(min-width: 801px)" srcSet="/images/city-wine/consign-07-pay-wide.png" />
                <img src={STAGE_IMAGES[i] ?? STAGE_IMAGES[0]} alt={stage} />
              </picture>
            ) : (
              <img src={STAGE_IMAGES[i] ?? STAGE_IMAGES[0]} alt={stage} />
            )
          const inner = (
            <>
              {photo}
              <div className="story-overlay">
                <span>{n}</span>
                <h3>{stage}</h3>
                {i === 4 ? (
                  <button
                    type="button"
                    className="counter"
                    onClick={() => setOpened(nextOpened)}
                  >
                    {opened} {t.storyOpened}
                  </button>
                ) : null}
                {i === 6 ? <strong>{t.storyPay.replace('{n}', String(opened))}</strong> : null}
              </div>
            </>
          )
          if (i === 1) {
            return (
              <a key={stage} href="#cellar" className="story-card">
                {inner}
              </a>
            )
          }
          return (
            <article key={stage} className={i === 4 ? 'story-card bottle-board' : 'story-card'}>
              {inner}
            </article>
          )
        })}
      </div>
    </section>
  )
}
function Cellar() {
  const { t, locale } = useI18n()
  const { add } = useCart()
  const { products, status } = useCatalog()
  const [filter, setFilter] = useState('all')
  const filters = [
    { id: 'all', label: t.all },
    { id: 'Tinto', label: t.typeRed },
    { id: 'Blanco', label: t.typeWhite },
    { id: 'Rosado', label: t.typeRose },
  ] as const
  const winesLive = products.filter((p) => p.kind === 'wine')
  const listSource =
    winesLive.length > 0
      ? winesLive
      : wines.map((w) => ({
          id: w.id,
          kind: 'wine' as const,
          name: w.name,
          pricePesos: w.price,
          stock: 24,
          active: true,
          imageUrl: w.image,
          locale: { region: w.region, type: w.type, notes: w.notes },
        }))
  const list = filter === 'all' ? listSource : listSource.filter((w) => w.locale.type === filter)
  return (
    <section id="cellar" className="section cellar">
      <div className="section-head">
        <div>
          <Eyebrow>{t.cellarEyebrow}</Eyebrow>
          <h2>{t.cellarTitle}</h2>
          <p>{t.cellarIntro}</p>
        </div>
        <div className="filters">
          {filters.map((f) => (
            <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {status === 'loading' ? (
        <div className="product-grid" aria-label={t.catalogLoading}>
          <div className="product skel" />
          <div className="product skel" />
          <div className="product skel" />
        </div>
      ) : null}
      {status === 'error' ? <p className="catalog-error">{t.catalogError}</p> : null}
      {status !== 'loading' ? (
        <div className="product-grid">
          {list.map((w) => (
            <article className="product" key={w.id}>
              <div className="product-image">
                {w.imageUrl ? <img src={w.imageUrl} alt={w.name} /> : null}
              </div>
              <div className="product-meta">
                <span>
                  {[w.locale.region, w.locale.type === 'Tinto' ? t.typeRed : w.locale.type === 'Blanco' ? t.typeWhite : w.locale.type === 'Rosado' ? t.typeRose : w.locale.type].filter(Boolean).join(' · ')}
                </span>
                <h3>{w.name}</h3>
                <p>{w.locale.notes?.[locale] ?? ''}</p>
                <div className="product-buy">
                  <strong>{formatMXN(w.pricePesos)} MXN</strong>
                  <button type="button" className="product-add" disabled={w.stock < 1} onClick={() => add(w.id)}>
                    {t.addToCart}
                  </button>
                </div>
                {w.stock < 1 ? <small>{t.soldOut}</small> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
function LineCard({
  id,
  name,
  kicker,
  detail,
  pricePesos,
  stock,
  image,
  addLabel,
  soldOut,
}: {
  id: string
  name: string
  kicker: string
  detail: string
  pricePesos: number
  stock: number
  image: string
  addLabel: string
  soldOut: string
}) {
  const { add } = useCart()
  return (
    <article className="product">
      <div className="product-image">
        {image ? <img src={image} alt={name} /> : null}
      </div>
      <div className="product-meta">
        <span>{kicker}</span>
        <h3>{name}</h3>
        <p>{detail}</p>
        <div className="product-buy">
          <strong>{formatMXN(pricePesos)} MXN</strong>
          <button type="button" className="product-add" disabled={stock < 1} onClick={() => add(id)}>
            {addLabel}
          </button>
        </div>
        {stock < 1 ? <small>{soldOut}</small> : null}
      </div>
    </article>
  )
}
function SimpleProducts() {
  const { t, locale } = useI18n()
  const { products, status } = useCatalog()
  const beers = products.filter((p) => p.kind === 'beer')
  const glasses = products.filter((p) => p.kind === 'glass')
  const beerCards =
    status === 'ok' && beers.length
      ? beers.map((b) => ({
          id: b.id,
          name: b.name,
          kicker: b.locale.brewery ?? '',
          detail: b.locale.style ?? '',
          pricePesos: b.pricePesos,
          stock: b.stock,
          image: catalogStill(b.id, b.imageUrl),
        }))
      : fallbackBeers.map((b) => ({
          id: b.id,
          name: b.name,
          kicker: b.brewery,
          detail: b.style,
          pricePesos: b.price,
          stock: 24,
          image: b.image,
        }))
  const glassCards =
    status === 'ok' && glasses.length
      ? glasses.map((g) => ({
          id: g.id,
          name: displayName(g, locale),
          kicker: t.objects,
          detail: displayDetail(g, locale),
          pricePesos: g.pricePesos,
          stock: g.stock,
          image: catalogStill(g.id, g.imageUrl),
        }))
      : fallbackGlass.map((g) => ({
          id: g.id,
          name: g.name[locale],
          kicker: t.objects,
          detail: g.detail[locale],
          pricePesos: g.price,
          stock: 24,
          image: g.image,
        }))
  return (
    <>
      <section id="beers" className="section beers">
        <div className="split-head beers-hero">
          <div className="split-visual">
            <img src="/images/city-wine/beer.png" alt={t.beersAlt} />
            <div className="beers-hero-copy">
              <Eyebrow>{t.beersEyebrow}</Eyebrow>
              <h2>{t.beers}</h2>
            </div>
          </div>
        </div>
        <div className="line-products">
          {beerCards.map((b) => (
            <LineCard key={b.id} {...b} addLabel={t.addToCart} soldOut={t.soldOut} />
          ))}
        </div>
      </section>
      <section id="glassware" className="section glassware">
        <div className="split-head">
          <div>
            <Eyebrow>{t.glassEyebrow}</Eyebrow>
            <h2>{t.glass}</h2>
          </div>
        </div>
        <div className="line-products">
          {glassCards.map((g) => (
            <LineCard key={g.id} {...g} addLabel={t.addToCart} soldOut={t.soldOut} />
          ))}
        </div>
      </section>
    </>
  )
}
function About() { const { t } = useI18n(); return <section id="about" className="about section"><img src="/images/city-wine/cellar.png" alt={t.aboutAlt}/><div><Eyebrow>{t.aboutEyebrow}</Eyebrow><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><a className="text-link">{t.aboutCta} <ChevronRight size={15}/></a></div></section> }
function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Logo />
        <p>{t.brandLine}</p>
      </div>
      <nav className="footer-links" aria-label="City Wine">
        {t.nav.map((label, i) => (
          <a key={label} href={NAV_HREFS[i]}>{label}</a>
        ))}
      </nav>
      <small>© 2026 City Wine · {t.brandLine}. {t.footer}</small>
    </footer>
  )
}
function App() {
  const [entered, setEntered] = useState(false)
  const [introGone, setIntroGone] = useState(false)
  return (
    <SmoothScroll active={introGone}>
      <CustomCursor />
      <Intro onEnter={() => setEntered(true)} onGone={() => setIntroGone(true)} />
      <Nav />
      <CartDrawer />
      <main>
        <Hero playTitle={entered} />
        <Guide />
        <Quiz />
        <Stories />
        <Cellar />
        <SimpleProducts />
        <About />
      </main>
      <Footer />
      <WhatsappFab visible={introGone} />
    </SmoothScroll>
  )
}
export default function Page() {
  return (
    <I18nProvider>
      <CatalogProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </CatalogProvider>
    </I18nProvider>
  )
}
