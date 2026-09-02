export const formatMXN = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)

export const wines = [
  { name: 'Nebbiolo de la Casa', type: 'Tinto', mood: 'Sofisticada', region: 'Valle de Guadalupe', notes: 'Cereza negra · cacao · tierra húmeda', price: 780, image: '/images/city-wine/bottle.png' },
  { name: 'Blanco de Altura', type: 'Blanco', mood: 'Relajada', region: 'Querétaro', notes: 'Pera · flores blancas · mineral', price: 460, image: '/images/city-wine/bottle.png' },
  { name: 'Rosé de Medianoche', type: 'Rosado', mood: 'Celebración', region: 'Ensenada', notes: 'Fresa silvestre · cítricos · sal marina', price: 520, image: '/images/city-wine/bottle.png' },
  { name: 'Reserva de la Sierra', type: 'Tinto', mood: 'Aventurera', region: 'Coahuila', notes: 'Ciruela · especias · vainilla', price: 1180, image: '/images/city-wine/bottle.png' },
]
export const beers = [
  { name: 'Cauce Ámbar', brewery: 'Cervecería Wendlandt', style: 'Amber Ale · 5.2%', price: 95 },
  { name: 'Lágrimas Negras', brewery: 'Fauna', style: 'Oatmeal Stout · 6.0%', price: 125 },
  { name: 'Bruma', brewery: 'Insurgente', style: 'West Coast IPA · 6.5%', price: 110 },
]
export const glassware = [
  { name: 'Copa Sommelier', detail: 'Cristal fino · para tintos', price: 680 },
  { name: 'Decantador Noche', detail: 'Vidrio soplado · 1.5 L', price: 1240 },
  { name: 'Vaso Facetado', detail: 'Cristal tallado · set de 2', price: 740 },
]
export const atmospheres = ['Íntima', 'Celebración', 'Sofisticada', 'Relajada', 'Aventurera']
export const guide = [
  ['01', 'Observa', 'El color cuenta la primera historia.'], ['02', 'Acerca', 'La nariz descubre lo que los ojos no ven.'], ['03', 'Prueba', 'Deja que el vino encuentre su ritmo.'], ['04', 'Acompaña', 'La mesa también es parte del maridaje.'], ['05', 'Recuerda', 'El mejor vino es el que vuelve contigo.'],
] as const
export const stages = ['Planea sin limitarte', 'Recibe vino suficiente', 'Celebra sin contar botellas', 'Abre solo lo necesario', 'Devuelve lo que sobró', 'Paga solo lo que disfrutaron']
export const imageForStage = (i: number) => ['/images/city-wine/cellar.png','/images/city-wine/hero.png','/images/city-wine/glassware.png','/images/city-wine/bottle.png','/images/city-wine/cellar.png','/images/city-wine/glassware.png'][i]
export type Wine = (typeof wines)[number]
