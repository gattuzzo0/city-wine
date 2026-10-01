import { createBrowserClient } from '@supabase/ssr'

export function isSupabaseBrowserConfigured(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  return Boolean(url && anon)
}

export function createBrowserSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  if (!url || !anon) throw new Error('Supabase no configurado')
  return createBrowserClient(url, anon)
}
