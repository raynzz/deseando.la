// src/lib/directus.ts
// Cliente centralizado para Directus con soporte de runtime config (/config.js)
// y fallback a variables de Vite. Incluye login/logout y manejo de token.

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ApiOptions = {
  method?: HttpMethod;
  params?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  // por si querés forzar sin auth en alguna llamada (ej: /auth/login)
  skipAuth?: boolean;
};

export type ApiResponse<T = unknown> = {
  data: T | T[] | null;
  meta?: unknown;
  errors?: unknown[];
};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      DIRECTUS_URL?: string;
      DIRECTUS_TOKEN?: string; // opcional
    };
  }
}

/* ======================
   Storage keys (session)
   ====================== */
const TOKEN_KEY = 'directus_access_token';
const REFRESH_KEY = 'directus_refresh_token';

/* ======================
   Lectura de config
   ====================== */
function readRuntimeUrl(): string | undefined {
  return window.__APP_CONFIG__?.DIRECTUS_URL?.trim() || undefined;
}
function readRuntimeToken(): string | undefined {
  return window.__APP_CONFIG__?.DIRECTUS_TOKEN?.trim() || undefined;
}
function readViteUrl(): string | undefined {
  const v = (import.meta as any).env?.VITE_DIRECTUS_URL as string | undefined;
  return v?.trim() || undefined;
}
function readViteToken(): string | undefined {
  const v = (import.meta as any).env?.VITE_DIRECTUS_TOKEN as string | undefined;
  return v?.trim() || undefined;
}

export function getBaseUrl(): string {
  const base = readRuntimeUrl() || readViteUrl();
  if (!base) {
    throw new Error('Directus URL no configurada. Definí DIRECTUS_URL en /config.js o VITE_DIRECTUS_URL.');
  }
  const cleaned = base.replace(/\/+$/, '');
  return cleaned.endsWith('/admin') ? cleaned.slice(0, -6) : cleaned;
}

/* ======================
   Token (Bearer)
   ====================== */
function getConfiguredStaticToken(): string | undefined {
  return readRuntimeToken() || readViteToken();
}
function getSessionToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}
function setSessionTokens(access?: string, refresh?: string) {
  try {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  } catch {}
}
export function clearSessionTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}
function resolveAuthToken(): string | undefined {
  return getSessionToken() || getConfiguredStaticToken();
}

/* ======================
   Utils
   ====================== */
function toQuery(params?: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  if (!params) return '';
  const append = (k: string, v: unknown) => {
    if (v === undefined || v === null) return;
    qs.append(k, String(v));
  };

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => append(key, v));
    } else if (typeof value === 'object' && value !== null) {
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
    } else {
      append(key, value);
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function absoluteUrl(path: string, params?: Record<string, unknown>): string {
  const base = getBaseUrl().replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}${toQuery(params)}`;
}

/* ======================
   Core fetch
   ====================== */
async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', params, body, headers = {}, skipAuth = false } = opts;
  const url = absoluteUrl(path, params);

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const token = !skipAuth ? resolveAuthToken() : undefined;
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  // Logs útiles
  console.log('📡 Llamando a API:', method, path, params || {});
  console.log('🌐 URL completa:', url);
  if (token) console.log('🔑 Usando Bearer token');

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit', // usamos Bearer; no cookies
  });

  const text = await res.text();
  let json: ApiResponse<T> | null = null;
  try {
    json = text ? (JSON.parse(text) as ApiResponse<T>) : ({} as ApiResponse<T>);
  } catch {
    // respuesta no JSON
  }

  if (!res.ok) {
    console.error('❌ HTTP Error:', res.status, text || json);
    throw new Error(`HTTP ${res.status}: ${text || JSON.stringify(json)}`);
  }

  return (json || { data: null }) as ApiResponse<T>;
}

/* ======================
   Auth helpers
   ====================== */
export async function login(email: string, password: string) {
  // Directus 11 devuelve { data: { access_token, refresh_token, expires } }
  console.log('Intentando login con:', { email });
  const resp = await api<{ access_token?: string; refresh_token?: string }>(
    '/auth/login',
    { method: 'POST', body: { email, password }, skipAuth: true }
  );

  // Aceptamos distintas formas (por si cambia la forma en tu instancia)
  const raw = resp?.data as any;
  const access = raw?.access_token || (resp as any)?.access_token;
  const refresh = raw?.refresh_token || (resp as any)?.refresh_token;

  console.log('Response data:', resp);
  if (!access) {
    throw new Error('No recibí access_token en el login');
  }
  setSessionTokens(access, refresh);
  return { access_token: access, refresh_token: refresh };
}

export async function logout() {
  clearSessionTokens();
  // opcional: pegarle a /auth/logout si querés invalidar refresh en el server
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
}

export async function getMe() {
  // Requiere token guardado
  return api('/users/me', { method: 'GET' });
}

/* ======================
   Filtros comunes
   ====================== */
function getPublicWishesFilter() {
  return {
    filter: {
      visibility: { _eq: 'public' },
      // status: { _eq: 'published' },
    },
  };
}

/* ======================
   API de dominio
   ====================== */
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

// URL limpia exportada (para mostrar en UI/monitor si querés)
export const DIRECTUS_URL = (() => getBaseUrl())();
