// src/lib/directus.ts
// Cliente centralizado Directus con URLs ABSOLUTAS (nunca relativas).
// Soluciona "possibly undefined" para TypeScript y expone getBaseUrl(): string.

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ApiOptions = {
  method?: HttpMethod;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
};

export type ApiResponse<T = any> = {
  data: T | T[];
  meta?: any;
  errors?: any[];
};

// =========================
// Environment (Vite build-time)
// =========================
const RAW_URL = import.meta.env.VITE_DIRECTUS_URL as string | undefined;
const RAW_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN as string | undefined;

if (!RAW_URL || RAW_URL.trim() === '') {
  // Cortamos en build/runtime si falta, para evitar fallback a window.location.origin
  throw new Error('VITE_DIRECTUS_URL is not defined at build time');
}

// A partir de aquí, Directus URL es string seguro
const DIRECTUS_URL: string = RAW_URL.trim();
const DIRECTUS_TOKEN: string | undefined = RAW_TOKEN?.trim();

// Debug controlado
console.log('🔗 Configuración Directus:', {
  DIRECTUS_URL,
  hasToken: Boolean(DIRECTUS_TOKEN),
});

// =========================
// Utils
// =========================
function toQuery(params?: Record<string, any>) {
  const qs = new URLSearchParams();
  if (!params) return '';

  const append = (key: string, value: any) => {
    if (value === undefined || value === null) return;
    qs.append(key, String(value));
  };

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
        append(key, JSON.stringify(value));
      }
    } else if (Array.isArray(value)) {
      value.forEach((v) => append(key, v));
    } else {
      append(key, value);
    }
  }

  const s = qs.toString();
  return s ? `?${s}` : '';
}

function absoluteUrl(path: string, params?: Record<string, any>) {
  // DIRECTUS_URL es string garantizado (ver guard arriba)
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
    /* ignore non-JSON */
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
      // Si usas status de Directus para publicados:
      // status: { _eq: 'published' },
    },
  };
}

// =========================
/** API de Dominio: Wishes */
// =========================
export const wishApi = {
  async getWishes(params: Record<stri
