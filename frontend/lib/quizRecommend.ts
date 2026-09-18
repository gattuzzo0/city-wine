import type { Locale } from '@/lib/dictionary'
import type { Wine } from '@/lib/wines'

export const PROFILE_KEYS = [
  'elegancia', 'frescura', 'calidez', 'celebración', 'gastronomía', 'sofisticación',
  'versatilidad', 'accesibilidad', 'sutileza', 'equilibrio', 'intensidad', 'cuerpo',
  'acidez', 'ligereza', 'premium', 'memorable', 'suavidad',
] as const

export type ProfileKey = (typeof PROFILE_KEYS)[number]
export type WineProfile = Record<ProfileKey, number>
export type ProfileDelta = Partial<WineProfile>

export type QuizAnswers = [string, string, string, string]

type Option = {
  id: string
  es: string
  en: string
  deltas: ProfileDelta
}

export type QuizQuestion = { es: string; en: string; options: Option[] }

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    es: '¿Qué estás celebrando?',
    en: 'What are you celebrating?',
    options: [
      { id: 'wedding', es: 'Una boda', en: 'A wedding', deltas: { elegancia: 3, celebración: 3, versatilidad: 2, premium: 2 } },
      { id: 'corporate', es: 'Un evento corporativo', en: 'A corporate event', deltas: { elegancia: 3, versatilidad: 3, sutileza: 2, premium: 1 } },
      { id: 'party', es: 'Una celebración especial', en: 'A special celebration', deltas: { celebración: 3, accesibilidad: 3, versatilidad: 2, frescura: 1 } },
      { id: 'dinner', es: 'Una cena privada', en: 'A private dinner', deltas: { gastronomía: 3, elegancia: 2, sofisticación: 3, premium: 2 } },
    ],
  },
  {
    es: '¿Qué quieres que sientan tus invitados?',
    en: 'How should your guests feel?',
    options: [
      { id: 'elegance', es: 'Elegancia', en: 'Elegance', deltas: { elegancia: 4, sofisticación: 3, premium: 2 } },
      { id: 'fresh', es: 'Frescura', en: 'Freshness', deltas: { frescura: 4, ligereza: 3, accesibilidad: 2 } },
      { id: 'warmth', es: 'Calidez', en: 'Warmth', deltas: { calidez: 4, accesibilidad: 3, suavidad: 2 } },
      { id: 'festive', es: 'Celebración', en: 'Celebration', deltas: { celebración: 4, frescura: 2, accesibilidad: 2 } },
    ],
  },
  {
    es: '¿Cómo será la comida?',
    en: 'What will you serve?',
    options: [
      { id: 'meat', es: 'Carnes y asados', en: 'Meats and roasts', deltas: { cuerpo: 4, intensidad: 3, gastronomía: 2 } },
      { id: 'fish', es: 'Pescados y mariscos', en: 'Fish and seafood', deltas: { frescura: 4, acidez: 3, ligereza: 2 } },
      { id: 'pasta', es: 'Pastas y cocina italiana', en: 'Pasta and Italian cooking', deltas: { versatilidad: 3, cuerpo: 2, gastronomía: 3 } },
      { id: 'cheese', es: 'Quesos y aperitivos', en: 'Cheese and appetizers', deltas: { sofisticación: 3, cuerpo: 2, versatilidad: 3 } },
      { id: 'mixed', es: 'Menú variado', en: 'A mixed menu', deltas: { versatilidad: 5, equilibrio: 4, accesibilidad: 2 } },
    ],
  },
  {
    es: '¿Qué tan protagonista quieres que sea el vino?',
    en: 'How central should the wine be?',
    options: [
      { id: 'subtle', es: 'Sutil — Que acompañe y complemente', en: 'Subtle — Complement the table', deltas: { sutileza: 5, equilibrio: 3, accesibilidad: 2 } },
      { id: 'balanced', es: 'Equilibrado — Que destaque sin dominar', en: 'Balanced — Present, not loud', deltas: { equilibrio: 5, versatilidad: 3, elegancia: 2 } },
      { id: 'star', es: 'Protagonista — Quiero que mis invitados lo recuerden', en: 'The star — I want it remembered', deltas: { intensidad: 4, sofisticación: 4, memorable: 3 } },
      { id: 'luxe', es: 'Experiencia premium — Quiero algo realmente especial', en: 'Premium — Something truly special', deltas: { premium: 6, sofisticación: 4, elegancia: 3 } },
    ],
  },
]

const TAG_ES: Record<ProfileKey, string> = {
  elegancia: 'Elegante', frescura: 'Fresco', calidez: 'Cálido', celebración: 'Festivo',
  gastronomía: 'Gastronómico', sofisticación: 'Sofisticado', versatilidad: 'Versátil',
  accesibilidad: 'Accesible', sutileza: 'Sutil', equilibrio: 'Equilibrado',
  intensidad: 'Intenso', cuerpo: 'Con cuerpo', acidez: 'Vibrante', ligereza: 'Ligero',
  premium: 'Premium', memorable: 'Memorable', suavidad: 'Suave',
}
const TAG_EN: Record<ProfileKey, string> = {
  elegancia: 'Elegant', frescura: 'Fresh', calidez: 'Warm', celebración: 'Festive',
  gastronomía: 'Gastronomic', sofisticación: 'Sophisticated', versatilidad: 'Versatile',
  accesibilidad: 'Approachable', sutileza: 'Subtle', equilibrio: 'Balanced',
  intensidad: 'Intense', cuerpo: 'Full-bodied', acidez: 'Vibrant', ligereza: 'Light',
  premium: 'Premium', memorable: 'Memorable', suavidad: 'Soft',
}

export function emptyProfile(): WineProfile {
  return Object.fromEntries(PROFILE_KEYS.map((k) => [k, 0])) as WineProfile
}

function optionById(step: number, id: string) {
  return QUIZ_QUESTIONS[step]?.options.find((o) => o.id === id)
}

export function buildClientProfile(answers: QuizAnswers): WineProfile {
  const profile = emptyProfile()
  answers.forEach((id, i) => {
    const opt = optionById(i, id)
    if (!opt) return
    for (const [key, value] of Object.entries(opt.deltas)) {
      profile[key as ProfileKey] += value ?? 0
    }
  })
  return profile
}

export function scoreWine(client: WineProfile, wine: Wine): number {
  let num = 0
  let den = 0
  for (const key of PROFILE_KEYS) {
    const c = client[key]
    if (c <= 0) continue
    num += c * (wine.profile[key] ?? 0)
    den += c * 10
  }
  return den ? num / den : 0
}

export type RankedWine = { wine: Wine; score: number; match: number }

export function getWineRecommendation(answers: string[], catalog: Wine[]) {
  const client = buildClientProfile(answers as QuizAnswers)
  const ranked: RankedWine[] = catalog
    .map((wine) => {
      const score = scoreWine(client, wine)
      return { wine, score, match: Math.round(score * 100) }
    })
    .sort((a, b) => b.score - a.score)
  return { client, best: ranked[0], next: ranked.slice(1, 3) }
}

export function wineTags(wine: Wine, client: WineProfile, locale: Locale, count = 3): string[] {
  const labels = locale === 'en' ? TAG_EN : TAG_ES
  return PROFILE_KEYS
    .filter((k) => client[k] > 0)
    .sort((a, b) => (wine.profile[b] * client[b]) - (wine.profile[a] * client[a]))
    .slice(0, count)
    .map((k) => labels[k])
}

const OCCASION: Record<string, { es: string; en: string }> = {
  wedding: { es: 'una boda que merece solemnidad', en: 'a wedding that calls for poise' },
  corporate: { es: 'un evento corporativo con buen tono', en: 'a corporate gathering with composure' },
  party: { es: 'una celebración especial y cercana', en: 'a lively celebration' },
  dinner: { es: 'una cena privada e íntima', en: 'a private, intimate dinner' },
}
const FEELING: Record<string, { es: string; en: string }> = {
  elegance: { es: 'elegancia y presencia', en: 'elegance and presence' },
  fresh: { es: 'frescura y ligereza', en: 'freshness and lightness' },
  warmth: { es: 'calidez en la mesa', en: 'warmth at the table' },
  festive: { es: 'un espíritu festivo', en: 'a festive spirit' },
}
const FOOD: Record<string, { es: string; en: string }> = {
  meat: { es: 'acompañar carnes y asados sin quedarse corto', en: 'stand up to meats and roasts' },
  fish: { es: 'acompañar pescados y mariscos con viveza', en: 'lift fish and seafood' },
  pasta: { es: 'dialogar con pastas y cocina italiana', en: 'meet pasta and Italian cooking' },
  cheese: { es: 'acompañar quesos y aperitivos con carácter', en: 'pair with cheese and small plates' },
  mixed: { es: 'servir un menú variado sin forzar un solo estilo', en: 'serve a mixed menu without forcing one style' },
}
const ROLE: Record<string, { es: string; en: string }> = {
  subtle: { es: 'sin robar protagonismo a tus invitados', en: 'without stealing the room' },
  balanced: { es: 'destacando con equilibrio, sin dominar', en: 'present, without dominating' },
  star: { es: 'con un carácter que se recuerde', en: 'with a character guests will remember' },
  luxe: { es: 'con una presencia realmente especial', en: 'with a truly special presence' },
}

export function generateRecommendationReason(answers: string[], wine: Wine, locale: Locale): string {
  const loc = locale === 'en' ? 'en' : 'es'
  const occasion = OCCASION[answers[0]]?.[loc] ?? ''
  const feeling = FEELING[answers[1]]?.[loc] ?? ''
  const food = FOOD[answers[2]]?.[loc] ?? ''
  const role = ROLE[answers[3]]?.[loc] ?? ''
  if (loc === 'en') {
    return `You're looking for ${feeling} at ${occasion}, and a wine able to ${food}, ${role}. That's why we chose ${wine.name}.`
  }
  return `Buscas ${feeling} para ${occasion}, y un vino capaz de ${food}, ${role}. Por eso seleccionamos ${wine.name}.`
}
