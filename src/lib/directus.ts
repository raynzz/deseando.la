// src/lib/directus.ts
// Cliente centralizado para Directus con URLs ABSOLUTAS y helpers estrictos.

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ApiOptions = {
  method?: HttpMethod;
  params?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
};

export type ApiResponse<T = unknown> = {
  data: T | T[];
  meta?: unknown;
  errors?: unknown[];
};

// =========================
// Environment (Vite build-time)
// =========================
const RAW_URL = import.meta.env.VITE_DIRECTUS_URL as string | undefined;
const RAW_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN as string | undefined;

if (!RAW_URL || RAW_URL.trim() === '') {
  throw new Error('VITE_DIRECTUS_URL is not defined at build time');
}

const DIRECTUS_URL: string = RAW_URL.trim();
const DIRECTUS_TOKEN: string | undefined = RAW_TOKEN?.trim();

console.log('🔗 Configuración Directus:', {
  DIRECTUS_URL,
  hasToken: Boolean(DIRECTUS_TOKEN),
});

// Verificar si la URL termina con /admin y quitarlo si es necesario
let cleanDirectusUrl = DIRECTUS_URL;
if (cleanDirectusUrl.endsWith('/admin')) {
  cleanDirectusUrl = cleanDirectusUrl.slice(0, -6);
  console.log('🔧 URL Directus corregida (quitando /admin):', cleanDirectusUrl);
}

// Exportar la URL limpia para usarla en los componentes
export { DIRECTUS_URL: cleanDirectusUrl };

// =========================
// Utils
// =========================
function toQuery(params?: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  if (!params) return '';

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    qs.append(key, String(value));
  };

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => append(key, v));
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      if (key === 'filter') {
        for (const [fKey, fVal] of Object.entries(value as Record<string, unknown>)) {
          if (typeof fVal === 'object' && fVal !== null) {
            for (const [opKey, opVal] of Object.entries(fVal as Record<string, unknown>)) {
              append(`filter[${fKey}][${opKey}]`, opVal);
            }
          } else {
            append(`filter[${fKey}]`, fVal);
          }
        }
      } else {
        // Cualquier otro objeto lo serializamos
        append(key, JSON.stringify(value));
      }
      continue;
    }
    append(key, value);
  }

  const s = qs.toString();
  return s ? `?${s}` : '';
}

function absoluteUrl(path: string, params?: Record<string, unknown>): string {
  const base = cleanDirectusUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}${toQuery(params)}`;
}

async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<ApiResponse<T>> {
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
    // respuesta no-JSON
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
      // Si usas status publicados en Directus:
      // status: { _eq: 'published' },
    },
  };
}

// =========================
// API de Dominio: Wishes
// =========================
export const wishApi = {
  async getWishes(params: Record<string, unknown> = {}) {
    const mergedParams = {
      sort: (params as any).sort ?? '-id',
      limit: (params as any).limit ?? 12,
      offset: (params as any).offset ?? 0,
      ...getPublicWishesFilter(),
      ...params,
    };
    return api('/items/wishes', { method: 'GET', params: mergedParams });
  },

  async getWishById(id: string | number) {
    if (!id && id !== 0) throw new Error('getWishById: id requerido');
    return api(`/items/wishes/${id}`, { method: 'GET' });
  },
};

// =========================
// Helper público
// =========================
export function getBaseUrl(): string {
  return cleanDirectusUrl;
}
