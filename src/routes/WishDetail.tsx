import React from 'react';
import { useParams } from 'react-router-dom';
import { useWish } from '@/features/wishes/hooks';
import type { Wish } from '@/features/wishes/types';

export default function WishDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useWish(id!, Boolean(id));

  const wish = (data?.item ?? null) as Wish | null;

  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Detalle del deseo</h1>

      {isLoading && <p>Cargando…</p>}

      {isError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
          {(error as Error)?.message || 'Error'}
        </div>
      )}

      {!isLoading && !isError && !wish && <p>No se encontró el deseo.</p>}

      {!isLoading && !isError && wish && (
        <article className="rounded-xl border p-4 shadow-sm space-y-2">
          <div className="text-sm opacity-70">ID: {wish.id}</div>
          <h2 className="text-xl font-semibold">
            {(wish as any).title || (wish as any).name || '(sin título)'}
          </h2>
          {/* Renderiza más campos reales si existen en tu colección */}
        </article>
      )}
    </main>
  );
}
