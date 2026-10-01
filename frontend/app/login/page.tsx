'use client'

import { createBrowserSupabase, isSupabaseBrowserConfigured } from '@/lib/shop/supabaseBrowser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const configured = isSupabaseBrowserConfigured()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!configured) {
      setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return
    }
    setBusy(true)
    try {
      const { error: authError } = await createBrowserSupabase().auth.signInWithPassword({ email, password })
      if (authError) {
        setError('No se pudo iniciar sesión')
        return
      }
      router.replace('/inventario')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="inv-shell">
      <form className="inv-login" onSubmit={(e) => void submit(e)}>
        <p className="inv-kicker">City Wine</p>
        <h1>Inventario</h1>
        <p className="inv-help">Solo personal autorizado.</p>
        <label>
          <span>Correo</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Contraseña</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p className="inv-error">{error}</p> : null}
        <button type="submit" disabled={busy || !configured}>
          {busy ? 'Entrando' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
