import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWish } from '@/features/wishes/hooks';
import type { Wish } from '@/features/wishes/types';
import { getBaseUrl } from '@/lib/directus';

/** Tipos locales en línea con el esquema */
type GiftStatus = 'available' | 'reserved' | 'completed';
type EventT = { id: number; wish: number; title: string; description?: string | null; date?: string | null; location?: string | null; };
type GiftT  = { id: number; wish: number; title: string; description?: string | null; price?: number | null; status: GiftStatus; image?: string | null; };

function assetUrl(baseUrl: string, fileId?: string | null) {
  if (!fileId) return null;
  const clean = baseUrl.replace(/\/+$/, '');
  return `${clean}/assets/${fileId}`;
}

export default function WishDetail() {
  const { id } = useParams<{ id: string }>();
  const enabled = Boolean(id);
  const { data, isLoading, isError, error } = useWish(id!, enabled);
  const baseUrl = getBaseUrl();

  const wish = (data?.item ?? null) as Wish | null;

  // Traer events y gifts del wish (consultas sugeridas en el esquema)
  const [events, setEvents] = useState<EventT[]>([]);
  const [gifts, setGifts]   = useState<GiftT[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchExtras = async () => {
      if (!id) return;
      try {
        setLoadingExtras(true);
        const clean = baseUrl.replace(/\/+$/, '');
        const evRes = await fetch(`${clean}/items/events?fields=id,title,date,location,description,wish&filter[wish][_eq]=${encodeURIComponent(id)}&sort=date`);
        const giRes = await fetch(`${clean}/items/gifts?fields=id,title,price,status,description,wish,image&filter[wish][_eq]=${encodeURIComponent(id)}&sort=title`);
        const ev = await evRes.json();
        const gi = await giRes.json();
        if (!mounted) return;
        setEvents(Array.isArray(ev?.data) ? ev.data as EventT[] : []);
        setGifts(Array.isArray(gi?.data) ? gi.data as GiftT[] : []);
      } catch (e) {
        console.error('Extras error', e);
        if (!mounted) return;
        setEvents([]); setGifts([]);
      } finally {
        if (mounted) setLoadingExtras(false);
      }
    };
    fetchExtras();
    return () => { mounted = false; };
  }, [id, baseUrl]);

  const cover = useMemo(() => assetUrl(baseUrl, (wish as any)?.cover_image), [baseUrl, wish]);
  const ownerName = (wish as any)?.owner?.first_name
    ? `${(wish as any).owner.first_name} ${(wish as any).owner.last_name || ''}`.trim()
    : null;

  return (
    <main className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Detalle del deseo</h1>
        <Link to="/" className="text-sm text-blue-600">← Volver</Link>
      </div>

      {isLoading && <p>Cargando…</p>}

      {isError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
          {(error as Error)?.message || 'Error'}
        </div>
      )}

      {!isLoading && !isError && !wish && <p>No se encontró el deseo.</p>}

      {!isLoading && !isError && wish && (
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* Cover */}
          <div className="aspect-[16/7] w-full bg-neutral-100">
            {cover ? (
              <img src={cover} alt={(wish as any).title || 'Deseo'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm opacity-50">Sin imagen</div>
            )}
          </div>

          <div className="p-5 md:p-6">
            <div className="text-sm opacity-70">ID: {wish.id}</div>
            <h2 className="text-2xl font-semibold">{(wish as any).title || '(sin título)'}</h2>

            <div className="mt-2 grid gap-2 text-sm opacity-80 md:grid-cols-3">
              <div><span className="font-semibold">Visibilidad:</span> {(wish as any).visibility}</div>
              <div><span className="font-semibold">Estado:</span> {(wish as any).status}</div>
              {ownerName && <div><span className="font-semibold">Creado por:</span> {ownerName}</div>}
            </div>

            {(wish as any).description && (
              <p className="mt-3 text-sm opacity-90">{(wish as any).description}</p>
            )}
          </div>
        </article>
      )}

      {/* Regalos */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Regalos</h3>
        {loadingExtras && <p className="opacity-70">Cargando…</p>}
        {!loadingExtras && gifts.length === 0 && <p className="opacity-70">Sin regalos asociados.</p>}
        {!loadingExtras && gifts.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gifts.map(g => {
              const img = assetUrl(baseUrl, g.image || null);
              return (
                <li key={g.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="aspect-[4/3] w-full bg-neutral-100">
                    {img ? <img src={img} alt={g.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm opacity-50">Sin imagen</div>}
                  </div>
                  <div className="p-4">
                    <div className="text-sm opacity-70">#{g.id} • {g.status}</div>
                    <div className="text-base font-semibold">{g.title}</div>
                    {g.price != null && <div className="text-sm opacity-80">Precio: ${Number(g.price).toFixed(2)}</div>}
                    {g.description && <p className="mt-1 text-sm opacity-80">{g.description}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Eventos */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Eventos</h3>
        {loadingExtras && <p className="opacity-70">Cargando…</p>}
        {!loadingExtras && events.length === 0 && <p className="opacity-70">Sin eventos asociados.</p>}
        {!loadingExtras && events.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map(ev => (
              <li key={ev.id} className="rounded-2xl border p-4 shadow-sm">
                <div className="text-sm opacity-70">#{ev.id}</div>
                <div className="text-base font-semibold">{ev.title}</div>
                <div className="mt-1 text-sm opacity-80">
                  {ev.date ? new Date(ev.date).toLocaleString() : 'Sin fecha'}{ev.location ? ` · ${ev.location}` : ''}
                </div>
                {ev.description && <p className="mt-1 text-sm opacity-80">{ev.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
