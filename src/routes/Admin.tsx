import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '@/lib/directus';

/** =============================
 *  Tipos mínimos
 *  ============================= */
type Me = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  role?: { id: string; name: string } | string | null;
  status?: string;
};

type WishItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  visibility?: 'public' | 'private';
  cover_image?: string | null;
  owner?: { id: string; first_name?: string; last_name?: string } | string | null;
  date_created?: string;
};

type ApiList<T> = { data: T[]; meta?: { total_count?: number } };
type ApiOne<T> = { data: T };

/** =============================
 *  Config
 *  ============================= */
const TOKEN_KEY = 'directus_access_token';
const REFRESH_KEY = 'directus_refresh_token';
const USE_COOKIE_MODE = false; // si usas cookies (SameSite=None) cambia a true

/** =============================
 *  Utils
 *  ============================= */
function fullName(u?: Me | null) {
  if (!u) return '';
  const a = u.first_name || '';
  const b = u.last_name || '';
  return `${a} ${b}`.trim();
}

function assetUrl(baseUrl: string, fileId?: string | null) {
  if (!fileId) return null;
  const clean = baseUrl.replace(/\/+$/, '');
  return `${clean}/assets/${fileId}`;
}

async function apiFetch(
  baseUrl: string,
  path: string,
  init: RequestInit = {}
) {
  const url = `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    ...(init.headers as any),
  };

  if (!USE_COOKIE_MODE) {
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: USE_COOKIE_MODE ? 'include' : 'omit',
    ...init,
    headers,
  });

  // Directus devuelve {errors:[...]} con 4xx/5xx
  if (!res.ok) {
    let txt = await res.text();
    try {
      const json = txt ? JSON.parse(txt) : {};
      const msg =
        json?.errors?.[0]?.message ||
        json?.message ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(`HTTP ${res.status}: ${txt || 'Error'}`);
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

/** =============================
 *  Componente
 *  ============================= */
export default function Admin() {
  const navigate = useNavigate();
  const baseUrl = getBaseUrl();

  // Estado de sesión
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [errorMe, setErrorMe] = useState<string | null>(null);

  // Crear deseo
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [cover, setCover] = useState<File | null>(null);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Mis deseos
  const pageSize = 12;
  const [items, setItems] = useState<WishItem[]>([]);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const isLogged = USE_COOKIE_MODE
    ? true // en cookie mode asumimos sesión si cookie existe (no podemos leerla desde JS)
    : !!localStorage.getItem(TOKEN_KEY);

  /** --------- Cargar perfil --------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isLogged) {
        setLoadingMe(false);
        setMe(null);
        return;
      }
      try {
        setLoadingMe(true);
        setErrorMe(null);
        const data: ApiOne<Me> = await apiFetch(baseUrl, '/users/me', {
          method: 'GET',
        });
        if (!mounted) return;
        setMe(data?.data || null);
      } catch (e: any) {
        if (!mounted) return;
        setErrorMe(e?.message || 'Error al cargar perfil');
        setMe(null);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [baseUrl, isLogged]);

  /** --------- Listar mis deseos --------- */
  const ownerFilter = useMemo(() => {
    // Si el usuario es nulo, no filtramos; Directus puede filtrar por current_user con preset/policy
    if (!me?.id) return null;
    return me.id;
  }, [me?.id]);

  async function loadMore() {
    if (loadingList || !more) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(page * pageSize),
        sort: '-id',
        fields:
          'id,title,description,visibility,cover_image,owner.id,owner.first_name,owner.last_name,date_created',
      });
      if (ownerFilter) {
        params.set('filter[owner][_eq]', ownerFilter);
      }
      const data: ApiList<WishItem> = await apiFetch(
        baseUrl,
        `/items/wishes?${params.toString()}`,
        { method: 'GET' }
      );
      const list = data?.data || [];
      setItems((prev) => [...prev, ...list]);
      setPage((p) => p + 1);
      if (list.length < pageSize) setMore(false);
    } catch (e: any) {
      setErrorList(e?.message || 'Error al cargar tus deseos');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    // reset & load
    setItems([]);
    setPage(0);
    setMore(true);
    if (isLogged) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerFilter, isLogged]);

  /** --------- Crear deseo --------- */
  async function createWish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setCreateMsg('El título es obligatorio.');
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      // 1) Subir portada si existe
      let coverId: string | null = null;
      if (cover) {
        const fd = new FormData();
        fd.append('file', cover);
        const up = await apiFetch(baseUrl, '/files', {
          method: 'POST',
          body: fd,
        });
        coverId = up?.data?.id || up?.id || null;
      }

      // 2) Crear wish
      const payload: Partial<WishItem> = {
        title: title.trim(),
        description: desc.trim(),
        visibility,
        cover_image: coverId,
        // si tus políticas no setean owner automáticamente, enviamos el id del usuario.
        owner: me?.id || (me as any) || undefined,
      };

      const created: ApiOne<WishItem> = await apiFetch(
        baseUrl,
        '/items/wishes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      setCreateMsg(`Deseo #${created.data.id} creado con éxito.`);
      // limpiar form
      setTitle('');
      setDesc('');
      setVisibility('public');
      setCover(null);

      // refrescar listado desde cero
      setItems([]);
      setPage(0);
      setMore(true);
      loadMore();
    } catch (e: any) {
      setCreateMsg(e?.message || 'No se pudo crear el deseo.');
    } finally {
      setCreating(false);
    }
  }

  /** --------- Logout --------- */
  async function logout() {
    try {
      // si estás en cookie-mode, cerrá server-side
      if (USE_COOKIE_MODE) {
        await apiFetch(baseUrl, '/auth/logout', { method: 'POST' });
      }
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setMe(null);
    navigate('/');
  }

  /** --------- UI --------- */
  if (!isLogged) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-semibold">Necesitás iniciar sesión</h1>
        <p className="mt-2 opacity-80">
          Volvé a la Home y entrá con tu cuenta para acceder al panel.
        </p>
        <div className="mt-4">
          <Link
            to="/"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-black/5"
          >
            Ir a Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-24">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">
            Deseándola
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5"
            >
              Refrescar
            </button>
            <button
              onClick={logout}
              className="rounded-xl bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto grid max-w-6xl gap-8 p-4 md:grid-cols-3">
        {/* Perfil */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Mi perfil</h2>

            {loadingMe && <p className="mt-3 text-sm opacity-70">Cargando…</p>}

            {errorMe && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {errorMe}
              </div>
            )}

            {me && !loadingMe && (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-100">
                    {me.avatar ? (
                      <img
                        src={assetUrl(baseUrl, me.avatar) || ''}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs opacity-50">
                        Sin avatar
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{fullName(me) || '(sin nombre)'}</div>
                    <div className="opacity-70">{me.email}</div>
                  </div>
                </div>

                <div>
                  <span className="font-medium">ID:</span>{' '}
                  <code className="opacity-80">{me.id}</code>
                </div>
                <div>
                  <span className="font-medium">Rol:</span>{' '}
                  {typeof me.role === 'object'
                    ? (me.role?.name || (me.role as any)?.id)
                    : me.role || '—'}
                </div>
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  {me.status || '—'}
                </div>
              </div>
            )}
          </div>

          {/* Crear deseo */}
          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Crear nuevo deseo</h3>
            <form onSubmit={createWish} className="mt-3 space-y-3 text-sm">
              <div>
                <label className="mb-1 block font-medium">Título</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mi viaje a…"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Descripción</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detalles, contexto, objetivos…"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Visibilidad</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as 'public' | 'private')
                  }
                >
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-medium">Portada (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] || null)}
                />
                {cover && (
                  <div className="mt-1 text-xs opacity-70">
                    {cover.name} • {Math.round(cover.size / 1024)} KB
                  </div>
                )}
              </div>

              {createMsg && (
                <div className="rounded border border-neutral-200 bg-neutral-50 p-2">
                  {createMsg}
                </div>
              )}

              <button
                disabled={creating}
                className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                  creating
                    ? 'cursor-not-allowed bg-neutral-400'
                    : 'bg-black hover:bg-neutral-800'
                }`}
              >
                {creating ? 'Creando…' : 'Crear deseo'}
              </button>
            </form>
          </div>
        </section>

        {/* Mis deseos */}
        <section className="md:col-span-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mis deseos</h2>
              <Link
                to="/"
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-black/5"
              >
                Ver Home
              </Link>
            </div>

            {loadingList && items.length === 0 && (
              <p className="text-sm opacity-70">Cargando…</p>
            )}

            {errorList && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {errorList}
              </div>
            )}

            {items.length === 0 && !loadingList && !errorList && (
              <p className="text-sm opacity-70">Aún no creaste deseos.</p>
            )}

            {items.length > 0 && (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((w) => {
                    const img = assetUrl(baseUrl, w.cover_image);
                    const owner =
                      typeof w.owner === 'object'
                        ? `${w.owner?.first_name || ''} ${w.owner?.last_name || ''}`.trim()
                        : '';
                    return (
                      <li
                        key={w.id}
                        className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                      >
                        <Link to={`/wish/${w.id}`} className="block">
                          <div className="aspect-[4/3] w-full bg-neutral-100">
                            {img ? (
                              <img
                                src={img}
                                alt={w.title || ''}
                                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm opacity-50">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="text-sm opacity-70">
                              #{w.id} • {w.visibility || '—'}
                            </div>
                            <div className="text-base font-semibold">
                              {w.title || '(sin título)'}
                            </div>
                            {owner && (
                              <div className="mt-0.5 text-xs opacity-70">
                                por {owner}
                              </div>
                            )}
                            {w.description && (
                              <p className="mt-2 line-clamp-3 text-sm opacity-80">
                                {w.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex items-center justify-center">
                  <button
                    onClick={loadMore}
                    disabled={!more || loadingList}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      !more || loadingList
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    {loadingList ? 'Cargando…' : more ? 'Cargar más' : 'No hay más'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
