'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, UserRound, ShoppingBag, Menu, ArrowDownRight, ChevronRight, X } from 'lucide-react'
import { I18nProvider, useI18n } from '@/components/i18n'
import { CustomCursor } from '@/components/custom-cursor'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Eyebrow, WordReveal, MagneticButton } from '@/components/primitives'
import { beers, formatMXN, glassware, imageForStage, wines } from '@/lib/wines'
import { generateRecommendationReason, getWineRecommendation, QUIZ_QUESTIONS, wineTags } from '@/lib/quizRecommend'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7F74eb8acoX9X3biRjJWZUX4eBqfbg.png'

function Logo() { const { t } = useI18n(); return <a href="#top" className="logo" aria-label="City Wine"><img src={logoUrl} alt={t.logoAlt} /></a> }
function Nav() { const { t, locale, toggle } = useI18n(); const [open, setOpen] = useState(false); return <header className="nav"><Logo /><nav className={open ? 'nav-links open' : 'nav-links'}>{t.nav.map((n, i) => <a key={n} href={['#cellar','#atmospheres','#beers','#glassware','#stories','#about'][i]} onClick={() => setOpen(false)}>{n}</a>)}</nav><div className="nav-actions"><button aria-label={t.search}><Search size={17}/></button><button aria-label={t.account}><UserRound size={17}/></button><button aria-label={t.cart}><ShoppingBag size={17}/><sup>0</sup></button><button className="locale" onClick={toggle}>{locale === 'es' ? 'EN' : 'ES'}</button><button className="menu" onClick={() => setOpen(!open)} aria-label={t.menu}>{open ? <X size={20}/> : <Menu size={20}/>}</button></div></header> }
function Intro({ onEnter }: { onEnter: () => void }) { const { t } = useI18n(); const [out, setOut] = useState(false); const [gone, setGone] = useState(false); if (gone) return null; return <div className={out ? 'intro out' : 'intro'} onTransitionEnd={e => { if (e.target === e.currentTarget && out) setGone(true) }}><img className="intro-logo" src={logoUrl} alt={t.logoAlt} /><p className="eyebrow">City Wine · 1998—2026</p><h1>{t.introTitle}</h1><MagneticButton onClick={() => { if (out) return; setOut(true); onEnter() }}>{t.enter} <ArrowDownRight size={16}/></MagneticButton><span className="intro-line"/></div> }
function Hero({ playTitle }: { playTitle: boolean }) { const { t, locale } = useI18n(); return <section id="top" className="hero"><div className="hero-image"/><Eyebrow>{t.heroEyebrow}</Eyebrow><div className="hero-copy"><h1><WordReveal key={locale} play={playTitle}>{t.heroTitle}</WordReveal></h1><p>{t.heroText}</p><div className="button-row"><MagneticButton>{t.explore} <ArrowDownRight size={16}/></MagneticButton><a className="text-link" href="#quiz">{t.recommend} <ChevronRight size={15}/></a></div></div></section> }
function Atmospheres() { const { t, locale } = useI18n(); const [active, setActive] = useState(0); const wine = wines[active % wines.length]; return <section id="atmospheres" className="section atmos"><div className="section-head"><Eyebrow>{t.atmosEyebrow}</Eyebrow><h2>{t.atmosTitle}</h2></div><div className="atmos-grid"><div className="atmos-list">{t.atmospheres.map((a, i) => <button className={active === i ? 'active' : ''} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} key={a}><span>0{i+1}</span>{a}<ArrowDownRight size={18}/></button>)}</div><div className="atmos-visual"><img src="/images/city-wine/cellar.png" alt=""/><div><Eyebrow>{t.weRecommend}</Eyebrow><h3>{wine.name}</h3><p>{wine.notes[locale]}</p></div></div></div></section> }
function Guide() { const { t } = useI18n(); return <section id="guide" className="section guide"><div className="section-head"><Eyebrow>{t.guideEyebrow}</Eyebrow><h2>{t.guideTitle}</h2><p>{t.guideIntro}</p></div><div className="timeline">{t.guide.map(([num, title, text], i) => <div className="timeline-item" key={num}><span className="timeline-num">{num}</span><img src={i % 2 ? '/images/city-wine/cellar.png' : '/images/city-wine/glassware.png'} alt={title}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section> }
function Quiz() {
  const { t, locale } = useI18n()
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
function Stories() { const { t } = useI18n(); const [opened, setOpened] = useState(24); return <section id="stories" className="stories section"><div className="section-head"><Eyebrow>{t.storyEyebrow}</Eyebrow><h2>{t.storyTitle}</h2></div><div className="story-grid">{t.stages.map((stage, i) => <article key={i} className={i === 3 ? 'story-card bottle-board' : 'story-card'}><img src={imageForStage(i)} alt={stage}/><div className="story-overlay"><span>0{i+1}</span><h3>{stage}</h3>{i === 3 && <button onClick={() => setOpened(opened === 24 ? 12 : 24)} className="counter">{opened} {t.opened}</button>}{i === 5 && <strong>{t.payBottles}</strong>}</div></article>)}</div></section> }
function Cellar() {
  const { t, locale } = useI18n()
  const [filter, setFilter] = useState('all')
  const filters = [
    { id: 'all', label: t.all },
    { id: 'Tinto', label: t.typeRed },
    { id: 'Blanco', label: t.typeWhite },
    { id: 'Rosado', label: t.typeRose },
  ] as const
  const typeLabel = { Tinto: t.typeRed, Blanco: t.typeWhite, Rosado: t.typeRose }
  const list = filter === 'all' ? wines : wines.filter((w) => w.type === filter)
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
            <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="product-grid">
        {list.map((w) => (
          <article className="product" key={w.id}>
            <div className="product-image">
              <img src={w.image} alt={w.name} />
              <button aria-label={`${t.addToCart} ${w.name}`}><ShoppingBag size={16} /></button>
            </div>
            <div className="product-meta">
              <span>{w.region} · {typeLabel[w.type as keyof typeof typeLabel]}</span>
              <h3>{w.name}</h3>
              <p>{w.notes[locale]}</p>
              <strong>{formatMXN(w.price)} MXN</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
function SimpleProducts() { const { t, locale } = useI18n(); return <><section id="beers" className="section beers"><div className="split-head"><div><Eyebrow>{t.beersEyebrow}</Eyebrow><h2>{t.beers}</h2></div><div className="split-visual"><img src="/images/city-wine/beer.png" alt={t.beersAlt}/></div></div><div className="line-products">{beers.map(b => <div key={b.name}><span>{b.brewery}</span><h3>{b.name}</h3><p>{b.style}</p><b>{formatMXN(b.price)} MXN</b></div>)}</div></section><section id="glassware" className="section glassware"><div className="split-head"><div><Eyebrow>{t.glassEyebrow}</Eyebrow><h2>{t.glass}</h2></div><div className="split-visual"><img src="/images/city-wine/glassware.png" alt={t.glassAlt}/></div></div><div className="line-products">{glassware.map(g => <div key={g.name.es}><span>{t.objects}</span><h3>{g.name[locale]}</h3><p>{g.detail[locale]}</p><b>{formatMXN(g.price)} MXN</b></div>)}</div></section></> }
function About() { const { t } = useI18n(); return <section id="about" className="about section"><img src="/images/city-wine/cellar.png" alt={t.aboutAlt}/><div><Eyebrow>{t.aboutEyebrow}</Eyebrow><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><a className="text-link">{t.aboutCta} <ChevronRight size={15}/></a></div></section> }
function Footer() { const { t } = useI18n(); const hrefs = ['#cellar','#guide','#stories','#about']; return <footer className="footer"><div><Logo/><h2>{t.newsletter}</h2><p>{t.newsletterText}</p><form><input type="email" aria-label="Email" placeholder={t.emailPlaceholder}/><button>{t.subscribe} <ArrowDownRight size={16}/></button></form></div><div className="footer-links">{t.footerLinks.map((label, i) => <a key={label} href={hrefs[i]}>{label}</a>)}</div><small>© 2026 City Wine · {t.brandLine}. {t.footer}</small></footer> }
function App() { const [entered, setEntered] = useState(false); return <SmoothScroll active={entered}><CustomCursor/><Intro onEnter={() => setEntered(true)}/><Nav/><main><Hero playTitle={entered}/><Atmospheres/><Guide/><Quiz/><Stories/><Cellar/><SimpleProducts/><About/></main><Footer/></SmoothScroll> }
export default function Page() { return <I18nProvider><App/></I18nProvider> }
