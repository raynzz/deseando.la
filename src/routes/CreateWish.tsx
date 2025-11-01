import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '@/lib/directus';

type WishPayload = {
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  cover_image?: string | null;
  owner?: string; // opcional si tu policy ya setea $CURRENT_USER
};

type ApiOne<T> = { data: T };
type Me = { id: string; first_name?: string; last_name?: string; email?: string; avatar?: string | null };

const TOKEN_KEY = 'directus_access_token';
const REFRESH_KEY = 'directus_refresh_token';
const USE_COOKIE_MODE = false; // Cambia a true si usas auth por cookies en Directus

function useSession() {
  // En cookie-mode no podemos leer la cookie, asumimos “posible” sesión.
  const token = !USE_COOKIE_MODE ? localStorage.getItem(TOKEN_KEY) : 'cookie';
  return { isLogged: !!token };
}

async function apiFetch<T = any>(baseUrl: string, path: string, init: RequestInit = {}) {
  const url = `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = { ...(init.headers as any) };

  if (!USE_COOKIE_MODE) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: USE_COOKIE_MODE ? 'include' : 'omit',
    ...init,
    headers,
  });

  if (!res.ok) {
    const txt = await res.text();
    try {
      const j = txt ? JSON.parse(txt) : {};
      const msg = j?.errors?.[0]?.message || j?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(`HTTP ${res.status}: ${txt || 'Error'}`);
    }
  }

  const ct = res.headers.get('content-type') || '';
  return (ct.includes('application/json') ? res.json() : (res.text() as any)) as T;
}

export default function CreateWish() {
  const navigate = useNavigate();
  const baseUrl = getBaseUrl();
  const { isLogged } = useSession();

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [cover, setCover] = useState<File | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);

  async function getMe(): Promise<Me | null> {
    try {
      const me = await apiFetch<ApiOne<Me>>(baseUrl, '/users/me', { method: 'GET' });
      return me?.data || null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setSubmitting(true);
    setMsg(null);
    setError(null);

    try {
      // 0) Owner (por si tu policy no setea owner automáticamente)
      const me = await getMe();

      // 1) Upload cover (opcional)
      let coverId: string | null = null;
      if (cover) {
        const fd = new FormData();
        fd.append('file', cover);
        const up = await apiFetch<any>(baseUrl, '/files', { method: 'POST', body: fd });
        coverId = up?.data?.id || up?.id || null;
      }

      // 2) Create wish
      const payload: WishPayload = {
        title: title.trim(),
        description: desc.trim() || undefined,
        visibility,
        cover_image: coverId || undefined,
        owner: me?.id || undefined,
      };

      const created = await apiFetch<ApiOne<{ id: number }>>(baseUrl, '/items/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setMsg(`Deseo #${created.data.id} creado con éxito.`);
      // Redirigir al detalle o al admin
      setTimeout(() => {
        navigate(`/wish/${created.data.id}`);
      }, 600);
    } catch (e: any) {
      setError(e?.message || 'No se pudo crear el deseo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLogged) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-semibold">Crear un deseo</h1>
        <p className="mt-2 opacity-80">
          Necesitás iniciar sesión para crear un deseo.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            to="/login"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-black/5"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Registrarme
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/" className="text-sm text-neutral-700 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-24">
      {/* Topbar simple */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">Deseándola</Link>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-black/5"
            >
              Mi panel
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="mx-auto mt-6 max-w-4xl px-4">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h1 className="text-xl font-semibold">Crear un deseo</h1>
            <p className="mt-1 text-sm opacity-80">
              Contá tu idea, agregá detalles y una imagen de portada opcional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 p-5 md:grid-cols-3">
            {/* Columna izquierda */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Título *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  placeholder="Ej: Viaje a Bariloche 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  rows={6}
                  placeholder="¿Qué querés lograr? ¿Qué necesitás? ¿Cómo te pueden ayudar?"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Visibilidad</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                    />
                    Público
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                    />
                    Privado
                  </label>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <aside className="md:col-span-1">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-medium">Portada (opcional)</div>
                <p className="mt-1 text-xs opacity-70">
                  Subí una imagen representativa de tu deseo.
                </p>

                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files?.[0] || null)}
                  />
                  {cover && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs opacity-70">{cover.name}</div>
                      <div className="overflow-hidden rounded-lg border bg-neutral-50">
                        <div className="aspect-[4/3] w-full">
                          <img
                            src={preview || ''}
                            alt="Vista previa"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    submitting ? 'bg-neutral-400 cursor-not-allowed' : 'bg-black hover:bg-neutral-800'
                  }`}
                >
                  {submitting ? 'Creando…' : 'Crear deseo'}
                </button>

                {msg && (
                  <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800">
                    {msg}
                  </div>
                )}
                {error && (
                  <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-neutral-700 hover:underline">
                  ← Volver al inicio
                </Link>
              </div>
            </aside>
          </form>
        </div>
      </section>
    </main>
  );
}
