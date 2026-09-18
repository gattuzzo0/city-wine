import { createBrowserSupabase } from './supabaseBrowser'
import { apiUrl } from './apiUrl'

export async function staffFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await createBrowserSupabase().auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    return new Response(JSON.stringify({ detail: 'Se requiere iniciar sesión' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(apiUrl(path), { ...init, headers })
}
