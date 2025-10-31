// src/features/wishes/api.ts
import { getBaseUrl } from '@/lib/directus';

type WishesParams = {
  limit?: number;
  offset?: number;
  visibility?: 'public' | 'private';
  status?: 'published' | 'draft';
  sort?: string; // ej: '-id'
};

export async function fetchWishes(params: WishesParams = {}) {
  const base = getBaseUrl();
  const qs = new URLSearchParams();

  qs.set('sort', params.sort ?? '-id');
  qs.set('limit', String(params.limit ?? 12));
  qs.set('offset', String(params.offset ?? 0));

  // Filtros
  if (params.visibility) qs.set('filter[visibility][_eq]', params.visibility);
  // Si usas status de Directus y quieres solo publicados:
  // qs.set('filter[status][_eq]', params.status ?? 'published');

  const url = `${base}/items/wishes?${qs.toString()}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });

  if (!res.ok) {
    const text = await res.text();
    console.error('HTTP', res.status, text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json(); // { data: [...] }
}

export async function fetchWishById(id: string | number) {
  const base = getBaseUrl();
  const url = `${base}/items/wishes/${id}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });

  if (!res.ok) {
    const text = await res.text();
    console.error('HTTP', res.status, text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json(); // { data: {...} }
}
