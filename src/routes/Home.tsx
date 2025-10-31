import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteWishes } from '@/features/wishes/hooks';
import type { Wish } from '@/features/wishes/types';
import { getBaseUrl } from '@/lib/directus';

/* ---------------------------------- */
/* Types                               */
/* ---------------------------------- */
type HealthState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ok'; info: any; checkedAt: string }
  | { status: 'error'; error: string; checkedAt: string };

/* ---------------------------------- */
/* Modal de Registro                   */
/* ---------------------------------- */
function SignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');

  const canSubmit = name.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí podrías integrar tu endpoint de registro
    console.log('📝 Registro:', { name, email, link });
    onClose();
    setName('');
    setEmail('');
    setLink('');
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Creá tu cuenta</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-1 text-xs opacity-70">
              Te enviaremos novedades y herramientas para que tu deseo avance.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Enlace (opcional)
            </label>
            <input
              type="url"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="Perfil, web, lista de regalos…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-lg px-4 py-2 font-medium text-white transition ${
              canSubmit
                ? 'bg-black hover:bg-neutral-800'
                : 'bg-neutral-400 cursor-not-allowed'
            }`}
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Bento Grid                          */
/* ---------------------------------- */
function BentoSection() {
  return (
    <section className="mx-auto max-w-5xl px-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Potenciá tu deseo</h2>
        <p className="text-sm opacity-80">
          Elegí caminos para sumar impulso y conseguir apoyo genuino.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-5 shadow-sm">
          <h3 className="text-lg font-medium">Sumate y ofrecé tu talento</h3>
          <p className="mt-2 text-sm opacity-80">
            Conectá con personas que necesitan lo que hacés. Proponé tu ayuda y
            construí reputación desde el valor real.
          </p>
          <button className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-black/5">
            Empezar
          </button>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <h3 className="text-lg font-medium">Mové tu red</h3>
          <p className="mt-2 text-sm opacity-80">
            Destacá tu deseo y compartilo fácil para activar apoyo entre tus
            contactos.
          </p>
          <button className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-black/5">
            Compartir ahora
          </button>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <h3 className="text-lg font-medium">Unite a la comunidad</h3>
          <p className="mt-2 text-sm opacity-80">
            Descubrí historias, consejos y oportunidades para que los deseos se
            hagan realidad.
          </p>
          <button className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-black/5">
            Ver más
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- */
/* Carrusel de casos de uso           */
/* ---------------------------------- */
type UseCase = { title: string; desc: string; emoji: string };

const USE_CASES: UseCase[] = [
  {
    title: 'Planificar un viaje',
    desc:
      'Organizá etapas, sumá ayuda de tu círculo y conseguí lo necesario para llegar.',
    emoji: '🧭',
  },
  {
    title: 'Regalos de cumpleaños',
    desc:
      'Armá tu lista, compartila y facilitá que te apoyen con lo que más querés.',
    emoji: '🎁',
  },
  {
    title: 'Causa benéfica',
    desc:
      'Reuní aportes y voluntades para una obra con impacto real en tu comunidad.',
    emoji: '🤝',
  },
  {
    title: 'Proyecto creativo',
    desc:
      'Mostrá tu idea, sumá colaboradores y convertí intención en resultados.',
    emoji: '🎨',
  },
  {
    title: 'Equipar tu hogar',
    desc:
      'Definí prioridades y conseguí apoyo para lo que te hace la vida más fácil.',
    emoji: '🏠',
  },
];

function UseCasesCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? USE_CASES.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === USE_CASES.length - 1 ? 0 : i + 1));

  return (
    <section className="mx-auto max-w-5xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">¿Para qué podés usarlo?</h2>
          <p className="text-sm opacity-80">Elegí ideas y empezá hoy.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>

      {/* Carrusel sin dependencias: solo cambia el índice */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="flex transition-transform duration-300"
               style={{ transform: `translateX(-${index * 100}%)`, width: `${USE_CASES.length * 100}%` }}>
            {USE_CASES.map((c, i) => (
              <div key={i} className="w-full shrink-0 p-6 md:p-8" style={{ width: `${100 / USE_CASES.length}%` }}>
                <div className="mx-auto max-w-3xl rounded-xl border p-6 shadow-sm">
                  <div className="text-4xl">{c.emoji}</div>
                  <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm opacity-80">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-3 flex justify-center gap-2">
          {USE_CASES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${
                i === index ? 'bg-black' : 'bg-black/20'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- */
/* Sidebar de diagnóstico/monitor     */
/* ---------------------------------- */
function DebugSidebar({
  open,
  onClose,
  baseUrl,
  firstPageUrl,
  pageSize,
  totalShown,
  isLoading,
  isError,
  error,
  health,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
}: {
  open: boolean;
  onClose: () => void;
  baseUrl: string;
  firstPageUrl: string;
  pageSize: number;
  totalShown: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  health: HealthState;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
}) {
  return (
    <>
      {/* Botón flotante para abrir/cerrar en pantallas grandes */}
      <button
        onClick={onClose}
        className={`fixed right-4 top-24 z-[55] rounded-full border bg-white px-3 py-1 text-sm shadow-sm hover:bg-black/5 md:right-6 ${
          open ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        Monitor
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 z-[60] h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 md:rounded-l-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-base font-semibold">Monitor de conexión</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5"
            aria-label="Cerrar monitor"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4 text-sm">
          <div>
            <div className="font-semibold">Directus URL:</div>
            <div className="break-all">{baseUrl}</div>
          </div>
          <div>
            <div className="font-semibold">Endpoint (1ª página):</div>
            <code className="break-all">{firstPageUrl}</code>
          </div>
          <div>
            <span className="font-semibold">Estado Query:</span>{' '}
            {isLoading ? 'loading…' : isError ? 'error' : 'success'}
            {isFetching && !isLoading ? ' (actualizando…)': null}
          </div>
          {!isLoading && !isError && (
            <>
              <div>
                <span className="font-semibold">Tamaño de página:</span> {pageSize}
              </div>
              <div>
                <span className="font-semibold">Items mostrados:</span> {totalShown}
              </div>
            </>
          )}
          {isError && (
            <div className="text-red-600">
              <span className="font-semibold">Error:</span>{' '}
              {(error as Error)?.message || 'Unknown error'}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={refetch}
              className="rounded-lg border px-3 py-1 hover:bg-black/5"
            >
              Reintentar
            </button>
            <button
              onClick={fetchNextPage}
              disabled={!hasNextPage || isFetchingNextPage}
              className={`rounded-lg border px-3 py-1 ${
                (!hasNextPage || isFetchingNextPage)
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-black/5'
              }`}
              title={!hasNextPage ? 'No hay más páginas' : 'Cargar más'}
            >
              {isFetchingNextPage ? 'Cargando…' : hasNextPage ? 'Cargar más' : 'No hay más'}
            </button>
          </div>

          <div className="rounded-2xl border p-3">
            <div className="font-semibold">/server/health</div>
            <div className="mt-1">
              <span className="font-semibold">Estado:</span> {health.status}
              {'checkedAt' in health && (health as any).checkedAt ? (
                <span className="ml-2 opacity-70">
                  ({(health as any).checkedAt})
                </span>
              ) : null}
            </div>
            {health.status === 'ok' && (
              <details className="mt-2">
                <summary className="cursor-pointer">Ver respuesta</summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded bg-black/5 p-2 text-xs">
                  {JSON.stringify((health as any).info, null, 2)}
                </pre>
              </details>
            )}
            {health.status === 'error' && (
              <div className="mt-2 text-red-600">
                <span className="font-semibold">Error:</span>{' '}
                {(health as any).error}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------- */
/* Página Home                         */
/* ---------------------------------- */
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

  // Primera página (debug/monitor)
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

  // UI State
  const [showSignup, setShowSignup] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);

  return (
    <main className="relative">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <div className="rounded-3xl border bg-gradient-to-br from-white to-neutral-50 p-8 shadow-sm md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Deseándola
              </h1>
              <p className="mt-3 text-base opacity-80 md:text-lg">
                Compartí tu deseo y dejá que se cumpla. Mostrá lo que querés
                lograr, activá tu red y conectá con quienes pueden ayudarte.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowSignup(true)}
                  className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Crear mi cuenta
                </button>
                <button
                  onClick={() => setShowMonitor(true)}
                  className="rounded-xl border px-5 py-2.5 text-sm hover:bg-black/5"
                >
                  Ver monitor
                </button>
              </div>
              <p className="mt-2 text-xs opacity-70">
                Gratis. Sin tarjetas. Empezá en minutos.
              </p>
            </div>

            <div className="rounded-2xl border p-6 text-sm opacity-80">
              <p>
                Subí la información de tu deseo, sumá apoyo y seguí el avance
                paso a paso. Todo en un mismo lugar.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Listas organizadas y fáciles de compartir</li>
                <li>Vinculá colaboradores y aportes</li>
                <li>Visibilidad pública o privada</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Listado de deseos */}
      <section className="mx-auto max-w-5xl space-y-3 px-4">
        <h2 className="text-lg font-semibold">Últimos deseos</h2>

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

            {/* Controles al pie */}
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

      {/* Bento */}
      <div className="mt-14">
        <BentoSection />
      </div>

      {/* Carrusel */}
      <div className="mt-14 mb-24">
        <UseCasesCarousel />
      </div>

      {/* Sidebar de monitor/diagnóstico */}
      <DebugSidebar
        open={showMonitor}
        onClose={() => setShowMonitor(false)}
        baseUrl={baseUrl}
        firstPageUrl={firstPageUrl}
        pageSize={pageSize}
        totalShown={totalShown}
        isLoading={isLoading}
        isError={isError}
        error={error}
        health={health}
        refetch={refetch}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetching={isFetching}
      />

      {/* Modal registro */}
      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </main>
  );
}
