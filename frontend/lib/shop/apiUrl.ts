export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}
