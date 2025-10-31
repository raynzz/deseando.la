// src/features/wishes/hooks.ts
import { useQuery, useInfiniteQuery, QueryKey } from '@tanstack/react-query';
import { wishApi } from '@/lib/directus';
import type { Wish } from './types';

/**
 * Claves base para cache de React Query
 */
const WISHES_KEY = ['wishes'] as const;
const WISH_KEY = ['wish'] as const;

/**
 * Tipos de opciones de consulta
 */
type UseWishesOptions = {
  limit?: number;
  offset?: number;
  visibility?: 'public' | 'private';
  sort?: string; // ejemplo: '-id'
  enabled?: boolean;
  // Puedes agregar más filtros si hace falta (status, etc.)
};

type UseInfiniteWishesOptions = {
  pageSize?: number;
  visibility?: 'public' | 'private';
  sort?: string; // ejemplo: '-id'
  enabled?: boolean;
};

/**
 * Hook: Lista de deseos (paginación clásica con limit/offset)
 * Retorna data (Wish[]), meta y mantiene el ApiResponse original en raw
 */
export function useWishes(opts: UseWishesOptions = {}) {
  const {
    limit = 12,
    offset = 0,
    visibility = 'public',
    sort = '-id',
    enabled = true,
  } = opts;

  const key: QueryKey = [...WISHES_KEY, { limit, offset, visibility, sort }];

  return useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      // Nota: wishApi.getWishes ya aplica por defecto visibility=public (mergeado),
      // acá igualmente lo explicitamos para claridad/override.
      const res = await wishApi.getWishes({
        limit,
        offset,
        sort,
        visibility,
      } as any);
      return res;
    },
    select: (res) => {
      const list = Array.isArray(res.data) ? (res.data as Wish[]) : [];
      return {
        list,
        meta: res.meta ?? {},
        raw: res,
      };
    },
    staleTime: 30_000, // 30s de frescura
    gcTime: 5 * 60_000, // 5 min en cache
    retry: 2,
  });
}

/**
 * Hook: Lista infinita de deseos (para “Load more” / infinite scroll)
 * Usa offset basado en pageParam
 */
export function useInfiniteWishes(opts: UseInfiniteWishesOptions = {}) {
  const {
    pageSize = 12,
    visibility = 'public',
    sort = '-id',
    enabled = true,
  } = opts;

  const key: QueryKey = [...WISHES_KEY, 'infinite', { pageSize, visibility, sort }];

  return useInfiniteQuery({
    queryKey: key,
    enabled,
    /**
     * pageParam será el offset (inicia en 0)
     */
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = Number(pageParam) || 0;
      const res = await wishApi.getWishes({
        limit: pageSize,
        offset,
        sort,
        visibility,
      } as any);
      return { ...res, __offset: offset };
    },
    getNextPageParam: (lastPage) => {
      // Si el servidor devuelve meta.count / meta.total, podemos calcular el siguiente offset.
      // Fallback simple: si devolvió menos que pageSize, no hay más páginas.
      const items = Array.isArray(lastPage.data) ? lastPage.data : [];
      if (items.length < pageSize) return undefined; // no hay más
      const nextOffset = (lastPage as any).__offset + pageSize;
      return nextOffset;
    },
    select: (data) => {
      // Aplana todas las páginas en una sola lista de Wish
      const pages = data.pages ?? [];
      const list = pages.flatMap((p) => (Array.isArray(p.data) ? (p.data as Wish[]) : []));
      return {
        list,
        pages,
        pageParams: data.pageParams,
      };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}

/**
 * Hook: Detalle de un deseo por ID
 */
export function useWish(id?: string | number, enabled: boolean = true) {
  const key: QueryKey = [...WISH_KEY, { id }];

  return useQuery({
    queryKey: key,
    enabled: enabled && Boolean(id),
    queryFn: async () => {
      if (id === undefined || id === null) throw new Error('useWish: id es requerido');
      const res = await wishApi.getWishById(id);
      return res;
    },
    select: (res) => {
      // El detalle viene como objeto en data (no array)
      const item = (!Array.isArray(res.data) ? (res.data as Wish) : null) as Wish | null;
      return {
        item,
        raw: res,
      };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}

/**
 * Exports útiles por si querés invalidar desde componentes externos:
 */
export const wishesKeys = {
  all: WISHES_KEY,
  list: (p?: UseWishesOptions) => [...WISHES_KEY, p ?? {}] as const,
  infinite: (p?: UseInfiniteWishesOptions) => [...WISHES_KEY, 'infinite', p ?? {}] as const,
  detail: (id: string | number) => [...WISH_KEY, { id }] as const,
};
