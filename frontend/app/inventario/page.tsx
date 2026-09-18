'use client'

import { createBrowserSupabase } from '@/lib/shop/supabaseBrowser'
import { staffFetch } from '@/lib/shop/staffApi'
import type { CatalogLocale, ProductKind } from '@/lib/shop/types'
import type { ShopProduct } from '@/lib/shop/mapping'
import { formatMXN } from '@/lib/wines'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type StaffProduct = ShopProduct & { imagePath: string | null }

const emptyForm = {
  id: '',
  kind: 'wine' as ProductKind,
  name: '',
  pricePesos: 0,
  stock: 0,
  active: true,
  notesEs: '',
  notesEn: '',
  region: '',
  type: '',
  brewery: '',
  style: '',
  nameEn: '',
  detailEs: '',
  detailEn: '',
}

function localeFromForm(f: typeof emptyForm): CatalogLocale {
  const locale: CatalogLocale = {}
  if (f.kind === 'wine') {
    locale.region = f.region || undefined
    locale.type = f.type || undefined
    locale.notes = { es: f.notesEs, en: f.notesEn }
  }
  if (f.kind === 'beer') {
    locale.brewery = f.brewery || undefined
    locale.style = f.style || undefined
  }
  if (f.kind === 'glass') {
    locale.name = { es: f.name, en: f.nameEn }
    locale.detail = { es: f.detailEs, en: f.detailEn }
  }
  return locale
}

function formFromProduct(p: StaffProduct): typeof emptyForm {
  return {
    id: p.id,
    kind: p.kind,
    name: p.name,
    pricePesos: p.pricePesos,
    stock: p.stock,
    active: p.active,
    notesEs: p.locale.notes?.es ?? '',
    notesEn: p.locale.notes?.en ?? '',
    region: p.locale.region ?? '',
    type: p.locale.type ?? '',
    brewery: p.locale.brewery ?? '',
    style: p.locale.style ?? '',
    nameEn: p.locale.name?.en ?? '',
    detailEs: p.locale.detail?.es ?? '',
    detailEn: p.locale.detail?.en ?? '',
  }
}

export default function InventarioPage() {
  const router = useRouter()
  const [products, setProducts] = useState<StaffProduct[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await staffFetch('/api/staff/products')
    if (res.status === 401 || res.status === 403) {
      router.replace('/login')
      return
    }
    if (!res.ok) {
      setStatus('error')
      return
    }
    const data = (await res.json()) as { products: StaffProduct[] }
    setProducts(data.products ?? [])
    setStatus('ok')
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    setError(null)
    setBusy(true)
    try {
      const payload = {
        id: form.id,
        kind: form.kind,
        name: form.name,
        pricePesos: Number(form.pricePesos),
        stock: Number(form.stock),
        active: form.active,
        locale: localeFromForm(form),
      }
      const res = await staffFetch(editing ? `/api/staff/products/${editing}` : '/api/staff/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { detail?: string }
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'No se pudo guardar')
        return
      }
      setForm(emptyForm)
      setEditing(null)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const archive = async (id: string) => {
    setError(null)
    const res = await staffFetch(`/api/staff/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = (await res.json()) as { detail?: string }
      setError(typeof data.detail === 'string' ? data.detail : 'No se pudo archivar')
      return
    }
    await load()
  }

  const upload = async (id: string, file: File) => {
    setError(null)
    const body = new FormData()
    body.append('file', file)
    const res = await staffFetch(`/api/staff/products/${id}/image`, { method: 'POST', body })
    if (!res.ok) {
      const data = (await res.json()) as { detail?: string }
      setError(typeof data.detail === 'string' ? data.detail : 'No se pudo subir la imagen')
      return
    }
    await load()
  }

  const signOut = async () => {
    await createBrowserSupabase().auth.signOut()
    router.replace('/login')
  }

  return (
    <main className="inv-shell inv-page">
      <header className="inv-head">
        <div>
          <p className="inv-kicker">City Wine</p>
          <h1>Inventario</h1>
        </div>
        <button type="button" className="inv-ghost" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </header>
      {status === 'loading' ? (
        <div className="inv-skel" aria-label="Cargando inventario">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {status === 'error' ? <p className="inv-error">No se pudo cargar el inventario.</p> : null}
      {status === 'ok' && products.length === 0 ? <p className="inv-empty">Sin SKUs. Crea el primero.</p> : null}
      <div className="inv-grid">
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="inv-mono">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.kind}</td>
                  <td className="inv-mono">{formatMXN(p.pricePesos)}</td>
                  <td className="inv-mono">{p.stock}</td>
                  <td>{p.active ? 'Visible' : 'Archivado'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p.id)
                        setForm(formFromProduct(p))
                      }}
                    >
                      Editar
                    </button>
                    {p.active ? (
                      <button type="button" onClick={() => void archive(p.id)}>
                        Archivar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="inv-form"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <h2>{editing ? 'Editar SKU' : 'Nuevo SKU'}</h2>
          <label>
            <span>Id</span>
            <input
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              disabled={Boolean(editing)}
              required
            />
          </label>
          <label>
            <span>Tipo</span>
            <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as ProductKind }))}>
              <option value="wine">Vino</option>
              <option value="beer">Cerveza</option>
              <option value="glass">Cristal</option>
            </select>
          </label>
          <label>
            <span>Nombre</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            <span>Precio (MXN)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.pricePesos}
              onChange={(e) => setForm((f) => ({ ...f, pricePesos: Number(e.target.value) }))}
              required
            />
          </label>
          <label>
            <span>Stock</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              required
            />
          </label>
          <label className="inv-check">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            <span>Visible en la tienda</span>
          </label>
          {form.kind === 'wine' ? (
            <>
              <label>
                <span>Región</span>
                <input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
              </label>
              <label>
                <span>Tipo de vino</span>
                <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
              </label>
              <label>
                <span>Notas (ES)</span>
                <input value={form.notesEs} onChange={(e) => setForm((f) => ({ ...f, notesEs: e.target.value }))} />
              </label>
              <label>
                <span>Notas (EN)</span>
                <input value={form.notesEn} onChange={(e) => setForm((f) => ({ ...f, notesEn: e.target.value }))} />
              </label>
            </>
          ) : null}
          {form.kind === 'beer' ? (
            <>
              <label>
                <span>Cervecería</span>
                <input value={form.brewery} onChange={(e) => setForm((f) => ({ ...f, brewery: e.target.value }))} />
              </label>
              <label>
                <span>Estilo</span>
                <input value={form.style} onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))} />
              </label>
            </>
          ) : null}
          {form.kind === 'glass' ? (
            <>
              <label>
                <span>Nombre EN</span>
                <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
              </label>
              <label>
                <span>Detalle ES</span>
                <input value={form.detailEs} onChange={(e) => setForm((f) => ({ ...f, detailEs: e.target.value }))} />
              </label>
              <label>
                <span>Detalle EN</span>
                <input value={form.detailEn} onChange={(e) => setForm((f) => ({ ...f, detailEn: e.target.value }))} />
              </label>
            </>
          ) : null}
          {editing ? (
            <label>
              <span>Foto</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void upload(editing, file)
                }}
              />
            </label>
          ) : (
            <p className="inv-help">Guarda el SKU para subir foto.</p>
          )}
          {error ? <p className="inv-error">{error}</p> : null}
          <div className="inv-form-actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Guardando' : 'Guardar'}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setForm(emptyForm)
                }}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  )
}
