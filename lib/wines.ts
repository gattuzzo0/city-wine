export const formatMXN = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)

export const wines = [
  {
    id: 'nebbiolo-casa',
    name: 'Nebbiolo de la Casa',
    type: 'Tinto',
    mood: 'Sofisticada',
    region: 'Valle de Guadalupe',
    notes: { es: 'Cereza negra · cacao · tierra húmeda', en: 'Black cherry · cacao · damp earth' },
    description: { es: 'Elegante y con carácter. Un tinto que llega con calma y se queda en la mesa.', en: 'Elegant, with character. A red that arrives calmly and stays at the table.' },
    price: 780,
    image: '/images/city-wine/nebbiolo-casa.png',
    profile: { elegancia: 8, frescura: 3, calidez: 7, celebración: 6, gastronomía: 8, sofisticación: 8, versatilidad: 5, accesibilidad: 5, sutileza: 4, equilibrio: 7, intensidad: 7, cuerpo: 8, acidez: 5, ligereza: 3, premium: 7, memorable: 7, suavidad: 6 },
  },
  {
    id: 'blanco-altura',
    name: 'Blanco de Altura',
    type: 'Blanco',
    mood: 'Relajada',
    region: 'Querétaro',
    notes: { es: 'Pera · flores blancas · mineral', en: 'Pear · white flowers · mineral' },
    description: { es: 'Fresco, mineral y ligero. Acompaña sin imponer, con una acidez que abre el apetito.', en: 'Fresh, mineral and light. It accompanies without imposing, with an acidity that opens the appetite.' },
    price: 460,
    image: '/images/city-wine/blanco-altura.png',
    profile: { elegancia: 6, frescura: 9, calidez: 2, celebración: 5, gastronomía: 6, sofisticación: 5, versatilidad: 9, accesibilidad: 9, sutileza: 8, equilibrio: 8, intensidad: 3, cuerpo: 3, acidez: 8, ligereza: 9, premium: 5, memorable: 5, suavidad: 7 },
  },
  {
    id: 'rose-medianoche',
    name: 'Rosé de Medianoche',
    type: 'Rosado',
    mood: 'Celebración',
    region: 'Ensenada',
    notes: { es: 'Fresa silvestre · cítricos · sal marina', en: 'Wild strawberry · citrus · sea salt' },
    description: { es: 'Festivo y accesible. Un rosado que anima la mesa sin pedir solemnidad.', en: 'Festive and approachable. A rosé that lifts the table without asking for ceremony.' },
    price: 520,
    image: '/images/city-wine/rose-medianoche.png',
    profile: { elegancia: 6, frescura: 8, calidez: 4, celebración: 9, gastronomía: 5, sofisticación: 5, versatilidad: 9, accesibilidad: 8, sutileza: 6, equilibrio: 7, intensidad: 4, cuerpo: 4, acidez: 7, ligereza: 8, premium: 5, memorable: 6, suavidad: 7 },
  },
  {
    id: 'reserva-sierra',
    name: 'Reserva de la Sierra',
    type: 'Tinto',
    mood: 'Aventurera',
    region: 'Coahuila',
    notes: { es: 'Ciruela · especias · vainilla', en: 'Plum · spice · vanilla' },
    description: { es: 'Estructurado, premium y memorable. Para mesas donde el vino también es protagonista.', en: 'Structured, premium and memorable. For tables where the wine is also the lead.' },
    price: 1180,
    image: '/images/city-wine/reserva-sierra.png',
    profile: { elegancia: 9, frescura: 2, calidez: 6, celebración: 7, gastronomía: 9, sofisticación: 9, versatilidad: 5, accesibilidad: 4, sutileza: 2, equilibrio: 6, intensidad: 9, cuerpo: 9, acidez: 4, ligereza: 2, premium: 9, memorable: 9, suavidad: 5 },
  },
]
export const beers = [
  { name: 'Cauce Ámbar', brewery: 'Cervecería Wendlandt', style: 'Amber Ale · 5.2%', price: 95 },
  { name: 'Lágrimas Negras', brewery: 'Fauna', style: 'Oatmeal Stout · 6.0%', price: 125 },
  { name: 'Bruma', brewery: 'Insurgente', style: 'West Coast IPA · 6.5%', price: 110 },
]
export const glassware = [
  { name: { es: 'Copa Sommelier', en: 'Sommelier glass' }, detail: { es: 'Cristal fino · para tintos', en: 'Fine crystal · for reds' }, price: 680 },
  { name: { es: 'Decantador Noche', en: 'Night decanter' }, detail: { es: 'Vidrio soplado · 1.5 L', en: 'Blown glass · 1.5 L' }, price: 1240 },
  { name: { es: 'Vaso Facetado', en: 'Faceted tumbler' }, detail: { es: 'Cristal tallado · set de 2', en: 'Cut crystal · set of 2' }, price: 740 },
]
export const imageForStage = (i: number) => ['/images/city-wine/cellar.png', '/images/city-wine/hero.png', '/images/city-wine/glassware.png', '/images/city-wine/bottle.png', '/images/city-wine/cellar.png', '/images/city-wine/glassware.png'][i]
export type Wine = (typeof wines)[number]
