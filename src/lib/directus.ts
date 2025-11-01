// src/lib/directus.ts
// Cliente centralizado para Directus con soporte de runtime config (window.__APP_CONFIG__)
// y fallback a variables de Vite. Sin throws en build-time.

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
// Runtime/Vite Config
// =========================
declare global {
  interface Window {
    __APP_CONFIG__?: {
      DIRECTUS_URL?: string;
      DIRECTUS_TOKEN?: string; // opcional
    };
  }
}

const TOKEN_KEY = 'directus_access_token'; // si guardás el access_token acá
const REFRESH_KEY = 'directus_refresh_token'; // por si lo usás después

function readRuntimeUrl(): string | undefined {
  return window.__APP_CONFIG__?.DIRECTUS_URL?.trim() || undefined;
}
function readRuntimeToken(): string | undefined {
  return window.__APP_CONFIG__?.DIRECTUS_TOKEN?.trim() || undefined;
}
function readViteUrl(): string | undefined {
  // Vite fallback
  const v = (import.meta as any).env?.VITE_DIRECTUS_URL as string | undefined;
  return v?.trim() || undefined;
}
function readViteToken(): string | undefined {
  const v = (import.meta as any).env?.VITE_DIRECTUS_TOKEN as string | undefined;
  return v?.trim() || undefined;
}

/** URL base limpia, prioriza runtime y luego Vite */
export function getBaseUrl(): string {
  const url = readRuntimeUrl() || readViteUrl();
  if (!url) {
    // Error en TIEMPO DE EJECUCIÓN (cuando se llame), no en build.
    throw new Error('Directus URL no configurada. Definí DIRECTUS_URL en /config.js o VITE_DIRECTUS_URL.');
  }
  const cleaned = url.replace(/\/+$/, '');
  return cleaned.endsWith('/admin') ? cleaned.slice(0, -6) : cleaned;
}

/** Token estático (si querés dejar uno por config). Preferís SIEMPRE token de sesión. */
function getConfiguredStaticToken(): string | undefined {
  return readRuntimeToken() || readViteToken();
}

/** Token de sesión (si hiciste login y guardaste el access_token) */
function getSessionToken(): string | undefined {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    return t || undefined;
  } catch {
    return undefined;
  }
}

/** Token final para Authorization: Bearer ... */
function resolveAuthToken(): string | undefined {
  // Prioriza token de sesión
  return getSessionToken() || getConfiguredStaticToken();
}

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
  const base = getBaseUrl();
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

  const token = resolveAuthToken();
  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  // Logs útiles en desarrollo
  console.log('📡 Llamando a API:', method, path, params || {});
  console.log('🌐 URL completa:', url);
  if (token) console.log('🔑 Auth: Bearer (presente)');

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // si solo usás Bearer podrías cambiar a 'omit'
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
      // status: { _eq: 'published' }, // si lo usás en tu esquema
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

// Exposición opcional de la URL limpia (por si la querés mostrar en UI/monitor)
export const DIRECTUS_URL = (() => getBaseUrl())();
