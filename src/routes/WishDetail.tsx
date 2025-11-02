import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBaseUrl } from '@/lib/directus';

/** ==========================
 *  Config básica / Helpers
 *  ========================== */
const TOKEN_KEY = 'directus_access_token';
const USE_COOKIE_MODE = false; // cambia a true si usas auth por cookies

type UserLite = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

type Wish = {
  id: number;
  title?: string | null;
  description?: string | null;
  visibility?: 'public' | 'private';
  status?: string | null;
  cover_image?: string | null;
  owner?: UserLite | string | null;
  wish_collaborators?: { id: number; user?: UserLite | string | null }[]; // relación many-to-many
  date_created?: string;
};

type Gift = {
  id: number;
  wish?: number | null;
  amount?: number | null;
  message?: string | null;
  created_at?: string | null;
  giver_name?: string | null; // si tu esquema guarda nombre libre
  giver_user?: UserLite | string | null; // si guarda relación con users
};

type Event = {
  id: number;
  wish?: number | null;
  type?: string | null;        // ej: "created" | "updated" | "gifted" | ...
  notes?: string | null;
  date?: string | null;
  created_at?: string | null;
  actor?: UserLite | string | null; // quién causó el evento
};

type ApiOne<T> = { data: T };
type ApiList<T> = { data: T[]; meta?: { total_count?: number } };

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (!USE_COOKIE_MODE) {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) h['Authorization'] = `Bearer ${t}`;
  }
  return h;
}

async function apiFetch<T = any>(
  baseUrl: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    credentials: USE_COOKIE_MODE ? 'include' : 'omit',
    ...init,
    headers: { ...(init.headers as any), ...apiHeaders() },
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

function fullName(u?: UserLite | string | null) {
  if (!u || typeof u === 'string') return '';
  return `${u.first_name || ''} ${u.last_name || ''}`.trim();
}

function avatarUrl(baseUrl: string, fileId?: string | null) {
  if (!fileId) return null;
  return `${baseUrl.replace(/\/+$/, '')}/assets/${fileId}`;
}

/** ==========================
 *  Componente
 *  ========================== */
export default function WishDetail() {
  const { id } = useParams<{ id: string }>();
  const wishId = Number(id);
  const baseUrl = getBaseUrl();

  const [wish, setWish] = useState<Wish | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Personas relacionadas (dueño, colaboradores, donantes)
  const people = useMemo(() => {
    const list: { key: string; name: string; avatar?: string | null; type: 'owner' | 'collab' | 'giver' }[] = [];

    // Owner
    if (wish?.owner && typeof wish.owner !== 'string') {
      list.push({
        key: `owner:${wish.owner.id}`,
        name: fullName(wish.owner) || wish.owner.email || '(sin nombre)',
        avatar: wish.owner.avatar || null,
        type: 'owner',
      });
    }

    // Colaboradores
    (wish?.wish_collaborators || []).forEach((w) => {
      const u = w.user;
      if (u && typeof u !== 'string') {
        const key = `collab:${u.id}`;
        if (!list.find((p) => p.key === key)) {
          list.push({
            key,
            name: fullName(u) || u.email || '(sin nombre)',
            avatar: u.avatar || null,
            type: 'collab',
          });
        }
      }
    });

    // Donantes (desde gifts)
    gifts.forEach((g) => {
      if (g.giver_user && typeof g.giver_user !== 'string') {
        const u = g.giver_user;
        const key = `giver:${u.id}`;
        if (!list.find((p) => p.key === key)) {
          list.push({
            key,
            name: fullName(u) || u.email || '(sin nombre)',
            avatar: u.avatar || null,
            type: 'giver',
          });
        }
      } else if (g.giver_name) {
        const key = `giver_name:${g.id}`;
        list.push({
          key,
          name: g.giver_name,
          avatar: null,
          type: 'giver',
        });
      }
    });

    return list;
  }, [wish, gifts]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        // ----- 1) Wish + owner + colaboradores -----
        const wishFields = [
          'id',
          'title',
          'description',
          'visibility',
          'status',
          'cover_image',
          'date_created',
          // owner expand
          'owner.id',
          'owner.first_name',
          'owner.last_name',
          'owner.email',
          'owner.avatar',
          // collaborators deep expand
          'wish_collaborators.id',
          'wish_collaborators.user.id',
          'wish_collaborators.user.first_name',
          'wish_collaborators.user.last_name',
          'wish_collaborators.user.email',
          'wish_collaborators.user.avatar',
        ].join(',');

        const w = await apiFetch<ApiOne<Wish>>(
          baseUrl,
          `/items/wishes/${wishId}?fields=${encodeURIComponent(wishFields)}&limit=1`
        );

        // ----- 2) Gifts del deseo -----
        const giftFields = [
          'id',
          'wish',
          'amount',
          'message',
          'created_at',
          'giver_name',
          // relación a users si existe
          'giver_user.id',
          'giver_user.first_name',
          'giver_user.last_name',
          'giver_user.email',
          'giver_user.avatar',
        ].join(',');

        const gf = await apiFetch<ApiList<Gift>>(
          baseUrl,
          `/items/gifts?filter[wish][_eq]=${wishId}&sort=-id&fields=${encodeURIComponent(
            giftFields
          )}&limit=50`
        );

        // ----- 3) Events del deseo -----
        const eventFields = [
          'id',
          'wish',
          'type',
          'notes',
          'date',
          'created_at',
          'actor.id',
          'actor.first_name',
          'actor.last_name',
          'actor.email',
          'actor.avatar',
        ].join(',');

        const ev = await apiFetch<ApiList<Event>>(
          baseUrl,
          `/items/events?filter[wish][_eq]=${wishId}&sort=-id&fields=${encodeURIComponent(
            eventFields
          )}&limit=50`
        );

        if (!mounted) return;
        setWish(w.data);
        setGifts(gf.data || []);
        setEvents(ev.data || []);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || 'No se pudo cargar el deseo.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (Number.isFinite(wishId)) run();
    else {
      setErr('ID inválido');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [baseUrl, wishId]);

  const coverSrc = useMemo(
    () => avatarUrl(baseUrl, wish?.cover_image),
    [baseUrl, wish?.cover_image]
  );

  return (
    <main className="pb-24">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">Deseándola</Link>
          <Link
            to="/admin"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Ir al Panel
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        {loading && (
          <div className="rounded-2xl border bg-white p-6 text-sm opacity-70">
            Cargando…
          </div>
        )}

        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {err}
          </div>
        )}

        {wish && !loading && !err && (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {coverSrc ? (
              <div className="aspect-[3/1] w-full bg-neutral-100">
                <img
                  src={coverSrc}
                  alt={wish.title || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/1] w-full bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm opacity-60">Sin imagen de portada</p>
                </div>
              </div>
            )}

            <div className="grid gap-6 p-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h1 className="text-2xl font-semibold">{wish.title || '(sin título)'}</h1>
                <div className="mt-1 text-sm opacity-70">
                  #{wish.id} • {wish.visibility || '—'} {wish.status ? `• ${wish.status}` : ''}
                </div>
                {wish.description && (
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed opacity-90">
                    {wish.description}
                  </p>
                )}
              </div>
              <aside className="md:col-span-1">
                <div className="rounded-xl border p-4 text-sm bg-gradient-to-br from-white to-neutral-50">
                  <div className="font-medium">Datos</div>
                  <div className="mt-2 space-y-1 opacity-80">
                    <div>
                      <span className="font-medium">Creado:</span>{' '}
                      {wish.date_created
                        ? new Date(wish.date_created).toLocaleString()
                        : '—'}
                    </div>
                    <div>
                      <span className="font-medium">Visibilidad:</span>{' '}
                      {wish.visibility || '—'}
                    </div>
                    {wish.status && (
                      <div>
                        <span className="font-medium">Estado:</span> {wish.status}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>

      {/* Personas relacionadas */}
      {wish && !loading && !err && (
        <section className="mx-auto mt-8 max-w-6xl px-4">
          <h2 className="mb-3 text-lg font-semibold">Personas relacionadas</h2>
          {people.length === 0 ? (
            <p className="text-sm opacity-70">No hay personas asociadas todavía.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((p) => {
                const img = avatarUrl(baseUrl, p.avatar || undefined);
                return (
                  <li
                    key={p.key}
                    className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200">
                      {img ? (
                        <img src={img} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-medium opacity-50">
                          {p.name[0]?.toUpperCase() || '—'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs uppercase tracking-wide opacity-60">
                        {p.type === 'owner'
                          ? 'Propietario'
                          : p.type === 'collab'
                          ? 'Colaborador'
                          : 'Aportante'}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Regalos */}
      {wish && !loading && !err && (
        <section className="mx-auto mt-10 max-w-6xl px-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Regalos / Aportes</h2>
          </div>
          {gifts.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-sm opacity-70">Aún no hay regalos para este deseo.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gifts.map((g) => {
                const giver =
                  g.giver_user && typeof g.giver_user !== 'string'
                    ? fullName(g.giver_user) || g.giver_user.email
                    : g.giver_name || 'Anónimo';
                const avatar =
                  g.giver_user && typeof g.giver_user !== 'string'
                    ? avatarUrl(baseUrl, g.giver_user.avatar || undefined)
                    : null;
                return (
                  <li key={g.id} className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200">
                        {avatar ? (
                          <img src={avatar} alt={giver || ''} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium opacity-50">
                            {giver?.[0]?.toUpperCase() || '—'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{giver}</div>
                        <div className="text-xs opacity-60">
                          {g.created_at ? new Date(g.created_at).toLocaleString() : '—'}
                        </div>
                      </div>
                    </div>
                    {g.amount != null && (
                      <div className="mt-3 text-sm">
                        <span className="opacity-70">Monto:</span>{' '}
                        <span className="font-medium">
                          {new Intl.NumberFormat().format(g.amount)}
                        </span>
                      </div>
                    )}
                    {g.message && (
                      <p className="mt-2 whitespace-pre-wrap text-sm opacity-90">
                        {g.message}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Eventos / Timeline */}
      {wish && !loading && !err && (
        <section className="mx-auto mt-10 max-w-6xl px-4">
          <h2 className="mb-3 text-lg font-semibold">Actividad</h2>
          {events.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm opacity-70">Sin actividad registrada.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {events.map((ev) => {
                const who =
                  ev.actor && typeof ev.actor !== 'string'
                    ? fullName(ev.actor) || ev.actor.email
                    : '';
                const when = ev.date || ev.created_at;
                return (
                  <li key={ev.id} className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm">
                      <span className="font-medium">{ev.type || 'evento'}</span>{' '}
                      {who ? <span className="opacity-80">por {who}</span> : null}
                    </div>
                    <div className="text-xs opacity-60">
                      {when ? new Date(when).toLocaleString() : '—'}
                    </div>
                    {ev.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm opacity-90">{ev.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
