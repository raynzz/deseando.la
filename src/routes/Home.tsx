import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteWishes } from '@/features/wishes/hooks';
import type { Wish } from '@/features/wishes/types';
import { getBaseUrl } from '@/lib/directus';

type HealthState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ok'; info: any; checkedAt: string }
  | { status: 'error'; error: string; checkedAt: string };

export default function Home() {
  // Parámetros base
  const pageSize = 12;
  const sort = '-id';
  const visibility: 'public' = 'public';

  // Hook infinito
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteWishes({
    pageSize,
    sort,
    visibility,
    enabled: true,
  });

  // Datos listos para mostrar
  const wishes = (data?.list ?? []) as Wish[];
  const totalShown = wishes.length;

  // URL de Directus (tipo estricto)
  const baseUrl: string = getBaseUrl();

  // Primera página (debug en UI)
  const firstPageUrl = useMemo(() => {
    const qs = new URLSearchParams({
      sort,
      limit: String(pageSize),
      offset: String(0),
      'filter[visibility][_eq]': visibility,
    });
    return `${baseUrl}/items/wishes?${qs.toString()}`;
  }, [baseUrl, pageSize, sort, visibility]);

  // Monitor de conexión a Directus (/server/health)
  const [health, setHealth] = useState<HealthState>({ status: 'idle' });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        setHealth({ status: 'checking' });
        const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/server/health`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const txt = await res.text();
        const json = txt ? JSON.parse(txt) : {};
        if (!mounted) return;
        setHealth({
          status: 'ok',
          info: json,
          checkedAt: new Date().toLocaleString(),
        });
      } catch (e: any) {
        if (!mounted) return;
        setHealth({
          status: 'error',
          error: e?.message || 'Unknown error',
          checkedAt: new Date().toLocaleString(),
        });
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  return (
    <main className="container mx-auto max-w-5xl p-6 space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Deseándola — Homee</h1>
        <p className="text-sm opacity-80">Listado de deseos públicos (infinite scroll / “Load more”)</p>
      </header>

      {/* Monitor de conexión y resumen de consulta */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-3">🔍 Resumen de consulta</h2>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Directus URL:</span> {baseUrl}</div>
            <div><span className="font-semibold">Endpoint (1ª página):</span> <code className="break-all">{firstPageUrl}</code></div>
            <div>
              <span className="font-semibold">Estado Query:</span>{' '}
              {isLoading ? 'loading…' : isError ? 'error' : 'success'}
              {isFetching && !isLoading ? ' (actualizando…)': null}
            </div>
            {!isLoading && !isError && (
              <>
                <div><span className="font-semibold">Tamaño de página:</span> {pageSize}</div>
                <div><span className="font-semibold">Items mostrados:</span> {totalShown}</div>
              </>
            )}
            {isError && (
              <div className="text-red-600">
                <span className="font-semibold">Error:</span>{' '}
                {(error as Error)?.message || 'Unknown error'}
              </div>
            )}
          </div>

          {/* Controles de la query */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5"
            >
              Reintentar
            </button>

            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className={`rounded-lg border px-3 py-1 text-sm ${(!hasNextPage || isFetchingNextPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5'}`}
              title={!hasNextPage ? 'No hay más páginas' : 'Cargar más'}
            >
              {isFetchingNextPage ? 'Cargando…' : hasNextPage ? 'Cargar más' : 'No hay más'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-3">🩺 Monitor de conexión (server/health)</h2>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Estado:</span> {health.status}</div>
            {'checkedAt' in health && health.checkedAt && (
              <div><span className="font-semibold">Última verificación:</span> {health.checkedAt}</div>
            )}
            {health.status === 'ok' && (
              <details className="mt-2">
                <summary className="cursor-pointer">Ver respuesta</summary>
                <pre className="mt-2 p-2 bg-black/5 rounded text-xs overflow-auto">
                  {JSON.stringify(health.info, null, 2)}
                </pre>
              </details>
            )}
            {health.status === 'error' && (
              <div className="text-red-600">
                <span className="font-semibold">Error:</span> {health.error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lista de deseos */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">🧾 Resultados</h2>

        {isLoading && <p className="opacity-70">Cargando…</p>}

        {isError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
            Ocurrió un error al cargar los deseos.
          </div>
        )}

        {!isLoading && !isError && totalShown === 0 && (
          <p className="opacity-70">No hay deseos públicos disponibles.</p>
        )}

        {!isLoading && !isError && totalShown > 0 && (
          <>
            <ul className="grid gap-4 md:grid-cols-2">
              {wishes.map((w) => (
                <li key={w.id} className="rounded-xl border p-4 shadow-sm">
                  <div className="text-sm opacity-70">ID: {w.id}</div>
                  <div className="text-base font-semibold">
                    {(w as any).title || (w as any).name || '(sin título)'}
                  </div>
                </li>
              ))}
            </ul>

            {/* Controles al pie también */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => refetch()}
                className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5"
              >
                Reintentar
              </button>

              <button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                className={`rounded-lg border px-3 py-1 text-sm ${(!hasNextPage || isFetchingNextPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5'}`}
              >
                {isFetchingNextPage ? 'Cargando…' : hasNextPage ? 'Cargar más' : 'No hay más'}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
