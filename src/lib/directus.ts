// src/lib/directus.ts
// Cliente centralizado para consumir Directus con URLs ABSOLUTAS (nunca relativas)

import type {
  WishesQueryParams,
  EventsQueryParams,
  GiftsQueryParams,
  UserInfo,
  Wish,
  Event,
  Gift,
} from '../features/wishes/types';

// =========================
// Environment (Vite build-time)
// =========================
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN; // opcional

if (!DIRECTUS_URL) {
  // Rompemos en build/runtime si falta, para que no vuelva a caer en window.location.origin
  throw new Error('VITE_DIRECTUS_URL is not defined at build time');
}

// Debug inicial
console.log('🔗 Configuración Directus:', {
  DIRECTUS_URL,
  hasToken: Boolean(DIRECTUS_TOKEN),
});

// =========================
// Utils
// =========================
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ApiOptions = {
  method?: HttpMethod;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
};

type ApiResponse<T = any> = {
  data: T | T[];
  meta?: any;
  errors?: any[];
};

function toQuery(params?: Record<string, any>) {
  const qs = new URLSearchParams();
  if (!params) return '';

  const append = (key: string, value: any) => {
    if (value === undefined || value === null) return;
    qs.append(key, String(value));
  };

  // Admite objetos como filter[visibility][_eq]=public etc.
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // anidado simple (e.g., filter: { visibility: { _eq: 'public' } })
      // Directus espera filter[visibility][_eq]=public
      if (key === 'filter') {
        for (const [fKey, fVal] of Object.entries(value as Record<string, any>)) {
          if (typeof fVal === 'object' && fVal !== null) {
            for (const [opKey, opVal] of Object.entries(fVal as Record<string, any>)) {
              append(`filter[${fKey}][${opKey}]`, opVal);
            }
          } else {
            append(`filter[${fKey}]`, fVal);
          }
        }
      } else {
        // otros objetos, lo aplanamos en JSON por simplicidad
        append(key, JSON.stringify(value));
      }
    } else if (Array.isArray(value)) {
      // múltiples valores (e.g., fields=*,relacion.*)
      value.forEach((v) => append(key, v));
    } else {
      append(key, value);
    }
  }

  const s = qs.toString();
  return s ? `?${s}` : '';
}

function absoluteUrl(path: string, params?: Record<string, any>) {
  // Garantiza que SIEMPRE apuntemos al host de Directus
  const base = DIRECTUS_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}${toQuery(params)}`;
}

async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', params, body, headers = {} } = opts;
  const url = absoluteUrl(path, params);

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (DIRECTUS_TOKEN && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${DIRECTUS_TOKEN}`;
  }

  console.log('📡 Llamando a API:', method, path, params || {});
  console.log('🌐 URL completa:', url);
  console.log('🧾 Headers:', {
    ...finalHeaders,
    ...(finalHeaders.Authorization ? { Authorization: '[REDACTED]' } : {}),
  });

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: ApiResponse<T> | null = null;
  try {
    json = text ? (JSON.parse(text) as ApiResponse<T>) : ({} as ApiResponse<T>);
  } catch {
    // si no es JSON, cae abajo
  }

  if (!res.ok) {
    console.error('❌ HTTP Error:', res.status, text || json);
    throw new Error(`HTTP ${res.status}: ${text || JSON.stringify(json)}`);
  }

  return (json || { data: null }) as ApiResponse<T>;
}

// =========================
// Filtros comunes
// =========================
function getPublicWishesFilter() {
  return {
    filter: {
      visibility: { _eq: 'public' },
      // Si usas status de Directus para publicados, descomenta:
      // status: { _eq: 'published' },
    },
  };
}

// =========================
/** API de Dominio: Wishes */
// =========================
export const wishApi = {
  // Lista de deseos (paginada)
  async getWishes(params: WishesQueryParams = {}): Promise<ApiResponse<Wish>> {
    console.log('Intentando obtener deseos con params:', params);

    const mergedParams = {
      sort: params.sort ?? '-id',
      limit: params.limit ?? 12,
      offset: params.offset ?? 0,
      ...getPublicWishesFilter(),
      ...params,
    };

    console.log('Params finales para obtener deseos:', mergedParams);
    return api<Wish>('/items/wishes', { method: 'GET', params: mergedParams });
  },

  // Detalle por ID
  async getWishById(id: string | number): Promise<ApiResponse<Wish>> {
    if (!id && id !== 0) throw new Error('getWishById: id requerido');
    return api<Wish>(`/items/wishes/${id}`, { method: 'GET' });
  },
};

// =========================
/** API de Dominio: Events (si la usas) */
// =========================
export const eventsApi = {
  async getEvents(params: EventsQueryParams = {}): Promise<ApiResponse<Event>> {
    const mergedParams = {
      sort: params.sort ?? '-date',
      limit: params.limit ?? 12,
      offset: params.offset ?? 0,
      ...params,
    };
    return api<Event>('/items/events', { method: 'GET', params: mergedParams });
  },
};

// =========================
/** API de Dominio: Gifts (si la usas) */
// =========================
export const giftsApi = {
  async getGifts(params: GiftsQueryParams = {}): Promise<ApiResponse<Gift>> {
    const mergedParams = {
      sort: params.sort ?? '-id',
      limit: params.limit ?? 12,
      offset: params.offset ?? 0,
      ...params,
    };
    return api<Gift>('/items/gifts', { method: 'GET', params: mergedParams });
  },
};

// =========================
/** Helpers Admin / Debug */
// =========================
export const adminApi = {
  async listCollections() {
    const response = await api('/collections', {
      method: 'GET',
      params: {
        fields: 'collection,meta.icon',
        limit: -1,
      },
    });
    console.log('Respuesta de colecciones:', response);
    return response as ApiResponse<any>;
  },
};

// Export de tipos por conveniencia
export type { Wish, Event, Gift, UserInfo };
